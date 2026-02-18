import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { useGameStore } from '@/stores/gameStore';
export function CardHand({ cards, onSelectCard, disabled = false }) {
    const { selectedCardId, setSelectedCard, clearSelection } = useGameStore();
    const handleCardClick = (cardId) => {
        if (disabled)
            return;
        if (selectedCardId === cardId) {
            clearSelection();
        }
        else {
            setSelectedCard(cardId);
        }
    };
    const handleAction = (action) => {
        if (!selectedCardId)
            return;
        onSelectCard(selectedCardId, action);
        clearSelection();
    };
    return (_jsxs("div", { className: "fixed bottom-0 left-0 right-0 z-40", children: [_jsx(AnimatePresence, { children: selectedCardId && !disabled && (_jsxs(motion.div, { className: "flex justify-center gap-3 pb-3", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 }, transition: { duration: 0.2 }, children: [_jsx("button", { id: "btn-build", className: "px-5 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-all hover:scale-105", style: {
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                            }, onClick: () => handleAction('BUILD'), children: "\uD83C\uDFD7\uFE0F Build" }), _jsx("button", { id: "btn-wonder", className: "px-5 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-all hover:scale-105", style: {
                                background: 'linear-gradient(135deg, #D4A574, #CD7F32)',
                                boxShadow: '0 4px 15px rgba(212, 165, 116, 0.4)',
                            }, onClick: () => handleAction('WONDER'), children: "\uD83C\uDFDB\uFE0F Wonder" }), _jsx("button", { id: "btn-sell", className: "px-5 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-all hover:scale-105", style: {
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                            }, onClick: () => handleAction('SELL'), children: "\uD83D\uDCB0 Sell (3 coins)" })] })) }), _jsxs("div", { className: "px-4 py-3 border-t", style: {
                    background: 'linear-gradient(to top, rgba(15,15,35,0.97), rgba(26,26,46,0.92))',
                    borderColor: 'rgba(212, 165, 116, 0.2)',
                    backdropFilter: 'blur(12px)',
                }, children: [_jsx("div", { className: "flex justify-center items-end gap-1 max-w-5xl mx-auto", style: { minHeight: '200px' }, children: _jsx(AnimatePresence, { mode: "popLayout", children: cards.map((card, index) => {
                                // Fan-out rotation
                                const centerIndex = (cards.length - 1) / 2;
                                const rotation = (index - centerIndex) * 4;
                                const yOffset = Math.abs(index - centerIndex) * 6;
                                return (_jsx(motion.div, { style: {
                                        rotate: rotation,
                                        y: yOffset,
                                        marginLeft: index > 0 ? '-15px' : '0',
                                    }, initial: { opacity: 0, y: 60, scale: 0.7 }, animate: { opacity: 1, y: yOffset, scale: 1 }, exit: { opacity: 0, y: -60, scale: 0.7 }, transition: { delay: index * 0.06, duration: 0.35 }, children: _jsx(Card, { cardId: card.id, name: card.name, epoch: card.epoch, isSelected: selectedCardId === card.id, isDisabled: disabled, onClick: () => handleCardClick(card.id) }) }, card.id + '-' + index));
                            }) }) }), cards.length === 0 && (_jsx("div", { className: "text-center py-8 text-white/30 text-sm italic", children: "Waiting for cards..." }))] })] }));
}
