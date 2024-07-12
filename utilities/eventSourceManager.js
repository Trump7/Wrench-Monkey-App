import EventSource from 'react-native-event-source';

let eventSource = null;

export const initializeEventSource = (url, handlers) => {
  if (!eventSource) {
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log('EventSource connection opened');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (handlers.message) {
        handlers.message(data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      if (handlers.error) {
        handlers.error(error);
      }
      eventSource.close();
    };

    if (handlers.history) {
      eventSource.addEventListener('history', (event) => {
        const data = JSON.parse(event.data);
        handlers.history(data);
      });
    }

    if (handlers.tools) {
      eventSource.addEventListener('tools', (event) => {
        const data = JSON.parse(event.data);
        handlers.tools(data);
      });
    }

    if (handlers.status) {
      eventSource.addEventListener('status', (event) => {
        const data = JSON.parse(event.data);
        handlers.status(data);
      });
    }
  }
};

export const closeEventSource = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};
