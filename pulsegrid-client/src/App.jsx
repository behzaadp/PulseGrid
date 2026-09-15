import React, { useEffect } from 'react';
import PulseCanvas from './features/canvas/PulseCanvas';
import websocketClient from './services/websocketClient';

function App() {
  // Connect to the Azure backend when the app loads
  useEffect(() => {
    websocketClient.connect();
    return () => websocketClient.disconnect();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 relative font-sans text-slate-800">
      {/* The main interactive map */}
      <PulseCanvas />
      
      {/* The Glassmorphic panels will go here in Step 4 */}
    </div>
  );
}

export default App;