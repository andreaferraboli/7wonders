import { motion } from 'framer-motion';

interface NeighborInfo {
    sessionId: string;
    name?: string;
    wonderId?: string;
    coins: number;
    militaryPower: number;
    builtCardsCount: number;
    wonderStagesBuilt: number;
    isAI: boolean;
}

interface NeighborPanelProps {
    direction: 'left' | 'right';
    neighbor: NeighborInfo | null;
}

export function NeighborPanel({ direction, neighbor }: NeighborPanelProps) {
    if (!neighbor) return null;

    const icon = direction === 'left' ? '⬅️' : '➡️';

    return (
        <motion.div
            className={`glass-panel p-3 ${direction === 'left' ? 'border-l-2 border-l-sky-500/30' : 'border-r-2 border-r-rose-500/30'}`}
            initial={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">{icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                        {neighbor.isAI ? '🤖 AI' : neighbor.name ?? 'Neighbor'}
                    </div>
                    {neighbor.wonderId && (
                        <div className="text-[9px] text-white/30 truncate">
                            {neighbor.wonderId.charAt(0) + neighbor.wonderId.slice(1).toLowerCase()}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1" title="Coins">
                    <span>💰</span>
                    <span className="text-yellow-400 font-mono">{neighbor.coins}</span>
                </div>
                <div className="flex items-center gap-1" title="Military">
                    <span>⚔️</span>
                    <span className="text-red-400 font-mono">{neighbor.militaryPower}</span>
                </div>
                <div className="flex items-center gap-1" title="Built cards">
                    <span>🏗️</span>
                    <span className="text-blue-400 font-mono">{neighbor.builtCardsCount}</span>
                </div>
                <div className="flex items-center gap-1" title="Wonder stages">
                    <span>🏛️</span>
                    <span className="text-amber-400 font-mono">{neighbor.wonderStagesBuilt}</span>
                </div>
            </div>
        </motion.div>
    );
}
