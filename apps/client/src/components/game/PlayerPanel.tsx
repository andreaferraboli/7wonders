import { motion } from 'framer-motion';
import type { ClientPlayer } from '@/hooks/useColyseus';

interface PlayerPanelProps {
    player: ClientPlayer;
    isCurrentPlayer: boolean;
    position: 'left' | 'right' | 'top';
}

export function PlayerPanel({ player, isCurrentPlayer, position }: PlayerPanelProps) {
    const positionClasses = {
        left: 'absolute left-4 top-1/3',
        right: 'absolute right-4 top-1/3',
        top: 'absolute top-4 left-1/2 -translate-x-1/2',
    };

    return (
        <motion.div
            id={`player-panel-${player.position}`}
            className={`
        ${positionClasses[position]}
        glass-panel p-3 w-52
        ${isCurrentPlayer ? 'gold-border animate-glow' : ''}
        ${player.isReady ? 'border-emerald-500/50' : ''}
      `}
            initial={{ opacity: 0, x: position === 'left' ? -50 : position === 'right' ? 50 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Player header */}
            <div className="flex items-center gap-2 mb-2">
                <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isCurrentPlayer
                        ? 'bg-gradient-to-br from-ancient-gold to-ancient-bronze text-dark-marble'
                        : 'bg-white/10 text-white'}
        `}>
                    {player.isAI ? '🤖' : `P${player.position + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                        {isCurrentPlayer ? 'You' : `Player ${player.position + 1}`}
                        {player.isAI && <span className="text-xs text-yellow-400 ml-1">(AI)</span>}
                    </div>
                    <div className="text-[10px] text-white/50">
                        {player.wonderId ? player.wonderId.charAt(0) + player.wonderId.slice(1).toLowerCase() : 'No wonder'}
                    </div>
                </div>
                {/* Ready indicator */}
                {player.isReady && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" title="Ready" />
                )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1 text-center">
                <div className="bg-white/5 rounded-md py-1">
                    <div className="text-xs text-yellow-400">💰</div>
                    <div className="text-sm font-bold">{player.coins}</div>
                </div>
                <div className="bg-white/5 rounded-md py-1">
                    <div className="text-xs text-red-400">⚔️</div>
                    <div className="text-sm font-bold">{player.militaryPower}</div>
                </div>
                <div className="bg-white/5 rounded-md py-1">
                    <div className="text-xs text-blue-400">🏛️</div>
                    <div className="text-sm font-bold">{player.cityCards.length}</div>
                </div>
            </div>

            {/* Science symbols */}
            {(player.scienceCompass > 0 || player.scienceGear > 0 || player.scienceTablet > 0) && (
                <div className="flex gap-2 mt-2 justify-center text-xs">
                    {player.scienceCompass > 0 && (
                        <span className="bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-300">
                            🧭 {player.scienceCompass}
                        </span>
                    )}
                    {player.scienceGear > 0 && (
                        <span className="bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-300">
                            ⚙️ {player.scienceGear}
                        </span>
                    )}
                    {player.scienceTablet > 0 && (
                        <span className="bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-300">
                            📜 {player.scienceTablet}
                        </span>
                    )}
                </div>
            )}

            {/* Military tokens */}
            {player.militaryTokens.length > 0 && (
                <div className="flex gap-1 mt-2 justify-center flex-wrap">
                    {player.militaryTokens.map((token, i) => (
                        <span
                            key={i}
                            className={`
                text-[10px] px-1 py-0.5 rounded font-bold
                ${token.startsWith('+')
                                    ? 'bg-red-900/50 text-red-300'
                                    : 'bg-gray-800/50 text-gray-400'}
              `}
                        >
                            {token}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
