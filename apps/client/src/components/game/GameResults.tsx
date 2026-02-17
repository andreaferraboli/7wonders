import { motion } from 'framer-motion';

interface FinalScore {
    playerId: string;
    playerName?: string;
    wonderId?: string;
    military: number;
    treasury: number;
    wonder: number;
    civilian: number;
    science: number;
    commerce: number;
    guild: number;
    total: number;
}

interface GameResultsProps {
    scores: FinalScore[];
    currentPlayerId: string | null;
    onPlayAgain?: () => void;
}

const CATEGORY_CONFIG = [
    { key: 'military', label: 'Military', icon: '⚔️', color: 'text-red-400' },
    { key: 'treasury', label: 'Treasury', icon: '💰', color: 'text-yellow-400' },
    { key: 'wonder', label: 'Wonder', icon: '🏛️', color: 'text-amber-400' },
    { key: 'civilian', label: 'Civilian', icon: '🏗️', color: 'text-blue-400' },
    { key: 'science', label: 'Science', icon: '🔬', color: 'text-emerald-400' },
    { key: 'commerce', label: 'Commerce', icon: '🪙', color: 'text-orange-400' },
    { key: 'guild', label: 'Guild', icon: '👥', color: 'text-purple-400' },
] as const;

export function GameResults({ scores, currentPlayerId, onPlayAgain }: GameResultsProps) {
    // Sort by total descending
    const sorted = [...scores].sort((a, b) => b.total - a.total);
    const winner = sorted[0];

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-dark-marble via-[#1a1520] to-dark-marble -z-10" />

            {/* Winner announcement */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <motion.div
                    className="text-7xl mb-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
                >
                    🏆
                </motion.div>

                <h1 className="font-display text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ancient-gold via-white to-ancient-bronze mb-2">
                    {winner?.playerId === currentPlayerId ? 'You Win!' : `${winner?.playerName ?? `Player`} Wins!`}
                </h1>
                <p className="text-white/40 text-sm">
                    With {winner?.total ?? 0} victory points
                    {winner?.wonderId && ` • ${winner.wonderId.charAt(0) + winner.wonderId.slice(1).toLowerCase()}`}
                </p>
            </motion.div>

            {/* Scoreboard */}
            <motion.div
                className="glass-panel p-6 w-full max-w-4xl gold-border"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
            >
                <h2 className="font-display text-xl text-ancient-gold mb-4 text-center">Final Scores</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 text-white/40 font-medium w-8">#</th>
                                <th className="text-left py-3 px-2 text-white/40 font-medium">Player</th>
                                {CATEGORY_CONFIG.map(cat => (
                                    <th key={cat.key} className="text-center py-3 px-1">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm">{cat.icon}</span>
                                            <span className={`text-[9px] ${cat.color}`}>{cat.label}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="text-center py-3 px-2 text-ancient-gold font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((score, index) => {
                                const isCurrentPlayer = score.playerId === currentPlayerId;
                                const rank = index + 1;

                                return (
                                    <motion.tr
                                        key={score.playerId}
                                        className={`
                      border-b border-white/5
                      ${isCurrentPlayer ? 'bg-ancient-gold/5' : ''}
                      ${rank === 1 ? 'bg-ancient-gold/10' : ''}
                    `}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.0 + index * 0.1 }}
                                    >
                                        <td className="py-3 px-2">
                                            <span className={`text-sm font-bold ${rank === 1 ? 'text-ancient-gold' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-700' : 'text-white/30'}`}>
                                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="font-medium text-sm">
                                                {isCurrentPlayer ? 'You' : score.playerName ?? `Player ${index + 1}`}
                                            </div>
                                            {score.wonderId && (
                                                <div className="text-[10px] text-white/30">
                                                    {score.wonderId.charAt(0) + score.wonderId.slice(1).toLowerCase()}
                                                </div>
                                            )}
                                        </td>
                                        {CATEGORY_CONFIG.map(cat => (
                                            <td key={cat.key} className={`text-center py-3 px-1 font-mono text-xs ${(score as any)[cat.key] > 0 ? cat.color : 'text-white/20'}`}>
                                                {(score as any)[cat.key]}
                                            </td>
                                        ))}
                                        <td className="text-center py-3 px-2">
                                            <motion.span
                                                className={`font-bold text-lg ${rank === 1 ? 'text-ancient-gold' : 'text-white/80'}`}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', delay: 1.5 + index * 0.1 }}
                                            >
                                                {score.total}
                                            </motion.span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Play Again */}
            {onPlayAgain && (
                <motion.button
                    id="btn-play-again"
                    className="mt-8 btn-primary px-8 py-3 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    onClick={onPlayAgain}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    🔄 Play Again
                </motion.button>
            )}

            {/* Floating particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-ancient-gold/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -150],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}
