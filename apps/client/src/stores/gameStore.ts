import { create } from 'zustand';
import type { ActionType } from '@7wonders/shared';

interface GameStore {
    // Selection state
    selectedCardId: string | null;
    selectedAction: ActionType | null;
    hoveredCardId: string | null;

    // UI state
    showScoreboard: boolean;
    showSettings: boolean;
    animatingTurn: boolean;
    currentView: 'lobby' | 'game' | 'results';

    // Actions
    setSelectedCard: (cardId: string | null) => void;
    setSelectedAction: (action: ActionType | null) => void;
    setHoveredCard: (cardId: string | null) => void;
    clearSelection: () => void;
    setShowScoreboard: (show: boolean) => void;
    setShowSettings: (show: boolean) => void;
    setAnimatingTurn: (animating: boolean) => void;
    setCurrentView: (view: 'lobby' | 'game' | 'results') => void;
}

export const useGameStore = create<GameStore>((set) => ({
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
    clearSelection: () =>
        set({
            selectedCardId: null,
            selectedAction: null,
        }),
    setShowScoreboard: (show) => set({ showScoreboard: show }),
    setShowSettings: (show) => set({ showSettings: show }),
    setAnimatingTurn: (animating) => set({ animatingTurn: animating }),
    setCurrentView: (view) => set({ currentView: view }),
}));
