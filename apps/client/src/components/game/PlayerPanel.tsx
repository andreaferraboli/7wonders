import { motion } from 'framer-motion';
import type { ClientPlayer } from '@/hooks/useColyseus';

interface PlayerPanelProps {
    player: ClientPlayer;
    isCurrentPlayer: boolean;
    position: 'left' | 'right' | 'top';
}

export function PlayerPanel({ player, isCurrentPlayer, position }: PlayerPanelProps) {
    return (
        <motion.div
            id={`player-panel-${player.position}`}
            className="rounded-xl p-3"
            style={{
                background: isCurrentPlayer
                    ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(205, 127, 50, 0.05))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                border: isCurrentPlayer
                    ? '1px solid rgba(212, 165, 116, 0.4)'
                    : player.isReady
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, x: position === 'left' ? -20 : position === 'right' ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Player header */}
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                        background: isCurrentPlayer
                            ? 'linear-gradient(135deg, #D4A574, #CD7F32)'
                            : 'rgba(255,255,255,0.08)',
                        color: isCurrentPlayer ? '#1A1A2E' : 'rgba(255,255,255,0.7)',
                    }}
                >
                    {player.isAI ? '🤖' : `P${player.position + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white/80 truncate">
                        {isCurrentPlayer ? 'Tu' : `Giocatore ${player.position + 1}`}
                        {player.isAI && <span className="text-yellow-400 ml-1 text-[10px]">(AI)</span>}
                    </div>
                    <div className="text-[9px] text-white/30 truncate">
                        {player.wonderId ? player.wonderId.charAt(0) + player.wonderId.slice(1).toLowerCase() : ''}
                    </div>
                </div>
                {player.isReady && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-1 text-center">
                <div className="rounded-md py-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px]">💰</div>
                    <div className="text-xs font-bold text-yellow-400">{player.coins}</div>
                </div>
                <div className="rounded-md py-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px]">⚔️</div>
                    <div className="text-xs font-bold text-red-400">{player.militaryPower}</div>
                </div>
                <div className="rounded-md py-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px]">🏗️</div>
                    <div className="text-xs font-bold text-blue-400">{player.cityCards.length}</div>
                </div>
            </div>

            {/* Science symbols */}
            {(player.scienceCompass > 0 || player.scienceGear > 0 || player.scienceTablet > 0) && (
                <div className="flex gap-1.5 mt-1.5 justify-center text-[10px]">
                    {player.scienceCompass > 0 && (
                        <span className="text-emerald-400">🧭{player.scienceCompass}</span>
                    )}
                    {player.scienceGear > 0 && (
                        <span className="text-emerald-400">⚙️{player.scienceGear}</span>
                    )}
                    {player.scienceTablet > 0 && (
                        <span className="text-emerald-400">📜{player.scienceTablet}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
