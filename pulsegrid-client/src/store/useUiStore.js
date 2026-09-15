import { create } from 'zustand';

const useUiStore = create((set) => ({
  selectedNodeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id }),
}));

export default useUiStore;