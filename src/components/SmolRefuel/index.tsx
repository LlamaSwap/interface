import * as React from 'react';
import { useAccount, useChainId, useWalletClient, useSwitchChain, useConfig, usePublicClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { formatUnits, erc20Abi } from 'viem';
import { getPrice } from '~/queries/useGetPrice';
import { nativeTokens } from '~/components/Aggregator/nativeTokens';

/**
 * SmolRefuel Component
 * 
 * This component implements the "dumb parent" pattern for embedding SmolRefuel in an iframe.
 * It handles communication with the iframe and provides wallet functionality, while all business
 * logic remains in the iframe.
 * 
 * The parent is responsible for:
 * 1. Wallet connection status
 * 2. Transaction signing/sending
 * 3. Message signing
 * 4. Chain switching
 * 
 * Communication happens via postMessage with a standardized message format.
 */

/**
 * Constants
 */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MAX_USD = 20000; // Maximum USD value threshold for transactions and permits
const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
const MAX_UINT256_STRING = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
const APPROVE_SIG = '0x095ea7b3';

/**
 * Logger for embedded SmolRefuel messages
 * Only logs in development environment to avoid console spam in production
 */
const EmbeddedLogger = {
  // Style definitions for console logs
  styles: {
    eventReceived: 'color: #8bc34a; font-weight: bold;',
    eventSent: 'color: #ff9800; font-weight: bold;',
    error: 'color: #f44336; font-weight: bold;',
    data: 'color: #2196f3; font-weight: normal;',
    action: 'color: #9c27b0; font-weight: bold;'
  },

  // Determine if we should log based on environment
  shouldLog: () => process.env.NODE_ENV === 'development',

  // Log an event received from iframe
  logReceived: (type: string, payload: any) => {
    if (!EmbeddedLogger.shouldLog()) return;
    
    console.groupCollapsed(
      `%c📥 INCOMING [${new Date().toLocaleTimeString()}]: ${type}`,
      EmbeddedLogger.styles.eventReceived
    );
    console.log('%cPayload:', EmbeddedLogger.styles.data, payload);
    console.groupEnd();
  },

  // Log an event sent to iframe
  logSent: (type: string, payload: any) => {
    if (!EmbeddedLogger.shouldLog()) return;
    
    console.groupCollapsed(
      `%c📤 OUTGOING [${new Date().toLocaleTimeString()}]: ${type}`,
      EmbeddedLogger.styles.eventSent
    );
    console.log('%cPayload:', EmbeddedLogger.styles.data, payload);
    console.groupEnd();
  },

  // Log an action being taken
  logAction: (action: string, data?: any) => {
    if (!EmbeddedLogger.shouldLog()) return;
    
    console.groupCollapsed(
      `%c🔧 ACTION [${new Date().toLocaleTimeString()}]: ${action}`,
      EmbeddedLogger.styles.action
    );
    if (data) {
      console.log('%cDetails:', EmbeddedLogger.styles.data, data);
    }
    console.groupEnd();
  },

  // Log an error (always log errors regardless of environment)
  logError: (context: string, error: any) => {
    console.error(`SmolRefuel Error (${context}):`, error);
  }
};

function isGasTabActive(){
  return window.location.search.includes("tab=refuel")
}

/**
 * Type definitions
 */
interface TransactionParams {
  to: string;
  data?: string;
  value?: string;
  gas?: string;
  chainId?: number;
}

interface TransactionRequest {
  requestId: string;
  method?: string;
  params?: TransactionParams;
  routeId?: string;
}

/**
 * Security validation result
 */
interface ValidationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Token validation parameters
 */
interface TokenValidationParams {
  tokenAddress: string;
  amount: bigint;
}

/**
 * Types for message payloads from iframe
 */
interface BaseMessagePayload {
  requestId: string;
}

interface SignaturePayload extends BaseMessagePayload {
  type: 'eth_signTypedData' | 'personal_sign';
  message: any; // Can be a string or an array for typed data
  address?: string;
}

interface TransactionRequestPayload extends BaseMessagePayload {
  params?: TransactionParams;
  routeId?: string;
  method?: string;
}

interface ChainSwitchPayload extends BaseMessagePayload {
  chainId: number;
}

interface ResizePayload {
  height: number;
}

const SmolRefuel = (): React.ReactElement => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const { chains } = useConfig();
  const { openConnectModal } = useConnectModal();
  
  // State for security warnings - use single state variable
  const [securityWarning, setSecurityWarning] = React.useState<string | null>(null);
  // Derive showWarning state from securityWarning
  const showWarning = securityWarning !== null;
  
  // Reference to the iframe
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  
  // Base URL for iframe - we communicate chainId via postMessage instead of URL params
  const baseUrl = 'https://smolrefuel.com/embed?partner=llamaswap';
  // const baseUrl = 'http://localhost:5173/embed?partner=llamaswap'
  
  // Helper function to show warning and wait for user review
  const showSecurityWarningAndWait = React.useCallback(async (message: string): Promise<void> => {
    setSecurityWarning(message);
    
    EmbeddedLogger.logAction('Security warning displayed', { message });
    
    // Wait 10 seconds to give user time to review
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Clear the warning - setting to null will automatically hide it
    setSecurityWarning(null);
    
    EmbeddedLogger.logAction('Security warning timeout completed');
  }, []);
  
  // Create a signature-only provider interface
  // This addresses the reviewer's concern by only implementing the methods actually used
  const parentProvider = React.useMemo(() => {
    return {
      async request({ method, params = [] }:{method:any, params:any}) {
        if (!walletClient) {
          throw new Error('Wallet client not available');
        }
        
        // Only allow signature methods
        const ALLOWED_SIGNATURE_METHODS = ['eth_signTypedData', 'personal_sign'];
        
        if (!ALLOWED_SIGNATURE_METHODS.includes(method)) {
          EmbeddedLogger.logError('Security violation', 
            `Method ${method} is not allowed in signature provider`);
          throw new Error(`Method ${method} is not permitted in signature context`);
        }
        
        EmbeddedLogger.logAction('Provider Request', { method, params });
        
        // Handle signature methods with additional verification
        if (method === 'eth_signTypedData') {
          // Verify the typed data content
          if (Array.isArray(params) && params.length > 1) {
            const typedData = params[1];
            
            // Only allow Permit signatures or explicitly recognized types
            if (typedData?.primaryType === 'Permit') {
              // Permit signature is handled and validated elsewhere
              EmbeddedLogger.logAction('Valid Permit signature request', { domain: typedData.domain });
            } else {
              // Block any other types of typed data signing
              EmbeddedLogger.logError('Unsupported typed data signature', { primaryType: typedData?.primaryType });
              throw new Error(`Only Permit signatures are supported for security reasons`);
            }
          } else {
            EmbeddedLogger.logError('Invalid eth_signTypedData format', { params });
            throw new Error('Invalid typed data format');
          }
          
          return await walletClient.signTypedData({
            ...params[1],
            account: params[0],
          });
        } else if (method === 'personal_sign') {
          // Verify personal_sign message content
          if (typeof params[0] === 'string') {
            const message = params[0];
            const expectedLoanMessage = 'I commit to completing the swap on smolrefuel.com after receiving my loan';
            
            if (!message.includes(expectedLoanMessage)) {
              EmbeddedLogger.logError('Unsupported personal signature message', { message });
              throw new Error('Only the loan request signature is permitted');
            }
            
            EmbeddedLogger.logAction('Valid loan request signature', { message });
          } else {
            throw new Error('Invalid message format for personal_sign');
          }
          
          return await walletClient.signMessage({
            message: params[0],
            account: params[1],
          });
        }
        
        throw new Error(`Unsupported method: ${method}`);
      }
    };
  }, [walletClient]);
  
  // Constants
  const MESSAGE_KEY = 'smolrefuel_embedded';
  
  /**
   * Send a message to the iframe
   */
  const sendToIframe = React.useCallback((type: string, payload: any) => {
    if (!iframeRef.current?.contentWindow) return;
    
    iframeRef.current.contentWindow.postMessage({
      key: MESSAGE_KEY,
      type,
      payload
    }, '*');
    
    EmbeddedLogger.logSent(type, payload);
  }, []);
  
  /**
   * Handle iframe initialization
   */
  const handleIframeInitialized = React.useCallback(() => {
    if (!address) return;
    
    const walletPayload = { address, chainId };
    sendToIframe('WALLET_CONNECTED', walletPayload);
  }, [address, chainId, sendToIframe]);
  
  /**
   * Handle chain switching requests
   */
  const handleChainSwitch = React.useCallback(async (payload: ChainSwitchPayload) => {
    if (!payload.chainId || !walletClient) return;
    
    try {
      const switchableChains = chains.map(c => c.id);
      
      // Validate chain is supported
      if (!switchableChains.includes(payload.chainId)) {
        throw new Error(`Chain ${payload.chainId} is not supported`);
      }
      
      // Switch chain
      await switchChain({ chainId: payload.chainId });
      
      // Success response
      sendToIframe('CHAIN_SWITCH_RESPONSE', {
        success: true,
        chainId: payload.chainId
      });
    } catch (error) {
      // Error response
      sendToIframe('CHAIN_SWITCH_RESPONSE', {
        success: false,
        error: (error as Error).message
      });
    }
  }, [chains, walletClient, switchChain, sendToIframe]);
  
  /**
   * Handle iframe resize requests
   */
  const handleResize = React.useCallback((payload: ResizePayload) => {
    if (!payload.height || !iframeRef.current) return;
    
    const newHeight = payload.height + 10; // Buffer to prevent scrollbars
    const finalHeight = Math.max(newHeight, 800); // Minimum height
    iframeRef.current.style.height = `${finalHeight}px`;
  }, []);
  
  /**
   * Get token decimals, properly handling both native tokens and ERC20s
   */
  const getTokenDecimals = React.useCallback(async (tokenAddress: string): Promise<number> => {
    try {
      // If it's a native token, get from our native tokens list
      if (tokenAddress === ZERO_ADDRESS) {
        const nativeToken = nativeTokens.find(t => t.chainId === chainId);
        return nativeToken?.decimals || 18;
      }
      
      // For ERC20 tokens, query the contract using publicClient
      if (publicClient) {
        try {
          const decimals = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'decimals',
          });
          return Number(decimals);
        } catch (err) {
          EmbeddedLogger.logError('Failed to get token decimals', err);
          throw new Error('Failed to get token decimals. Aborting for security reasons.');
        }
      }
      
      throw new Error('Public client not available. Cannot verify token decimals.');
    } catch (error) {
      EmbeddedLogger.logError('Error getting token decimals', error);
      throw new Error('Failed to process token decimals. Aborting for security reasons.');
    }
  }, [chainId, publicClient]);
  
  /**
   * Validate token value in USD
   */
  const validateTokenValue = React.useCallback(async ({ tokenAddress, amount }: TokenValidationParams): Promise<ValidationResult> => {
    try {
      const chain = chains.find(c => c.id === chainId)?.name?.toLowerCase();
      if (!chain) return { 
        safe: false, 
        reason: 'Chain information not available. Cannot verify transaction safety.'
      };

      // Check for unlimited approvals
      if (amount === MAX_UINT256) {
        return { 
          safe: false, 
          reason: 'Unlimited token approval requested - this gives complete access to your tokens' 
        };
      }

      // Check USD value
      const decimals = await getTokenDecimals(tokenAddress);
      const priceData = await getPrice({ 
        chain, 
        fromToken: tokenAddress, 
        toToken: ZERO_ADDRESS 
      });

      if (priceData.fromTokenPrice && priceData.fromTokenPrice > 0) {
        const valueInUSD = Number(formatUnits(amount, decimals)) * priceData.fromTokenPrice;
        if (valueInUSD > MAX_USD) {
          return { safe: false, reason: `Transaction value of $${valueInUSD.toFixed(2)} exceeds maximum of $${MAX_USD}` };
        }
      }
      return { safe: true };
    } catch (error) {
      EmbeddedLogger.logError('Token value validation error', error);
      return { 
        safe: false, 
        reason: 'Validation failed due to an unexpected error. Aborting for security reasons.' 
      };
    }
  }, [chainId, chains, getTokenDecimals]);

  /**
   * Validate if a transaction is potentially malicious
   */
  const validateTransaction = React.useCallback(async (txParams: TransactionParams): Promise<ValidationResult> => {
    try {      
      // Check for ERC20 approvals
      if (txParams.data?.startsWith(APPROVE_SIG)) {
        const amountBigInt = BigInt('0x' + txParams.data.slice(10).slice(64, 128));

        // Validate token approval
        return await validateTokenValue({
          tokenAddress: txParams.to,
          amount: amountBigInt
        });
      }
      
      // Check native token sends
      if (txParams.value && BigInt(txParams.value) > BigInt(0)) {
        // Validate native token value
        return await validateTokenValue({
          tokenAddress: ZERO_ADDRESS,
          amount: BigInt(txParams.value)
        });
      }
      
      return { 
        safe: false, 
        reason: 'Unknown transaction type. Only ERC20 approvals and native token transfers are supported.'
      };
    } catch (error) {
      EmbeddedLogger.logError('Validation error', error);
      return { 
        safe: false, 
        reason: 'Transaction validation failed due to an unexpected error. Aborting for security reasons.' 
      };
    }
  }, [validateTokenValue]);

  /**
   * Handle transaction requests
   */
  const handleTransaction = React.useCallback(async (payload: TransactionRequestPayload) => {
    if (!payload.requestId) return;
    
    // Prevent transaction processing if gas tab is not active
    if (!isGasTabActive()) {
      sendToIframe('TRANSACTION_RESPONSE', {
        requestId: payload.requestId,
        error: 'Transaction rejected: Gas refuel tab is not active',
        success: false,
        routeId: payload.routeId
      });
      EmbeddedLogger.logError('Security check', 'Transaction attempted while gas refuel tab not active');
      return;
    }
    
    const txRequest = payload as TransactionRequest;
    const txParams = txRequest.params || txRequest as unknown as TransactionParams;
    
    EmbeddedLogger.logAction('Processing transaction request', { txParams });
    
    try {
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }
      
      if (!txParams.to) {
        throw new Error('Missing required parameter: to');
      }
      
      // Validate transaction for security
      const validation = await validateTransaction(txParams);
      
      if (!validation.safe) {
        EmbeddedLogger.logError('Transaction security validation failed', validation.reason);
        throw new Error(`${validation.reason}`);
      }
      
      // Extra security check for native token transfers to contracts with data
      if (txParams.value && BigInt(txParams.value) > BigInt(0) && 
          txParams.data && txParams.data !== '0x' && txParams.data !== '') {
        
        // Check if destination is a contract
        try {
          if (publicClient && txParams.to) {
            const isContract = await publicClient.getBytecode({ 
              address: txParams.to as `0x${string}` 
            });
            
            // If sending native tokens to a contract with data, warn the user
            if (isContract) {
              // Show warning in the parent UI and wait for user to have time to review
              await showSecurityWarningAndWait(
                'Please be extra careful with this transaction and review it. This native token transfer includes contract interaction data.'
              );
            }
          }
        } catch (err) {
          // If we can't determine if it's a contract, show a warning
          EmbeddedLogger.logError('Contract check failed', err);
          await showSecurityWarningAndWait(
            'Unable to verify if this is a contract address. Please proceed with caution.'
          );
        }
      }
      
      EmbeddedLogger.logAction('Transaction passed security validation', { txParams });
      
      // Execute transaction
      // Create transaction parameters
      const txOptions: any = {
        to: txParams.to as `0x${string}`,
        value: txParams.value ? BigInt(txParams.value) : undefined,
        data: txParams.data as `0x${string}` || '0x'
      };
      
      // Only set gas if explicitly provided, otherwise let wallet estimate
      if (txParams.gas) {
        txOptions.gas = BigInt(txParams.gas);
      }
      
      // Send the transaction
      const txHash = await walletClient.sendTransaction(txOptions);
      
      // Success response
      sendToIframe('TRANSACTION_RESPONSE', {
        requestId: txRequest.requestId,
        txHash,
        routeId: txRequest.routeId,
        success: true
      });
    } catch (error) {
      // Error response
      sendToIframe('TRANSACTION_RESPONSE', {
        requestId: txRequest.requestId,
        error: (error as Error).message,
        success: false,
        routeId: txRequest.routeId
      });
    }
  }, [walletClient, sendToIframe, validateTransaction, EmbeddedLogger, publicClient, showSecurityWarningAndWait]);
  
  /**
   * Handle signature requests - add validation for permit signatures
   */
  const handleSignature = React.useCallback(async (payload: SignaturePayload) => {
    if (!payload.requestId || !payload.type) return;
    
    // Prevent signature processing if gas tab is not active
    if (!isGasTabActive()) {
      sendToIframe('SIGN_RESPONSE', {
        requestId: payload.requestId,
        error: 'Signature rejected: Gas refuel tab is not active',
        success: false
      });
      EmbeddedLogger.logError('Security check', 'Signature attempted while gas refuel tab not active');
      return;
    }
    
    try {
      // Check for permits in EIP-712 typed data and validate
      if (payload.type === 'eth_signTypedData' && Array.isArray(payload.message) && payload.message.length > 1) {
        const typedData = payload.message[1];

        if (typedData?.primaryType === 'Permit' && typedData?.message?.value) {
          const tokenAddress = typedData.domain?.verifyingContract;
          const value = BigInt(typedData.message.value.toString());

          // Validate token approval
          if (tokenAddress) {
            const validation = await validateTokenValue({
              tokenAddress,
              amount: value
            });

            if (!validation.safe) {
              EmbeddedLogger.logError('Permit signature validation failed', validation.reason);
              throw new Error(validation.reason);
            }
          } else {
            // Handle case where contract address isn't in the domain (unusual but possible)
            // Only check for unlimited approvals as a fallback
            if (value.toString() === MAX_UINT256_STRING) {
              const reason = 'Unlimited token permit requested - this gives complete access to your tokens';
              EmbeddedLogger.logError('Permit signature validation failed', reason);
              throw new Error(reason);
            }
          }
          
          EmbeddedLogger.logAction('Permit signature passed security validation', { 
            tokenAddress, 
            value: value.toString() 
          });
        }
      }
      
      // Add verification and warnings for unverified signature types
      let isVerifiedSignature = false;
      let warningMessage = '';
      
      // Check if we're dealing with a known, verifiable signature type
      if (payload.type === 'eth_signTypedData') {
        if (Array.isArray(payload.message) && payload.message.length > 1) {
          const typedData = payload.message[1];
          if (typedData?.primaryType === 'Permit') {
            isVerifiedSignature = true;
          } else {
            warningMessage = `Warning: Unverified signature type (${typedData?.primaryType || 'unknown'}). Only proceed if you trust this application.`;
          }
        } else {
          warningMessage = 'Warning: Unverified typed data format. Only proceed if you trust this application.';
        }
      } else if (payload.type === 'personal_sign') {
        // Check for the specific loan request message format
        const expectedLoanMessage = 'I commit to completing the swap on smolrefuel.com after receiving my loan';
        
        if (typeof payload.message === 'string' && payload.message.includes(expectedLoanMessage)) {
          // This is the valid loan request signature
          isVerifiedSignature = true;
          EmbeddedLogger.logAction('Valid loan request signature detected', { message: payload.message });
        } else {
          warningMessage = 'Warning: Unrecognized personal signature. Only the loan request signature is permitted.';
        }
      }
      
      // Send warning if not a verified signature type
      if (!isVerifiedSignature && warningMessage) {
        sendToIframe('SIGNATURE_WARNING', {
          requestId: payload.requestId,
          message: warningMessage
        });
      }
      
      // Process the signature request
      let signature;
      
      if (payload.type === 'eth_signTypedData') {
        if (Array.isArray(payload.message)) {
          signature = await parentProvider.request({
            method: 'eth_signTypedData',
            params: payload.message
          });
        } else {
          signature = await parentProvider.request({
            method: 'eth_signTypedData',
            params: [payload.address, payload.message]
          });
        }
      } else if (payload.type === 'personal_sign') {
        signature = await parentProvider.request({
          method: 'personal_sign',
          params: [payload.message, payload.address]
        });
      }
      
      // Success response
      sendToIframe('SIGN_RESPONSE', {
        requestId: payload.requestId,
        signature
      });
    } catch (error) {
      // Error response
      sendToIframe('SIGN_RESPONSE', {
        requestId: payload.requestId,
        error: (error as Error).message
      });
    }
  }, [parentProvider, sendToIframe, validateTokenValue]);
  
  /**
   * Handle wallet connection requests from the iframe
   * Uses RainbowKit's openConnectModal to trigger the wallet connection dialog
   */
  const handleConnectWalletRequest = React.useCallback(() => {
    // Open the RainbowKit connect modal
    if (openConnectModal) {
      openConnectModal();
    }
  }, [openConnectModal]);
  
  // Set up message handlers for the iframe
  React.useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    
    // Message handler map with proper type mapping
    const messageHandlers = {
      'IFRAME_INITIALIZED': handleIframeInitialized,
      'SWITCH_CHAIN_REQUEST': (payload: ChainSwitchPayload) => handleChainSwitch(payload),
      'RESIZE_HEIGHT': (payload: ResizePayload) => handleResize(payload),
      'TRANSACTION_REQUEST': (payload: TransactionRequestPayload) => handleTransaction(payload),
      'SIGN_REQUEST': (payload: SignaturePayload) => handleSignature(payload),
      'CONNECT_WALLET_REQUEST': handleConnectWalletRequest
    } as const;
    
    const handleMessage = async (event: MessageEvent) => {
      // Origin validation for security - using specific domain and not wildcarding subdomains
      // Also using NODE_ENV !== 'development' to be safer in unknown environments
      if (process.env.NODE_ENV !== 'development' && 
          event.origin !== 'https://smolrefuel.com') {
        EmbeddedLogger.logError('Invalid Origin', `Message from ${event.origin} rejected`);
        return;
      }
      
      const { key, type, payload } = event.data || {};
      
      // Only process messages with the correct key
      if (key !== MESSAGE_KEY || !type) return;
      
      // Security check: Block all message processing when gas tab is not active
      // This prevents any wallet operations when user isn't looking at the gas tab
      if (!isGasTabActive()) {
        EmbeddedLogger.logError('Security check', `Blocked ${type} message because gas refuel tab is not active`);
        return;
      }
      
      EmbeddedLogger.logReceived(type, payload);
      
      try {
        // Route message to appropriate handler
        const handler = messageHandlers[type as keyof typeof messageHandlers];
        if (handler) {
          await handler(payload as any);
        } else {
          EmbeddedLogger.logError('Unknown Message Type', { type, payload });
        }
      } catch (error) {
        EmbeddedLogger.logError('Message Handling', error);
      }
    };
    
    // Setup event listener
    window.addEventListener('message', handleMessage);
    
    // Initial wallet connection notification
    if (address) {
      handleIframeInitialized();
    }
    
    // Cleanup
    return () => window.removeEventListener('message', handleMessage);
  }, [
    address, 
    chainId, 
    handleIframeInitialized, 
    handleChainSwitch, 
    handleResize, 
    handleTransaction, 
    handleSignature,
    handleConnectWalletRequest
  ]);
  
  // Update iframe when wallet or chain changes
  React.useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    
    // Notify iframe of wallet connection/disconnection
    if (address) {
      sendToIframe('WALLET_CONNECTED', { address, chainId });
    } else {
      sendToIframe('WALLET_DISCONNECTED', { address: '' });
    }
    
    // Always notify of chain state
    sendToIframe('CHAIN_CHANGED', { chainId });
  }, [address, chainId, sendToIframe]);

  // Component lifecycle logging - only in development
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    EmbeddedLogger.logAction('SmolRefuel Component Mounted');
    return () => EmbeddedLogger.logAction('SmolRefuel Component Unmounted');
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Security warning overlay - shadcn-inspired design */}
      {showWarning && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'hsl(0, 0%, 100%)',
            color: 'hsl(240, 10%, 3.9%)',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '28rem',
            border: '1px solid hsl(240, 5%, 84%)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'hsl(0, 84%, 60%)' }}>
                  <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 16V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  lineHeight: 1.6
                }}>Security Warning</h3>
              </div>
              
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.5,
                marginBottom: '1.25rem',
                color: 'hsl(240, 3.8%, 46.1%)'
              }}>
                {securityWarning}
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  backgroundColor: 'hsl(210, 20%, 95%)',
                  color: 'hsl(210, 30%, 40%)',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  Auto-proceeding shortly...
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'hsl(220, 13%, 91%)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: '0%',
                    backgroundColor: 'hsl(210, 70%, 50%)',
                    borderRadius: 'inherit',
                    animationName: 'progressFill',
                    animationDuration: '10s',
                    animationTimingFunction: 'linear',
                    animationFillMode: 'forwards',
                    transformOrigin: 'left',
                  }} />
                </div>
              </div>
              
              <style jsx>{`
                @keyframes progressFill {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>
            </div>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={baseUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default SmolRefuel; 
