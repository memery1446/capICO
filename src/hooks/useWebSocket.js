// src/hooks/useWebSocket.js
import { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const useWebSocket = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const client = new W3CWebSocket(url);

    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setData(data);
    };

    return () => {
      client.close();
    };
  }, [url]);

  return data;
};

export default useWebSocket;

