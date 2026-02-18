import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
export function MilitaryResults({ results, epoch, visible, onClose }) {
    return (_jsx(AnimatePresence, { children: visible && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-50", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose }), _jsxs(motion.div, { id: "military-results-panel", className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-panel p-8 w-full max-w-md", initial: { opacity: 0, scale: 0.8, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8 }, transition: { type: 'spring', stiffness: 200, damping: 25 }, children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "text-4xl mb-2", children: "\u2694\uFE0F" }), _jsx("h2", { className: "font-display text-2xl font-bold text-red-400", children: "Military Conflicts" }), _jsxs("p", { className: "text-white/40 text-xs mt-1", children: ["End of Epoch ", epoch] })] }), _jsx("div", { className: "space-y-3", children: results.map((result, index) => (_jsx(motion.div, { className: `
                    glass-panel p-4 
                    ${result.result === 'victory' ? 'border-emerald-500/30' : ''}
                    ${result.result === 'defeat' ? 'border-red-500/30' : ''}
                    ${result.result === 'draw' ? 'border-white/10' : ''}
                  `, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2 + index * 0.15 }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: `
                        w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${result.result === 'victory' ? 'bg-emerald-500/20' : ''}
                        ${result.result === 'defeat' ? 'bg-red-500/20' : ''}
                        ${result.result === 'draw' ? 'bg-white/10' : ''}
                      `, children: [result.result === 'victory' && '🏆', result.result === 'defeat' && '💀', result.result === 'draw' && '🤝'] }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium", children: ["vs ", result.opponentName] }), _jsxs("div", { className: "text-xs text-white/40", children: [result.yourPower, " \u2694\uFE0F vs ", result.theirPower, " \u2694\uFE0F"] })] })] }), _jsx("div", { className: `
                      text-lg font-bold
                      ${result.token > 0 ? 'text-emerald-400' : ''}
                      ${result.token < 0 ? 'text-red-400' : ''}
                      ${result.token === 0 ? 'text-white/40' : ''}
                    `, children: result.token > 0 ? `+${result.token}` : result.token })] }) }, index))) }), _jsxs(motion.div, { className: "mt-4 text-center", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 + results.length * 0.15 }, children: [_jsxs("div", { className: "text-xs text-white/30 mb-4", children: ["Total: ", results.reduce((sum, r) => sum + r.token, 0), " military points"] }), _jsx("button", { id: "btn-dismiss-military", className: "btn-primary px-6 text-center", onClick: onClose, children: "Continue" })] })] })] })) }));
}
