import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const RESOURCE_ITEMS = [
    { key: 'coins', icon: '💰', label: 'Coins', color: 'text-yellow-400' },
    { key: 'military', icon: '⚔️', label: 'Military', color: 'text-red-400' },
];
const SCIENCE_ITEMS = [
    { key: 'compass', icon: '🧭', label: 'Compass', color: 'text-emerald-400' },
    { key: 'gear', icon: '⚙️', label: 'Gear', color: 'text-emerald-400' },
    { key: 'tablet', icon: '📜', label: 'Tablet', color: 'text-emerald-400' },
];
const CARD_COLORS = [
    { key: 'BROWN', icon: '🪵', label: 'Raw', color: 'text-amber-600' },
    { key: 'GREY', icon: '⚙️', label: 'Mfg', color: 'text-gray-400' },
    { key: 'BLUE', icon: '🏛️', label: 'Civic', color: 'text-blue-400' },
    { key: 'YELLOW', icon: '💰', label: 'Trade', color: 'text-yellow-500' },
    { key: 'RED', icon: '⚔️', label: 'Mil', color: 'text-red-500' },
    { key: 'GREEN', icon: '🔬', label: 'Sci', color: 'text-emerald-500' },
    { key: 'PURPLE', icon: '👥', label: 'Guild', color: 'text-purple-500' },
];
export function ResourcePanel({ coins, militaryPower, scienceCompass, scienceGear, scienceTablet, builtCardColors, }) {
    const scienceValues = [scienceCompass, scienceGear, scienceTablet];
    const scienceSets = Math.min(...scienceValues);
    const scienceTotal = scienceCompass ** 2 + scienceGear ** 2 + scienceTablet ** 2 + scienceSets * 7;
    return (_jsxs(motion.div, { className: "glass-panel p-3", initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [_jsxs("div", { className: "flex items-center gap-4 mb-2", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-lg", children: "\uD83D\uDCB0" }), _jsx(motion.span, { className: "text-yellow-400 font-bold text-lg font-mono", initial: { scale: 1.3 }, animate: { scale: 1 }, children: coins }, coins)] }), _jsx("div", { className: "w-px h-6 bg-white/10" }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-lg", children: "\u2694\uFE0F" }), _jsx(motion.span, { className: "text-red-400 font-bold text-lg font-mono", initial: { scale: 1.3 }, animate: { scale: 1 }, children: militaryPower }, militaryPower)] }), _jsx("div", { className: "w-px h-6 bg-white/10" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-sm", children: "\uD83E\uDDED" }), _jsx("span", { className: "text-emerald-400 text-sm font-mono", children: scienceCompass })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-sm", children: "\u2699\uFE0F" }), _jsx("span", { className: "text-emerald-400 text-sm font-mono", children: scienceGear })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-sm", children: "\uD83D\uDCDC" }), _jsx("span", { className: "text-emerald-400 text-sm font-mono", children: scienceTablet })] }), scienceTotal > 0 && (_jsxs("span", { className: "text-emerald-300/60 text-[10px]", children: ["=", scienceTotal, "VP"] }))] })] }), _jsx("div", { className: "flex items-center gap-2 flex-wrap", children: CARD_COLORS.map((cc) => {
                    const count = builtCardColors[cc.key] ?? 0;
                    if (count === 0)
                        return null;
                    return (_jsxs("div", { className: "flex items-center gap-0.5", title: `${count} ${cc.label} cards`, children: [_jsx("span", { className: "text-xs", children: cc.icon }), _jsx("span", { className: `text-xs font-mono ${cc.color}`, children: count })] }, cc.key));
                }) })] }));
}
