import { motion } from 'framer-motion';

const WONDER_NAMES: Record<string, string> = {
    ALEXANDRIA: 'Alessandria',
    BABYLON: 'Babilonia',
    EPHESUS: 'Efeso',
    GIZA: 'Giza',
    HALIKARNASSUS: 'Alicarnasso',
    OLYMPIA: 'Olimpia',
    RHODES: 'Rodi',
};

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

    const borderSide = direction === 'left'
        ? { borderLeft: '3px solid rgba(56, 189, 248, 0.4)' }
        : { borderRight: '3px solid rgba(251, 113, 133, 0.4)' };

    return (
        <motion.div
            className="rounded-xl p-3"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                ...borderSide,
            }}
            initial={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">{direction === 'left' ? '⬅️' : '➡️'}</span>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white/70 truncate">
                        {neighbor.isAI ? '🤖 AI' : 'Vicino'}
                    </div>
                    {neighbor.wonderId && (
                        <div className="text-[9px] text-white/30 truncate">
                            {WONDER_NAMES[neighbor.wonderId] ?? neighbor.wonderId}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span className="text-yellow-400 font-mono">{neighbor.coins}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>⚔️</span>
                    <span className="text-red-400 font-mono">{neighbor.militaryPower}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>🏗️</span>
                    <span className="text-blue-400 font-mono">{neighbor.builtCardsCount}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>🏛️</span>
                    <span className="text-amber-400 font-mono">{neighbor.wonderStagesBuilt}</span>
                </div>
            </div>
        </motion.div>
    );
}
