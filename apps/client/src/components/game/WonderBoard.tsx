import { motion } from 'framer-motion';

interface WonderBoardProps {
    wonderId: string;
    wonderSide: string;
    stagesBuilt: number;
    totalStages?: number;
    startingResource?: string;
    onBuildStage?: (stageIndex: number) => void;
}

const WONDER_DETAILS: Record<string, { emoji: string; description: string; totalStages: Record<string, number> }> = {
    ALEXANDRIA: { emoji: '🏛️', description: 'The Lighthouse', totalStages: { DAY: 3, NIGHT: 3 } },
    BABYLON: { emoji: '🌉', description: 'The Hanging Gardens', totalStages: { DAY: 3, NIGHT: 2 } },
    EPHESUS: { emoji: '🏟️', description: 'The Temple of Artemis', totalStages: { DAY: 3, NIGHT: 3 } },
    GIZA: { emoji: '🔺', description: 'The Great Pyramid', totalStages: { DAY: 3, NIGHT: 4 } },
    HALIKARNASSUS: { emoji: '🏗️', description: 'The Mausoleum', totalStages: { DAY: 3, NIGHT: 3 } },
    OLYMPIA: { emoji: '🏆', description: 'The Statue of Zeus', totalStages: { DAY: 3, NIGHT: 3 } },
    RHODES: { emoji: '🗿', description: 'The Colossus', totalStages: { DAY: 3, NIGHT: 2 } },
};

const RESOURCE_EMOJI: Record<string, string> = {
    WOOD: '🪵',
    STONE: '🪨',
    CLAY: '🧱',
    ORE: '⛏️',
    GLASS: '🔮',
    PAPYRUS: '📜',
    LOOM: '🧵',
};

export function WonderBoard({ wonderId, wonderSide, stagesBuilt, startingResource, onBuildStage }: WonderBoardProps) {
    const details = WONDER_DETAILS[wonderId] ?? {
        emoji: '🏛️',
        description: wonderId,
        totalStages: { DAY: 3, NIGHT: 3 },
    };
    const totalStages = details.totalStages[wonderSide] ?? 3;

    return (
        <motion.div
            id={`wonder-${wonderId}`}
            className="glass-panel p-4 gold-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Wonder header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="text-3xl">{details.emoji}</span>
                        {stagesBuilt === totalStages && (
                            <motion.div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                            >
                                <span className="text-[8px]">✓</span>
                            </motion.div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-bold text-ancient-gold">
                            {wonderId.charAt(0) + wonderId.slice(1).toLowerCase()}
                        </h2>
                        <p className="text-xs text-white/50">
                            {details.description} • Side {wonderSide === 'DAY' ? '☀️ A' : '🌙 B'}
                        </p>
                    </div>
                </div>

                {/* Starting resource */}
                {startingResource && (
                    <div className="flex items-center gap-1.5 glass-panel px-2.5 py-1 text-xs">
                        <span>{RESOURCE_EMOJI[startingResource] ?? '♦️'}</span>
                        <span className="text-white/60">{startingResource.toLowerCase()}</span>
                    </div>
                )}
            </div>

            {/* Wonder stages */}
            <div className="flex gap-2">
                {Array.from({ length: totalStages }).map((_, index) => {
                    const isBuilt = index < stagesBuilt;
                    const isNext = index === stagesBuilt;
                    return (
                        <motion.div
                            key={index}
                            className={`
                                flex-1 h-14 rounded-lg flex flex-col items-center justify-center
                                border-2 transition-all duration-300
                                ${isBuilt
                                    ? 'bg-gradient-to-r from-ancient-gold/30 to-ancient-bronze/30 border-ancient-gold/60'
                                    : isNext
                                        ? 'bg-white/5 border-ancient-gold/30 border-dashed cursor-pointer hover:bg-ancient-gold/10 hover:border-ancient-gold/50'
                                        : 'bg-white/5 border-white/10 border-dashed opacity-50'}
                            `}
                            initial={false}
                            animate={isBuilt ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            whileHover={isNext ? { scale: 1.02 } : {}}
                            onClick={() => isNext && onBuildStage?.(index)}
                        >
                            {isBuilt ? (
                                <>
                                    <span className="text-ancient-gold font-bold text-sm">✓</span>
                                    <span className="text-ancient-gold/60 text-[9px]">Stage {index + 1}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-white/30 text-xs">{index + 1}</span>
                                    {isNext && <span className="text-ancient-gold/40 text-[8px]">build</span>}
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-ancient-gold to-ancient-bronze rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stagesBuilt / totalStages) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Completion badge */}
            {stagesBuilt === totalStages && (
                <motion.div
                    className="mt-2 text-center text-xs text-emerald-400 font-medium"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    🏆 Wonder Complete!
                </motion.div>
            )}
        </motion.div>
    );
}
