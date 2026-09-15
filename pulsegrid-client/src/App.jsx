import React, { useEffect } from 'react';
import PulseCanvas from './features/canvas/PulseCanvas';
import websocketClient from './services/websocketClient';

import TelemetryDashboard from './components/panels/TelemetryDashboard';
import BuilderToolbar from './components/panels/BuilderToolbar';
import NodeInspector from './components/panels/NodeInspector'; // <-- Changed here

function App() {
  useEffect(() => {
    websocketClient.connect();
    return () => websocketClient.disconnect();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 relative font-sans text-slate-800">
      <PulseCanvas />
      <TelemetryDashboard />
      <BuilderToolbar />
      <NodeInspector /> {/* <-- Changed here */}
    </div>
  );
}

export default App;