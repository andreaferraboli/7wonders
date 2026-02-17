import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { useGameStore } from '@/stores/gameStore';
import type { ActionType, CardColor } from '@7wonders/shared';

interface CardHandProps {
    cards: Array<{
        id: string;
        name?: string;
        epoch?: number;
        color?: CardColor;
    }>;
    onSelectCard: (cardId: string, action: ActionType) => void;
    disabled?: boolean;
}

export function CardHand({ cards, onSelectCard, disabled = false }: CardHandProps) {
    const { selectedCardId, setSelectedCard, clearSelection } = useGameStore();

    const handleCardClick = (cardId: string) => {
        if (disabled) return;
        if (selectedCardId === cardId) {
            clearSelection();
        } else {
            setSelectedCard(cardId);
        }
    };

    const handleAction = (action: ActionType) => {
        if (!selectedCardId) return;
        onSelectCard(selectedCardId, action);
        clearSelection();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40">
            {/* Action buttons */}
            <AnimatePresence>
                {selectedCardId && !disabled && (
                    <motion.div
                        className="flex justify-center gap-3 pb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button
                            id="btn-build"
                            className="btn-success flex items-center gap-2 text-sm"
                            onClick={() => handleAction('BUILD')}
                        >
                            <span>🏗️</span>
                            <span>Build</span>
                        </button>
                        <button
                            id="btn-wonder"
                            className="btn-primary flex items-center gap-2 text-sm"
                            onClick={() => handleAction('WONDER')}
                        >
                            <span>🏛️</span>
                            <span>Wonder</span>
                        </button>
                        <button
                            id="btn-sell"
                            className="btn-danger flex items-center gap-2 text-sm"
                            onClick={() => handleAction('SELL')}
                        >
                            <span>💰</span>
                            <span>Sell (3 coins)</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card fan */}
            <div className="glass-panel rounded-b-none border-b-0 px-4 py-4">
                <div className="flex justify-center items-end gap-2 max-w-4xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {cards.map((card, index) => {
                            // Fan-out rotation
                            const centerIndex = (cards.length - 1) / 2;
                            const rotation = (index - centerIndex) * 3;
                            const yOffset = Math.abs(index - centerIndex) * 4;

                            return (
                                <motion.div
                                    key={card.id}
                                    style={{
                                        rotate: rotation,
                                        y: yOffset,
                                    }}
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, y: yOffset, scale: 1 }}
                                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                >
                                    <Card
                                        cardId={card.id}
                                        name={card.name}
                                        epoch={card.epoch}
                                        color={card.color}
                                        isSelected={selectedCardId === card.id}
                                        isDisabled={disabled}
                                        onClick={() => handleCardClick(card.id)}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {cards.length === 0 && (
                    <div className="text-center py-6 text-white/40 text-sm">
                        Waiting for cards...
                    </div>
                )}
            </div>
        </div>
    );
}
