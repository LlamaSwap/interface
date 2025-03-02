import * as React from 'react';
import { useAccount, useChainId, useWalletClient, useSwitchChain, useConfig } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

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
  shouldLog: () => {
    return process.env.NODE_ENV === 'development';
  },

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
 * Message interface for postMessage communication with the iframe
 */
interface EmbeddedMessage {
  key: string;
  type: string;
  payload: any;
}

/**
 * Transaction parameters - can be at root level or in params
 */
interface TransactionParams {
  to: string;
  data?: string;
  value?: string;
  gas?: string;
  chainId?: number;
}

/**
 * Transaction request format
 */
interface TransactionRequest {
  requestId: string;
  method?: string;
  params?: TransactionParams;
  routeId?: string;
}

/**
 * Interface matching the parent provider requirements for the embedded SmolRefuel
 */
interface ParentProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  isConnected(): boolean;
  getAddress(): string | null;
  getChainId(): number | null;
}

const SmolRefuel = (): React.ReactElement => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
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
   * Handle transaction requests
   */
  const handleTransaction = React.useCallback(async (payload: any) => {
    if (!payload.requestId) return;
    
    const txRequest = payload as TransactionRequest;
    const txParams = txRequest.params || txRequest as unknown as TransactionParams;
    
    try {
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }
      
      if (!txParams.to) {
        throw new Error('Missing required parameter: to');
      }
      
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
  }, [walletClient, sendToIframe]);
  
  /**
   * Handle signature requests
   */
  const handleSignature = React.useCallback(async (payload: any) => {
    if (!payload.requestId || !payload.type) return;
    
    try {
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
  }, [parentProvider, sendToIframe]);
  
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