import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
const ACTIONS = [
    {
        type: 'BUILD',
        label: 'Build',
        icon: '🏗️',
        color: 'from-blue-600/80 to-blue-800/80',
        hoverColor: 'hover:from-blue-500/90 hover:to-blue-700/90',
        description: 'Add this card to your city',
    },
    {
        type: 'SELL',
        label: 'Sell',
        icon: '💰',
        color: 'from-yellow-600/80 to-yellow-800/80',
        hoverColor: 'hover:from-yellow-500/90 hover:to-yellow-700/90',
        description: 'Discard for 3 coins',
    },
    {
        type: 'WONDER',
        label: 'Wonder',
        icon: '🏛️',
        color: 'from-ancient-gold/80 to-ancient-bronze/80',
        hoverColor: 'hover:from-ancient-gold/90 hover:to-ancient-bronze/90',
        description: 'Use card to build wonder stage',
    },
];
export function ActionBar({ selectedCardId, selectedAction, canBuild, canWonder, wonderStagesBuilt, wonderTotalStages, onSelectAction, onConfirm, onCancel, isSubmitting = false, }) {
    return (_jsx(AnimatePresence, { children: selectedCardId && (_jsx(motion.div, { id: "action-bar", className: "fixed bottom-4 left-1/2 -translate-x-1/2 z-40", initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 40 }, transition: { type: 'spring', stiffness: 200, damping: 25 }, children: _jsxs("div", { className: "glass-panel p-3 flex items-center gap-3", children: [_jsx("div", { className: "flex gap-2", children: ACTIONS.map((action) => {
                            const isSelected = selectedAction === action.type;
                            const isDisabled = (action.type === 'BUILD' && !canBuild) ||
                                (action.type === 'WONDER' && !canWonder);
                            return (_jsxs(motion.button, { id: `btn-action-${action.type.toLowerCase()}`, className: `
                      relative px-4 py-2.5 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${isSelected
                                    ? `bg-gradient-to-b ${action.color} ring-2 ring-white/30 shadow-lg`
                                    : isDisabled
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : `bg-gradient-to-b ${action.color} opacity-60 ${action.hoverColor} hover:opacity-100`}
                    `, onClick: () => !isDisabled && onSelectAction(action.type), whileHover: !isDisabled ? { scale: 1.05 } : {}, whileTap: !isDisabled ? { scale: 0.95 } : {}, disabled: isDisabled, title: isDisabled ? `Cannot ${action.label.toLowerCase()}` : action.description, children: [_jsx("span", { className: "mr-1.5", children: action.icon }), action.label, action.type === 'WONDER' && (_jsxs("span", { className: "ml-1 text-[10px] opacity-70", children: ["(", wonderStagesBuilt, "/", wonderTotalStages, ")"] })), isSelected && (_jsx(motion.div, { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full", layoutId: "action-indicator" }))] }, action.type));
                        }) }), _jsx("div", { className: "w-px h-8 bg-white/10" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(motion.button, { id: "btn-confirm-action", className: `
                  px-5 py-2.5 rounded-lg font-bold text-sm transition-all
                  ${selectedAction
                                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-white/5 text-white/20 cursor-not-allowed'}
                `, onClick: selectedAction ? onConfirm : undefined, whileHover: selectedAction ? { scale: 1.05 } : {}, whileTap: selectedAction ? { scale: 0.95 } : {}, disabled: !selectedAction || isSubmitting, children: [isSubmitting ? '⏳' : '✓', " Confirm"] }), _jsx(motion.button, { id: "btn-cancel-action", className: "px-3 py-2.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all text-sm", onClick: onCancel, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: "\u2715" })] })] }) })) }));
}
