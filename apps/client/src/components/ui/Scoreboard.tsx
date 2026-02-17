import { motion, AnimatePresence } from 'framer-motion';
import type { ClientPlayer } from '@/hooks/useColyseus';

interface ScoreboardProps {
    players: Map<string, ClientPlayer>;
    currentSessionId: string | null;
    visible: boolean;
    onClose: () => void;
}

const SCORE_CATEGORIES = [
    { key: 'military', label: 'Military', icon: '⚔️', color: 'text-red-400' },
    { key: 'coins', label: 'Treasury', icon: '💰', color: 'text-yellow-400' },
    { key: 'wonder', label: 'Wonder', icon: '🏛️', color: 'text-amber-400' },
    { key: 'buildings', label: 'Buildings', icon: '🏗️', color: 'text-blue-400' },
    { key: 'science', label: 'Science', icon: '🔬', color: 'text-emerald-400' },
] as const;

export function Scoreboard({ players, currentSessionId, visible, onClose }: ScoreboardProps) {
    const playerArray = Array.from(players.values());

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        id="scoreboard-panel"
                        className="fixed inset-x-4 top-20 bottom-20 mx-auto max-w-3xl glass-panel p-6 z-50 overflow-y-auto"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-2xl font-bold text-ancient-gold">
                                📊 Scoreboard
                            </h2>
                            <button
                                id="btn-close-scoreboard"
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                onClick={onClose}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-2 text-white/50 font-medium">Player</th>
                                        {SCORE_CATEGORIES.map(cat => (
                                            <th key={cat.key} className="text-center py-3 px-2">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-base">{cat.icon}</span>
                                                    <span className={`text-[10px] ${cat.color}`}>{cat.label}</span>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="text-center py-3 px-2 text-ancient-gold font-bold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playerArray.map((player, index) => {
                                        const isCurrentPlayer = player.sessionId === currentSessionId;
                                        const scienceTotal = player.scienceCompass + player.scienceGear + player.scienceTablet;
                                        const militaryScore = player.militaryTokens.reduce((sum, t) => {
                                            const val = parseInt(t);
                                            return isNaN(val) ? sum : sum + val;
                                        }, 0);

                                        return (
                                            <motion.tr
                                                key={player.sessionId}
                                                className={`
                          border-b border-white/5
                          ${isCurrentPlayer ? 'bg-ancient-gold/5' : ''}
                          hover:bg-white/5 transition-colors
                        `}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`
                              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                              ${isCurrentPlayer
                                                                ? 'bg-gradient-to-br from-ancient-gold to-ancient-bronze text-dark-marble'
                                                                : 'bg-white/10 text-white/70'}
                            `}>
                                                            {player.isAI ? '🤖' : `P${player.position + 1}`}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">
                                                                {isCurrentPlayer ? 'You' : `Player ${player.position + 1}`}
                                                                {player.isAI && <span className="text-yellow-400 text-xs ml-1">(AI)</span>}
                                                            </div>
                                                            <div className="text-[10px] text-white/40">
                                                                {player.wonderId
                                                                    ? player.wonderId.charAt(0) + player.wonderId.slice(1).toLowerCase()
                                                                    : '—'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-2 text-red-300 font-mono">
                                                    {militaryScore}
                                                </td>
                                                <td className="text-center py-3 px-2 text-yellow-300 font-mono">
                                                    {Math.floor(player.coins / 3)}
                                                </td>
                                                <td className="text-center py-3 px-2 text-amber-300 font-mono">
                                                    {player.wonderStagesBuilt * 3}
                                                </td>
                                                <td className="text-center py-3 px-2 text-blue-300 font-mono">
                                                    {player.cityCards.length}
                                                </td>
                                                <td className="text-center py-3 px-2 text-emerald-300 font-mono">
                                                    {scienceTotal}
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    <span className="text-ancient-gold font-bold text-base">
                                                        {militaryScore + Math.floor(player.coins / 3) + player.wonderStagesBuilt * 3 + scienceTotal}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Science detail */}
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {playerArray.map((player) => {
                                const isCurrentPlayer = player.sessionId === currentSessionId;
                                if (player.scienceCompass === 0 && player.scienceGear === 0 && player.scienceTablet === 0) return null;
                                return (
                                    <div key={player.sessionId} className={`glass-panel p-3 ${isCurrentPlayer ? 'gold-border' : ''}`}>
                                        <div className="text-xs font-medium mb-2">
                                            {isCurrentPlayer ? 'You' : `P${player.position + 1}`} — Science
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <span title="Compass">🧭 {player.scienceCompass}</span>
                                            <span title="Gear">⚙️ {player.scienceGear}</span>
                                            <span title="Tablet">📜 {player.scienceTablet}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 text-[10px] text-white/30 text-center">
                            Scores are estimated mid-game. Final scoring includes guilds, commerce bonuses, and exact science calculations.
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
