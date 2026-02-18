import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Card, getCardColor } from './Card';
// Group by color for organized display
const COLOR_ORDER = ['#8B4513', '#6B7280', '#2563EB', '#F59E0B', '#DC2626', '#16A34A', '#7C3AED'];
const COLOR_LABELS = {
    '#8B4513': 'Materie Prime',
    '#6B7280': 'Manufatti',
    '#2563EB': 'Civili',
    '#F59E0B': 'Commerciali',
    '#DC2626': 'Militari',
    '#16A34A': 'Scienza',
    '#7C3AED': 'Gilde',
};
export function BuiltCardsArea({ cards }) {
    // Group cards by color
    const grouped = {};
    for (const card of cards) {
        const color = getCardColor(card.id);
        if (!grouped[color])
            grouped[color] = [];
        grouped[color].push(card);
    }
    return (_jsxs("div", { className: "w-full", children: [_jsxs("h3", { className: "text-sm mb-2 flex items-center gap-2", style: {
                    fontFamily: 'Cinzel, Georgia, serif',
                    color: 'rgba(212, 165, 116, 0.6)',
                }, children: ["\uD83C\uDFD7\uFE0F Costruzioni (", cards.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: COLOR_ORDER.map(color => {
                    const colorCards = grouped[color];
                    if (!colorCards || colorCards.length === 0)
                        return null;
                    return (_jsx("div", { className: "flex gap-0.5", children: colorCards.map((card, index) => (_jsx(motion.div, { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.03 }, children: _jsx(Card, { cardId: card.id, compact: true }) }, card.id + '-' + index))) }, color));
                }) }), cards.length === 0 && (_jsx("div", { className: "text-xs italic", style: { color: 'rgba(255,255,255,0.2)' }, children: "Nessuna struttura costruita" }))] }));
}
