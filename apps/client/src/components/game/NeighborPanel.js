import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const WONDER_NAMES = {
    ALEXANDRIA: 'Alessandria',
    BABYLON: 'Babilonia',
    EPHESUS: 'Efeso',
    GIZA: 'Giza',
    HALIKARNASSUS: 'Alicarnasso',
    OLYMPIA: 'Olimpia',
    RHODES: 'Rodi',
};
export function NeighborPanel({ direction, neighbor }) {
    if (!neighbor)
        return null;
    const borderSide = direction === 'left'
        ? { borderLeft: '3px solid rgba(56, 189, 248, 0.4)' }
        : { borderRight: '3px solid rgba(251, 113, 133, 0.4)' };
    return (_jsxs(motion.div, { className: "rounded-xl p-3", style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            ...borderSide,
        }, initial: { opacity: 0, x: direction === 'left' ? -20 : 20 }, animate: { opacity: 1, x: 0 }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-xs", children: direction === 'left' ? '⬅️' : '➡️' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-xs font-medium text-white/70 truncate", children: neighbor.isAI ? '🤖 AI' : 'Vicino' }), neighbor.wonderId && (_jsx("div", { className: "text-[9px] text-white/30 truncate", children: WONDER_NAMES[neighbor.wonderId] ?? neighbor.wonderId }))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-1 text-[11px]", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "\uD83D\uDCB0" }), _jsx("span", { className: "text-yellow-400 font-mono", children: neighbor.coins })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "\u2694\uFE0F" }), _jsx("span", { className: "text-red-400 font-mono", children: neighbor.militaryPower })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "\uD83C\uDFD7\uFE0F" }), _jsx("span", { className: "text-blue-400 font-mono", children: neighbor.builtCardsCount })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "\uD83C\uDFDB\uFE0F" }), _jsx("span", { className: "text-amber-400 font-mono", children: neighbor.wonderStagesBuilt })] })] })] }));
}
