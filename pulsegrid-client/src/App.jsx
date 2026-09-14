import { useEffect, useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Automatically uses localhost in dev, and Azure in production
    const wsUrl = import.meta.env.VITE_WS_URL;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('Connected to Engine');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev.slice(-4), data]); // Keeps only the last 5 messages
    };

    return () => ws.close();
  }, []);

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-green-400 p-8 font-mono">
      <h1 className="text-4xl font-bold mb-8">PulseGrid Telemetry</h1>
      <div className="bg-black p-6 rounded-lg border border-green-500 w-full max-w-2xl">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            {msg.message || `Heartbeat: ${msg.time}`}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;