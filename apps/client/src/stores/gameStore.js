import { create } from 'zustand';
export const useGameStore = create((set) => ({
    // Selection state
    selectedCardId: null,
    selectedAction: null,
    hoveredCardId: null,
    // UI state
    showScoreboard: false,
    showSettings: false,
    animatingTurn: false,
    currentView: 'lobby',
    // Actions
    setSelectedCard: (cardId) => set({ selectedCardId: cardId }),
    setSelectedAction: (action) => set({ selectedAction: action }),
    setHoveredCard: (cardId) => set({ hoveredCardId: cardId }),
    clearSelection: () => set({
        selectedCardId: null,
        selectedAction: null,
    }),
    setShowScoreboard: (show) => set({ showScoreboard: show }),
    setShowSettings: (show) => set({ showSettings: show }),
    setAnimatingTurn: (animating) => set({ animatingTurn: animating }),
    setCurrentView: (view) => set({ currentView: view }),
}));
