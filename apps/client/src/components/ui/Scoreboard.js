import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
const SCORE_CATEGORIES = [
    { key: 'military', label: 'Military', icon: '⚔️', color: 'text-red-400' },
    { key: 'coins', label: 'Treasury', icon: '💰', color: 'text-yellow-400' },
    { key: 'wonder', label: 'Wonder', icon: '🏛️', color: 'text-amber-400' },
    { key: 'buildings', label: 'Buildings', icon: '🏗️', color: 'text-blue-400' },
    { key: 'science', label: 'Science', icon: '🔬', color: 'text-emerald-400' },
];
export function Scoreboard({ players, currentSessionId, visible, onClose }) {
    const playerArray = Array.from(players.values());
    return (_jsx(AnimatePresence, { children: visible && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-40", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose }), _jsxs(motion.div, { id: "scoreboard-panel", className: "fixed inset-x-4 top-20 bottom-20 mx-auto max-w-3xl glass-panel p-6 z-50 overflow-y-auto", initial: { opacity: 0, y: 30, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 30, scale: 0.95 }, transition: { duration: 0.3, ease: 'easeOut' }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "font-display text-2xl font-bold text-ancient-gold", children: "\uD83D\uDCCA Scoreboard" }), _jsx("button", { id: "btn-close-scoreboard", className: "w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors", onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/10", children: [_jsx("th", { className: "text-left py-3 px-2 text-white/50 font-medium", children: "Player" }), SCORE_CATEGORIES.map(cat => (_jsx("th", { className: "text-center py-3 px-2", children: _jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [_jsx("span", { className: "text-base", children: cat.icon }), _jsx("span", { className: `text-[10px] ${cat.color}`, children: cat.label })] }) }, cat.key))), _jsx("th", { className: "text-center py-3 px-2 text-ancient-gold font-bold", children: "Total" })] }) }), _jsx("tbody", { children: playerArray.map((player, index) => {
                                            const isCurrentPlayer = player.sessionId === currentSessionId;
                                            const scienceTotal = player.scienceCompass + player.scienceGear + player.scienceTablet;
                                            const militaryScore = player.militaryTokens.reduce((sum, t) => {
                                                const val = parseInt(t);
                                                return isNaN(val) ? sum : sum + val;
                                            }, 0);
                                            return (_jsxs(motion.tr, { className: `
                          border-b border-white/5
                          ${isCurrentPlayer ? 'bg-ancient-gold/5' : ''}
                          hover:bg-white/5 transition-colors
                        `, initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.05 }, children: [_jsx("td", { className: "py-3 px-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `
                              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                              ${isCurrentPlayer
                                                                        ? 'bg-gradient-to-br from-ancient-gold to-ancient-bronze text-dark-marble'
                                                                        : 'bg-white/10 text-white/70'}
                            `, children: player.isAI ? '🤖' : `P${player.position + 1}` }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium text-sm", children: [isCurrentPlayer ? 'You' : `Player ${player.position + 1}`, player.isAI && _jsx("span", { className: "text-yellow-400 text-xs ml-1", children: "(AI)" })] }), _jsx("div", { className: "text-[10px] text-white/40", children: player.wonderId
                                                                                ? player.wonderId.charAt(0) + player.wonderId.slice(1).toLowerCase()
                                                                                : '—' })] })] }) }), _jsx("td", { className: "text-center py-3 px-2 text-red-300 font-mono", children: militaryScore }), _jsx("td", { className: "text-center py-3 px-2 text-yellow-300 font-mono", children: Math.floor(player.coins / 3) }), _jsx("td", { className: "text-center py-3 px-2 text-amber-300 font-mono", children: player.wonderStagesBuilt * 3 }), _jsx("td", { className: "text-center py-3 px-2 text-blue-300 font-mono", children: player.cityCards.length }), _jsx("td", { className: "text-center py-3 px-2 text-emerald-300 font-mono", children: scienceTotal }), _jsx("td", { className: "text-center py-3 px-2", children: _jsx("span", { className: "text-ancient-gold font-bold text-base", children: militaryScore + Math.floor(player.coins / 3) + player.wonderStagesBuilt * 3 + scienceTotal }) })] }, player.sessionId));
                                        }) })] }) }), _jsx("div", { className: "mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3", children: playerArray.map((player) => {
                                const isCurrentPlayer = player.sessionId === currentSessionId;
                                if (player.scienceCompass === 0 && player.scienceGear === 0 && player.scienceTablet === 0)
                                    return null;
                                return (_jsxs("div", { className: `glass-panel p-3 ${isCurrentPlayer ? 'gold-border' : ''}`, children: [_jsxs("div", { className: "text-xs font-medium mb-2", children: [isCurrentPlayer ? 'You' : `P${player.position + 1}`, " \u2014 Science"] }), _jsxs("div", { className: "flex gap-3 text-sm", children: [_jsxs("span", { title: "Compass", children: ["\uD83E\uDDED ", player.scienceCompass] }), _jsxs("span", { title: "Gear", children: ["\u2699\uFE0F ", player.scienceGear] }), _jsxs("span", { title: "Tablet", children: ["\uD83D\uDCDC ", player.scienceTablet] })] })] }, player.sessionId));
                            }) }), _jsx("div", { className: "mt-4 text-[10px] text-white/30 text-center", children: "Scores are estimated mid-game. Final scoring includes guilds, commerce bonuses, and exact science calculations." })] })] })) }));
}
