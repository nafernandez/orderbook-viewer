'use client';

import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  restartToken?: number;
}

export function useWebSocket<T = unknown>(
  url: string | null,
  onMessage: (data: T) => void,
  options: UseWebSocketOptions = {}
) {
  const {
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 1000,
    restartToken = 0,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const reconnectCountRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!url) {
      return;
    }
    
    let isCurrentConnection = true;

    const connectWebSocket = () => {
      if (!isCurrentConnection) return;

      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!isCurrentConnection) {
          ws.close(1000, 'Connection superseded');
          return;
        }
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;
        onOpenRef.current?.();
      };

      ws.onmessage = (event) => {
        if (!isCurrentConnection) return;
        
        try {
          const data: T = JSON.parse(event.data);
          onMessageRef.current(data);
        } catch (err) {
          console.error('Error al parsear mensaje:', err);
        }
      };

      ws.onerror = (event) => {
        if (!isCurrentConnection) return;
        onErrorRef.current?.(event);
      };

      ws.onclose = () => {
        if (!isCurrentConnection) return;
        setIsConnected(false);
        wsRef.current = null;
        onCloseRef.current?.();

        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          const delay = reconnectInterval * reconnectCountRef.current;

          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isCurrentConnection) {
              connectWebSocket();
            }
          }, delay);
        }
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      isCurrentConnection = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, [url, reconnect, reconnectAttempts, reconnectInterval, restartToken]);

  return {
    isConnected,
    error,
  };
}
