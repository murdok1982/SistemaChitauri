import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketHook {
  send: (data: string | object) => void;
  isConnected: boolean;
  reconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): WebSocketHook {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        onOpen?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        onClose?.();

        // Intentar reconexión
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          reconnectTimer.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        onError?.(error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts]);

  const send = useCallback((data: string | object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      ws.current.send(message);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { send, isConnected, reconnect };
}
