import { create } from 'zustand';

const useEngineStore = create((set, get) => ({
  nodes: {}, 
  edges: {}, 
  
  isConnected: false,
  globalMetrics: {},
  notifications: [],

  setConnectionStatus: (status) => set({ isConnected: status }),

  initializeState: (fullSnapshot) => set({
    nodes: fullSnapshot.nodes || {},
    edges: fullSnapshot.edges || {},
  }),

  applyDelta: (delta) => set((state) => {
    const nextNodes = { ...state.nodes };
    const nextEdges = { ...state.edges };

    // Patch updated/added nodes
    if (delta.nodes) {
      Object.keys(delta.nodes).forEach((id) => {
        nextNodes[id] = { ...nextNodes[id], ...delta.nodes[id] };
      });
    }

    // Patch updated/added edges
    if (delta.edges) {
      Object.keys(delta.edges).forEach((id) => {
        nextEdges[id] = { ...nextEdges[id], ...delta.edges[id] };
      });
    }

    // ADDED: Handle Explicit Deletions
    if (delta.deletedNodes) {
      delta.deletedNodes.forEach((id) => delete nextNodes[id]);
    }
    if (delta.deletedEdges) {
      delta.deletedEdges.forEach((id) => delete nextEdges[id]);
    }

    return { nodes: nextNodes, edges: nextEdges };
  }),

  addNotification: (message) => set((state) => ({
    notifications: [...state.notifications.slice(-9), { id: Date.now(), text: message }]
  })),

  getNodeById: (id) => get().nodes[id],
}));

export default useEngineStore;