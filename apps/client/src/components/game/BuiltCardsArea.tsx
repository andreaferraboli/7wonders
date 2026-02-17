import { motion } from 'framer-motion';
import type { CardColor } from '@7wonders/shared';

interface BuiltCard {
    id: string;
    name?: string;
    color?: CardColor;
}

interface BuiltCardsAreaProps {
    cards: BuiltCard[];
}

const COLOR_CONFIG: Record<CardColor, { bg: string; border: string; icon: string }> = {
    BROWN: { bg: 'bg-amber-900/30', border: 'border-amber-700/40', icon: '🪵' },
    GREY: { bg: 'bg-gray-600/30', border: 'border-gray-500/40', icon: '⚙️' },
    BLUE: { bg: 'bg-blue-800/30', border: 'border-blue-600/40', icon: '🏛️' },
    YELLOW: { bg: 'bg-yellow-700/30', border: 'border-yellow-600/40', icon: '💰' },
    RED: { bg: 'bg-red-800/30', border: 'border-red-600/40', icon: '⚔️' },
    GREEN: { bg: 'bg-emerald-800/30', border: 'border-emerald-600/40', icon: '🔬' },
    PURPLE: { bg: 'bg-purple-800/30', border: 'border-purple-600/40', icon: '👥' },
    BLACK: { bg: 'bg-gray-900/50', border: 'border-gray-700/40', icon: '🌑' },
};

export function BuiltCardsArea({ cards }: BuiltCardsAreaProps) {
    // Group cards by color
    const grouped: Partial<Record<CardColor, BuiltCard[]>> = {};
    for (const card of cards) {
        const color = card.color ?? 'BLUE';
        if (!grouped[color]) grouped[color] = [];
        grouped[color]!.push(card);
    }

    const colorOrder: CardColor[] = ['BROWN', 'GREY', 'BLUE', 'YELLOW', 'RED', 'GREEN', 'PURPLE', 'BLACK'];

    return (
        <div className="w-full">
            <h3 className="font-display text-sm text-ancient-gold/60 mb-2 flex items-center gap-2">
                <span>🏗️</span>
                Built Structures ({cards.length})
            </h3>

            <div className="flex flex-wrap gap-1.5">
                {colorOrder.map(color => {
                    const colorCards = grouped[color];
                    if (!colorCards || colorCards.length === 0) return null;

                    const config = COLOR_CONFIG[color];
                    return (
                        <div key={color} className="flex gap-0.5">
                            {colorCards.map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    className={`
                    ${config.bg} ${config.border} border rounded px-1.5 py-0.5
                    text-[10px] text-white/70 cursor-default
                    hover:scale-110 hover:z-10 transition-transform
                  `}
                                    title={card.name ?? card.id.replace(/_/g, ' ')}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    {config.icon}
                                </motion.div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {cards.length === 0 && (
                <div className="text-xs text-white/20 italic">No structures built yet</div>
            )}
        </div>
    );
}
