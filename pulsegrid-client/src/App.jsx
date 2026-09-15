import React, { useEffect } from 'react';
import PulseCanvas from './features/canvas/PulseCanvas';
import websocketClient from './services/websocketClient';

// Import Panels
import TelemetryDashboard from './components/panels/TelemetryDashboard';
import BuilderToolbar from './components/panels/BuilderToolbar';
import ChaosDrawer from './components/panels/ChaosDrawer';

function App() {
  // Connect to the Azure backend when the app loads
  useEffect(() => {
    websocketClient.connect();
    return () => websocketClient.disconnect();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 relative font-sans text-slate-800">
      
      {/* 1. The main interactive map */}
      <PulseCanvas />
      
      {/* 2. Glassmorphic UI Overlays */}
      <TelemetryDashboard />
      <BuilderToolbar />
      <ChaosDrawer />

    </div>
  );
}

export default App;