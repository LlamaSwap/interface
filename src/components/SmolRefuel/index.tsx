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

interface ParentProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  isConnected(): boolean;
  getAddress(): string | null;
  getChainId(): number | null;
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

const SmolRefuel = (): React.ReactElement => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const { chains } = useConfig();
  const { openConnectModal } = useConnectModal();
  
  // Reference to the iframe
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  
  // Base URL for iframe - we communicate chainId via postMessage instead of URL params
  const baseUrl = 'https://smolrefuel.com/embed?partner=llamaswap';
  // const baseUrl = 'http://localhost:5173/embed?partner=llamaswap'
  
  // Create a provider interface for the iframe
  const parentProvider = React.useMemo<ParentProvider>(() => {
    return {
      async request({ method, params = [] }) {
        if (!walletClient) {
          throw new Error('Wallet client not available');
        }
        
        EmbeddedLogger.logAction('Provider Request', { method, params });
        
        // Handle different wallet methods
        switch (method) {
          case 'eth_requestAccounts':
            return address ? [address] : [];
            
          case 'eth_accounts':
            return address ? [address] : [];
            
          case 'eth_chainId':
            return `0x${chainId.toString(16)}`;
            
          case 'personal_sign':
            return await walletClient.signMessage({
              message: params[0],
              account: params[1],
            });
            
          case 'eth_signTypedData':
            return await walletClient.signTypedData({
              ...params[1],
              account: params[0],
            });
            
          case 'eth_sendTransaction':
            return await walletClient.sendTransaction({
              ...params[0],
            });
            
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      },
      
      isConnected() {
        return isConnected;
      },
      
      getAddress() {
        return address || null;
      },
      
      getChainId() {
        return chainId;
      }
    };
  }, [address, chainId, walletClient, isConnected]);
  
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
  const handleChainSwitch = React.useCallback(async (payload: any) => {
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
  const handleResize = React.useCallback((payload: any) => {
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
          return 18; // Default to 18 if contract call fails
        }
      }
      
      return 18; // Default fallback
    } catch (error) {
      EmbeddedLogger.logError('Error getting token decimals', error);
      return 18; // Default fallback
    }
  }, [chainId, publicClient]);
  
  /**
   * Validate token value in USD
   */
  const validateTokenValue = React.useCallback(async ({ tokenAddress, amount }: TokenValidationParams): Promise<ValidationResult> => {
    try {
      const chain = chains.find(c => c.id === chainId)?.name?.toLowerCase();
      if (!chain) return { safe: true };

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
      return { safe: true };
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
      
      return { safe: true };
    } catch (error) {
      EmbeddedLogger.logError('Validation error', error);
      return { safe: true };
    }
  }, [validateTokenValue]);

  /**
   * Handle transaction requests
   */
  const handleTransaction = React.useCallback(async (payload: any) => {
    if (!payload.requestId) return;
    
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
  }, [walletClient, sendToIframe, validateTransaction, EmbeddedLogger]);
  
  /**
   * Handle signature requests - add validation for permit signatures
   */
  const handleSignature = React.useCallback(async (payload: any) => {
    if (!payload.requestId || !payload.type) return;
    
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
      
      // Process the signature request
      let signature;
      
      if (payload.type === 'eth_signTypedData') {
        if (Array.isArray(payload.message)) {
          signature = await parentProvider.request({
            method: payload.type,
            params: payload.message
          });
        } else {
          signature = await parentProvider.request({
            method: payload.type,
            params: [payload.address, payload.message]
          });
        }
      } else {
        signature = await parentProvider.request({
          method: payload.type,
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
    
    // Message handler map for cleaner code organization
    const messageHandlers: Record<string, (payload: any) => void> = {
      'IFRAME_INITIALIZED': handleIframeInitialized,
      'SWITCH_CHAIN_REQUEST': handleChainSwitch,
      'RESIZE_HEIGHT': handleResize,
      'TRANSACTION_REQUEST': handleTransaction,
      'SIGN_REQUEST': handleSignature,
      'CONNECT_WALLET_REQUEST': handleConnectWalletRequest
    };
    
    const handleMessage = async (event: MessageEvent) => {
      // Origin validation for security
      if (process.env.NODE_ENV === 'production' && 
          !event.origin.match(/^https:\/\/(.*\.)?smolrefuel\.com$/)) {
        EmbeddedLogger.logError('Invalid Origin', `Message from ${event.origin} rejected`);
        return;
      }
      
      const { key, type, payload } = event.data || {};
      
      // Only process messages with the correct key
      if (key !== MESSAGE_KEY || !type) return;
      
      EmbeddedLogger.logReceived(type, payload);
      
      try {
        // Route message to appropriate handler
        const handler = messageHandlers[type];
        if (handler) {
          await handler(payload);
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
