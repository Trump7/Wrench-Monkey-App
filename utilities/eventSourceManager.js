import EventSource from 'react-native-event-source';
import config from '../config';

const eventSourceManager = (setStatus, setTools, setHistory) => {
  let eventSource = new EventSource(`${config.apiURL}/stream`);

  const setupEventSource = () => {
    eventSource.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === 'status') {
        setStatus(parsedData.data);
      } else if (parsedData.type === 'tools') {
        setTools(parsedData.data);
      } else if (parsedData.type === 'history') {
        setHistory(parsedData.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);

      if (eventSource.readyState === EventSource.CLOSED || eventSource.readyState === EventSource.CONNECTING) {
        console.log('Reconnecting EventSource...');
        eventSource.close();

        // Reconnect after a delay
        setTimeout(() => {
          eventSource = new EventSource(`${config.apiURL}/stream`);
          setupEventSource();
        }, 3000);
      }
    };
  };

  setupEventSource();

  return () => {
    eventSource.close();
  };
};

export { eventSourceManager };
