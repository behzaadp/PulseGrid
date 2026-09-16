import { create } from 'zustand';

const useUiStore = create((set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null })
}));

export default useUiStore;