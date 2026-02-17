import { motion } from 'framer-motion';
import type { CardColor } from '@7wonders/shared';

interface CardProps {
    cardId: string;
    name?: string;
    epoch?: number;
    color?: CardColor;
    isSelected?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
    onHover?: () => void;
    onHoverEnd?: () => void;
}

const COLOR_STYLES: Record<CardColor, { bg: string; border: string; glow: string }> = {
    BROWN: {
        bg: 'bg-gradient-to-b from-amber-800 to-amber-900',
        border: 'border-amber-600',
        glow: 'shadow-amber-700/50',
    },
    GREY: {
        bg: 'bg-gradient-to-b from-slate-500 to-slate-700',
        border: 'border-slate-400',
        glow: 'shadow-slate-500/50',
    },
    BLUE: {
        bg: 'bg-gradient-to-b from-blue-500 to-blue-700',
        border: 'border-blue-400',
        glow: 'shadow-blue-500/50',
    },
    YELLOW: {
        bg: 'bg-gradient-to-b from-yellow-500 to-amber-600',
        border: 'border-yellow-400',
        glow: 'shadow-yellow-500/50',
    },
    RED: {
        bg: 'bg-gradient-to-b from-red-600 to-red-800',
        border: 'border-red-500',
        glow: 'shadow-red-600/50',
    },
    GREEN: {
        bg: 'bg-gradient-to-b from-emerald-600 to-emerald-800',
        border: 'border-emerald-500',
        glow: 'shadow-emerald-600/50',
    },
    PURPLE: {
        bg: 'bg-gradient-to-b from-purple-600 to-purple-800',
        border: 'border-purple-500',
        glow: 'shadow-purple-600/50',
    },
    BLACK: {
        bg: 'bg-gradient-to-b from-gray-800 to-gray-950',
        border: 'border-gray-600',
        glow: 'shadow-gray-700/50',
    },
};

const EPOCH_ICONS = ['Ⅰ', 'Ⅱ', 'Ⅲ'] as const;

export function Card({
    cardId,
    name,
    epoch,
    color = 'BLUE',
    isSelected = false,
    isDisabled = false,
    onClick,
    onHover,
    onHoverEnd,
}: CardProps) {
    const style = COLOR_STYLES[color];
    const displayName = name ?? cardId.replace(/_/g, ' ').replace(/\d+P$/i, '');

    return (
        <motion.div
            id={`card-${cardId}`}
            className={`
        relative w-28 h-40 rounded-xl cursor-pointer select-none
        border-2 overflow-hidden
        ${style.bg} ${style.border}
        ${isSelected ? 'ring-3 ring-ancient-gold ring-offset-2 ring-offset-dark-marble' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        card-shadow
        transition-shadow duration-200
      `}
            whileHover={!isDisabled ? { scale: 1.08, y: -12, zIndex: 10 } : {}}
            whileTap={!isDisabled ? { scale: 0.96 } : {}}
            onClick={!isDisabled ? onClick : undefined}
            onHoverStart={onHover}
            onHoverEnd={onHoverEnd}
            layout
            layoutId={cardId}
        >
            {/* Card inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Header band */}
            <div className="relative px-2.5 pt-2 pb-1">
                <h3 className="font-display text-[10px] font-semibold text-white leading-tight truncate drop-shadow-md">
                    {displayName}
                </h3>
            </div>

            {/* Age indicator */}
            {epoch && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-[9px] font-bold text-ancient-gold">
                        {EPOCH_ICONS[epoch - 1]}
                    </span>
                </div>
            )}

            {/* Center area - card type icon */}
            <div className="flex-1 flex items-center justify-center mt-3">
                <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-lg">{getColorEmoji(color)}</span>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] text-white/70 font-medium uppercase tracking-wider">
                        {color}
                    </span>
                    {isSelected && (
                        <span className="text-[8px] text-ancient-gold font-bold">✓ SELECTED</span>
                    )}
                </div>
            </div>

            {/* Selection overlay */}
            {isSelected && (
                <motion.div
                    className="absolute inset-0 border-2 border-ancient-gold rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-ancient-gold/10" />
                </motion.div>
            )}
        </motion.div>
    );
}

function getColorEmoji(color: CardColor): string {
    switch (color) {
        case 'BROWN': return '🪵';
        case 'GREY': return '⚙️';
        case 'BLUE': return '🏛️';
        case 'YELLOW': return '💰';
        case 'RED': return '⚔️';
        case 'GREEN': return '🔬';
        case 'PURPLE': return '👥';
        case 'BLACK': return '🌑';
    }
}
