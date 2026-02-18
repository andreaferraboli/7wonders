import { motion } from 'framer-motion';
import { Card, getCardColor } from './Card';

interface BuiltCard {
    id: string;
    name?: string;
}

interface BuiltCardsAreaProps {
    cards: BuiltCard[];
}

// Group by color for organized display
const COLOR_ORDER = ['#8B4513', '#6B7280', '#2563EB', '#F59E0B', '#DC2626', '#16A34A', '#7C3AED'];
const COLOR_LABELS: Record<string, string> = {
    '#8B4513': 'Materie Prime',
    '#6B7280': 'Manufatti',
    '#2563EB': 'Civili',
    '#F59E0B': 'Commerciali',
    '#DC2626': 'Militari',
    '#16A34A': 'Scienza',
    '#7C3AED': 'Gilde',
};

export function BuiltCardsArea({ cards }: BuiltCardsAreaProps) {
    // Group cards by color
    const grouped: Record<string, BuiltCard[]> = {};
    for (const card of cards) {
        const color = getCardColor(card.id);
        if (!grouped[color]) grouped[color] = [];
        grouped[color].push(card);
    }

    return (
        <div className="w-full">
            <h3
                className="text-sm mb-2 flex items-center gap-2"
                style={{
                    fontFamily: 'Cinzel, Georgia, serif',
                    color: 'rgba(212, 165, 116, 0.6)',
                }}
            >
                🏗️ Costruzioni ({cards.length})
            </h3>

            <div className="flex flex-wrap gap-2">
                {COLOR_ORDER.map(color => {
                    const colorCards = grouped[color];
                    if (!colorCards || colorCards.length === 0) return null;

                    return (
                        <div key={color} className="flex gap-0.5">
                            {colorCards.map((card, index) => (
                                <motion.div
                                    key={card.id + '-' + index}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card
                                        cardId={card.id}
                                        compact={true}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {cards.length === 0 && (
                <div className="text-xs italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Nessuna struttura costruita
                </div>
            )}
        </div>
    );
}
