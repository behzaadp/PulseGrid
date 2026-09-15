import { create } from 'zustand';

const useEngineStore = create((set, get) => ({
  // --- Core Topology State ---
  nodes: {}, // Map of { 'node-id': nodeSnapshot }
  edges: {}, // Map of { 'edge-id': edgeSnapshot }
  
  // --- Connection & Global State ---
  isConnected: false,
  globalMetrics: {},
  notifications: [],

  // --- Actions ---
  
  setConnectionStatus: (status) => set({ isConnected: status }),

  /**
   * Used when a client first connects or loads a new template
   */
  initializeState: (fullSnapshot) => set({
    nodes: fullSnapshot.nodes || {},
    edges: fullSnapshot.edges || {},
  }),

  /**
   * Applies the lightweight 10Hz diffs to the existing state.
   * By shallow-copying only what changed, React avoids re-rendering the whole canvas.
   */
  applyDelta: (delta) => set((state) => {
    const nextNodes = { ...state.nodes };
    const nextEdges = { ...state.edges };

    // Patch nodes
    if (delta.nodes) {
      Object.keys(delta.nodes).forEach((id) => {
        nextNodes[id] = { ...nextNodes[id], ...delta.nodes[id] };
      });
    }

    // Patch edges
    if (delta.edges) {
      Object.keys(delta.edges).forEach((id) => {
        nextEdges[id] = { ...nextEdges[id], ...delta.edges[id] };
      });
    }

    return { nodes: nextNodes, edges: nextEdges };
  }),

  /**
   * Adds system alerts to a rolling log
   */
  addNotification: (message) => set((state) => ({
    notifications: [...state.notifications.slice(-9), { id: Date.now(), text: message }]
  })),

  /**
   * Helper to grab a specific node's data (used inside individual React components)
   */
  getNodeById: (id) => get().nodes[id],
}));

export default useEngineStore;