import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const CATEGORY_CONFIG = [
    { key: 'military', label: 'Military', icon: '⚔️', color: 'text-red-400' },
    { key: 'treasury', label: 'Treasury', icon: '💰', color: 'text-yellow-400' },
    { key: 'wonder', label: 'Wonder', icon: '🏛️', color: 'text-amber-400' },
    { key: 'civilian', label: 'Civilian', icon: '🏗️', color: 'text-blue-400' },
    { key: 'science', label: 'Science', icon: '🔬', color: 'text-emerald-400' },
    { key: 'commerce', label: 'Commerce', icon: '🪙', color: 'text-orange-400' },
    { key: 'guild', label: 'Guild', icon: '👥', color: 'text-purple-400' },
];
export function GameResults({ scores, currentPlayerId, onPlayAgain }) {
    // Sort by total descending
    const sorted = [...scores].sort((a, b) => b.total - a.total);
    const winner = sorted[0];
    return (_jsxs(motion.div, { className: "min-h-screen flex flex-col items-center justify-center p-8", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 }, children: [_jsx("div", { className: "fixed inset-0 bg-gradient-to-b from-dark-marble via-[#1a1520] to-dark-marble -z-10" }), _jsxs(motion.div, { className: "text-center mb-12", initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.8 }, children: [_jsx(motion.div, { className: "text-7xl mb-4", initial: { scale: 0, rotate: -180 }, animate: { scale: 1, rotate: 0 }, transition: { type: 'spring', stiffness: 100, delay: 0.5 }, children: "\uD83C\uDFC6" }), _jsx("h1", { className: "font-display text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ancient-gold via-white to-ancient-bronze mb-2", children: winner?.playerId === currentPlayerId ? 'You Win!' : `${winner?.playerName ?? `Player`} Wins!` }), _jsxs("p", { className: "text-white/40 text-sm", children: ["With ", winner?.total ?? 0, " victory points", winner?.wonderId && ` • ${winner.wonderId.charAt(0) + winner.wonderId.slice(1).toLowerCase()}`] })] }), _jsxs(motion.div, { className: "glass-panel p-6 w-full max-w-4xl gold-border", initial: { opacity: 0, y: 30, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { delay: 0.8, duration: 0.5 }, children: [_jsx("h2", { className: "font-display text-xl text-ancient-gold mb-4 text-center", children: "Final Scores" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/10", children: [_jsx("th", { className: "text-left py-3 px-2 text-white/40 font-medium w-8", children: "#" }), _jsx("th", { className: "text-left py-3 px-2 text-white/40 font-medium", children: "Player" }), CATEGORY_CONFIG.map(cat => (_jsx("th", { className: "text-center py-3 px-1", children: _jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [_jsx("span", { className: "text-sm", children: cat.icon }), _jsx("span", { className: `text-[9px] ${cat.color}`, children: cat.label })] }) }, cat.key))), _jsx("th", { className: "text-center py-3 px-2 text-ancient-gold font-bold", children: "Total" })] }) }), _jsx("tbody", { children: sorted.map((score, index) => {
                                        const isCurrentPlayer = score.playerId === currentPlayerId;
                                        const rank = index + 1;
                                        return (_jsxs(motion.tr, { className: `
                      border-b border-white/5
                      ${isCurrentPlayer ? 'bg-ancient-gold/5' : ''}
                      ${rank === 1 ? 'bg-ancient-gold/10' : ''}
                    `, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 1.0 + index * 0.1 }, children: [_jsx("td", { className: "py-3 px-2", children: _jsx("span", { className: `text-sm font-bold ${rank === 1 ? 'text-ancient-gold' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-700' : 'text-white/30'}`, children: rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.` }) }), _jsxs("td", { className: "py-3 px-2", children: [_jsx("div", { className: "font-medium text-sm", children: isCurrentPlayer ? 'You' : score.playerName ?? `Player ${index + 1}` }), score.wonderId && (_jsx("div", { className: "text-[10px] text-white/30", children: score.wonderId.charAt(0) + score.wonderId.slice(1).toLowerCase() }))] }), CATEGORY_CONFIG.map(cat => (_jsx("td", { className: `text-center py-3 px-1 font-mono text-xs ${score[cat.key] > 0 ? cat.color : 'text-white/20'}`, children: score[cat.key] }, cat.key))), _jsx("td", { className: "text-center py-3 px-2", children: _jsx(motion.span, { className: `font-bold text-lg ${rank === 1 ? 'text-ancient-gold' : 'text-white/80'}`, initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', delay: 1.5 + index * 0.1 }, children: score.total }) })] }, score.playerId));
                                    }) })] }) })] }), onPlayAgain && (_jsx(motion.button, { id: "btn-play-again", className: "mt-8 btn-primary px-8 py-3 text-lg", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 2.0 }, onClick: onPlayAgain, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: "\uD83D\uDD04 Play Again" })), _jsx("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: Array.from({ length: 15 }).map((_, i) => (_jsx(motion.div, { className: "absolute w-1 h-1 bg-ancient-gold/20 rounded-full", style: {
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }, animate: {
                        y: [0, -150],
                        opacity: [0, 0.6, 0],
                    }, transition: {
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                    } }, i))) })] }));
}
