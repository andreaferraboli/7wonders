import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
const RESOURCE_ICONS = {
    WOOD: '🪵',
    STONE: '🪨',
    CLAY: '🧱',
    ORE: '⛏️',
    GLASS: '🔮',
    PAPYRUS: '📜',
    LOOM: '🧶',
};
const COLOR_LABELS = {
    BROWN: { label: 'Raw Material', icon: '🪵' },
    GREY: { label: 'Manufactured Good', icon: '⚙️' },
    BLUE: { label: 'Civilian', icon: '🏛️' },
    YELLOW: { label: 'Commercial', icon: '💰' },
    RED: { label: 'Military', icon: '⚔️' },
    GREEN: { label: 'Scientific', icon: '🔬' },
    PURPLE: { label: 'Guild', icon: '👥' },
    BLACK: { label: 'City', icon: '🌑' },
};
export function CardTooltip({ cardId, name, color = 'BLUE', epoch, cost, effects, position, visible, }) {
    const colorInfo = COLOR_LABELS[color];
    const displayName = name ?? cardId.replace(/_/g, ' ').replace(/\d+P$/i, '');
    return (_jsx(AnimatePresence, { children: visible && (_jsxs(motion.div, { id: `tooltip-${cardId}`, className: "tooltip w-64 p-0 overflow-hidden", style: {
                left: position?.x ?? 0,
                top: position?.y ?? 0,
            }, initial: { opacity: 0, scale: 0.9, y: 5 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 5 }, transition: { duration: 0.15 }, children: [_jsxs("div", { className: `px-3 py-2 bg-gradient-to-r from-card-${color.toLowerCase()} to-card-${color.toLowerCase()}/80`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-display text-sm font-bold text-white truncate", children: displayName }), _jsx("span", { className: "text-xs opacity-75", children: colorInfo.icon })] }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsx("span", { className: "text-[10px] text-white/70", children: colorInfo.label }), epoch && (_jsxs("span", { className: "text-[10px] text-white/60", children: ["\u2022 Age ", epoch] }))] })] }), cost && (cost.coins || cost.resources) && (_jsxs("div", { className: "px-3 py-2 border-b border-white/10", children: [_jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-wider mb-1", children: "Cost" }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [cost.coins && cost.coins > 0 && (_jsxs("span", { className: "flex items-center gap-1 text-xs text-yellow-300", children: ["\uD83D\uDCB0 ", cost.coins] })), cost.resources &&
                                    Object.entries(cost.resources).map(([res, qty]) => (_jsxs("span", { className: "flex items-center gap-0.5 text-xs", children: [RESOURCE_ICONS[res] ?? res, " ", qty] }, res)))] })] })), effects && effects.length > 0 && (_jsxs("div", { className: "px-3 py-2", children: [_jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-wider mb-1", children: "Effects" }), _jsx("ul", { className: "space-y-0.5", children: effects.map((effect, i) => (_jsxs("li", { className: "text-xs text-white/80 flex items-start gap-1.5", children: [_jsx("span", { className: "text-ancient-gold mt-0.5 text-[8px]", children: "\u25B8" }), effect] }, i))) })] })), !cost?.coins && !cost?.resources && (_jsx("div", { className: "px-3 py-2 border-b border-white/10", children: _jsx("span", { className: "text-[10px] text-emerald-400", children: "\u2713 Free to build" }) }))] })) }));
}
