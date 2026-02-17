import { motion, AnimatePresence } from 'framer-motion';
import type { CardColor } from '@7wonders/shared';

interface CardTooltipProps {
    cardId: string;
    name?: string;
    color?: CardColor;
    epoch?: number;
    cost?: {
        coins?: number;
        resources?: Record<string, number>;
    };
    effects?: string[];
    position?: { x: number; y: number };
    visible: boolean;
}

const RESOURCE_ICONS: Record<string, string> = {
    WOOD: '🪵',
    STONE: '🪨',
    CLAY: '🧱',
    ORE: '⛏️',
    GLASS: '🔮',
    PAPYRUS: '📜',
    LOOM: '🧶',
};

const COLOR_LABELS: Record<CardColor, { label: string; icon: string }> = {
    BROWN: { label: 'Raw Material', icon: '🪵' },
    GREY: { label: 'Manufactured Good', icon: '⚙️' },
    BLUE: { label: 'Civilian', icon: '🏛️' },
    YELLOW: { label: 'Commercial', icon: '💰' },
    RED: { label: 'Military', icon: '⚔️' },
    GREEN: { label: 'Scientific', icon: '🔬' },
    PURPLE: { label: 'Guild', icon: '👥' },
    BLACK: { label: 'City', icon: '🌑' },
};

export function CardTooltip({
    cardId,
    name,
    color = 'BLUE',
    epoch,
    cost,
    effects,
    position,
    visible,
}: CardTooltipProps) {
    const colorInfo = COLOR_LABELS[color];
    const displayName = name ?? cardId.replace(/_/g, ' ').replace(/\d+P$/i, '');

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    id={`tooltip-${cardId}`}
                    className="tooltip w-64 p-0 overflow-hidden"
                    style={{
                        left: position?.x ?? 0,
                        top: position?.y ?? 0,
                    }}
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* Header */}
                    <div className={`px-3 py-2 bg-gradient-to-r from-card-${color.toLowerCase()} to-card-${color.toLowerCase()}/80`}>
                        <div className="flex items-center justify-between">
                            <h4 className="font-display text-sm font-bold text-white truncate">
                                {displayName}
                            </h4>
                            <span className="text-xs opacity-75">{colorInfo.icon}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/70">{colorInfo.label}</span>
                            {epoch && (
                                <span className="text-[10px] text-white/60">• Age {epoch}</span>
                            )}
                        </div>
                    </div>

                    {/* Cost */}
                    {cost && (cost.coins || cost.resources) && (
                        <div className="px-3 py-2 border-b border-white/10">
                            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Cost</div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {cost.coins && cost.coins > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-yellow-300">
                                        💰 {cost.coins}
                                    </span>
                                )}
                                {cost.resources &&
                                    Object.entries(cost.resources).map(([res, qty]) => (
                                        <span key={res} className="flex items-center gap-0.5 text-xs">
                                            {RESOURCE_ICONS[res] ?? res} {qty}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Effects */}
                    {effects && effects.length > 0 && (
                        <div className="px-3 py-2">
                            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Effects</div>
                            <ul className="space-y-0.5">
                                {effects.map((effect, i) => (
                                    <li key={i} className="text-xs text-white/80 flex items-start gap-1.5">
                                        <span className="text-ancient-gold mt-0.5 text-[8px]">▸</span>
                                        {effect}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* No cost */}
                    {!cost?.coins && !cost?.resources && (
                        <div className="px-3 py-2 border-b border-white/10">
                            <span className="text-[10px] text-emerald-400">✓ Free to build</span>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
