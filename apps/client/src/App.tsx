import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useColyseus } from './hooks/useColyseus';
import type { ClientPlayer } from './hooks/useColyseus';
import { CardHand } from './components/game/CardHand';
import { WonderBoard } from './components/game/WonderBoard';
import { PlayerPanel } from './components/game/PlayerPanel';
import { ResourcePanel } from './components/game/ResourcePanel';
import { NeighborPanel } from './components/game/NeighborPanel';
import { GameResults } from './components/game/GameResults';
import { Scoreboard } from './components/ui/Scoreboard';
import { EpochTransition } from './components/ui/EpochTransition';
import { MilitaryResults } from './components/ui/MilitaryResults';
import { useGameStore } from './stores/gameStore';
import type { ActionType } from '@7wonders/shared';

// Helper: count built cards by color (uses card ID prefix convention)
function countCardsByColor(cityCards: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    // We don't have card data on client, so approximate by ID patterns
    for (const card of cityCards) {
        // Try to get color from common 7 Wonders card naming
        let color = 'BLUE';
        const upper = card.toUpperCase();
        if (upper.includes('LUMBER') || upper.includes('STONE') || upper.includes('CLAY') || upper.includes('TIMBER') || upper.includes('QUARRY') || upper.includes('BRICKYARD') || upper.includes('SAWMILL') || upper.includes('MINE') || upper.includes('PRESS') || upper.includes('EXCAVATION') || upper.includes('FOREST') || upper.includes('TREE')) color = 'BROWN';
        else if (upper.includes('GLASS') || upper.includes('LOOM') || upper.includes('PAPYRUS') || upper.includes('PRESS')) color = 'GREY';
        else if (upper.includes('GUARD') || upper.includes('BARRACKS') || upper.includes('WALL') || upper.includes('TRAINING') || upper.includes('STABLES') || upper.includes('RANGE') || upper.includes('FORTIF') || upper.includes('ARSENAL') || upper.includes('SIEGE') || upper.includes('CIRCUS') || upper.includes('STOCKADE') || upper.includes('TOWER')) color = 'RED';
        else if (upper.includes('LODGE') || upper.includes('LIBRARY') || upper.includes('OBSERVATORY') || upper.includes('ACADEMY') || upper.includes('UNIVERSITY') || upper.includes('SCHOOL') || upper.includes('LABORATORY') || upper.includes('DISPENSARY') || upper.includes('STUDY') || upper.includes('WORKSHOP') || upper.includes('SCRIPTORIUM') || upper.includes('APOTHECARY')) color = 'GREEN';
        else if (upper.includes('MARKET') || upper.includes('TAVERN') || upper.includes('EAST') || upper.includes('WEST') || upper.includes('HAVEN') || upper.includes('LIGHTHOUSE') || upper.includes('ARENA') || upper.includes('CARAVANSERY') || upper.includes('FORUM') || upper.includes('VINEYARD') || upper.includes('CHAMBER')) color = 'YELLOW';
        else if (upper.includes('GUILD') || upper.includes('WORKERS') || upper.includes('CRAFTSMEN') || upper.includes('TRADERS') || upper.includes('MAGISTRATES') || upper.includes('SCIENTISTS') || upper.includes('SHIPOWNERS') || upper.includes('SPIES') || upper.includes('PHILOSOPHERS') || upper.includes('STRATEGISTS') || upper.includes('BUILDERS')) color = 'PURPLE';
        counts[color] = (counts[color] ?? 0) + 1;
    }
    return counts;
}

function App() {
    const {
        gameState, sessionId, error, isConnected, turnProgress,
        epochEvent, warResults, finalScores,
        createRoom, joinRoom, selectCard, clearError,
        dismissEpoch, dismissWar, leaveRoom,
    } = useColyseus();

    const { currentView, setCurrentView, showScoreboard, setShowScoreboard } = useGameStore();
    const [roomIdInput, setRoomIdInput] = useState('');
    const [playerCount, setPlayerCount] = useState(3);

    // Get current player
    const currentPlayer = useMemo(() => {
        if (!gameState || !sessionId) return null;
        return gameState.players.get(sessionId) ?? null;
    }, [gameState, sessionId]);

    // Get neighbors
    const neighbors = useMemo(() => {
        if (!gameState || !sessionId) return { left: null, right: null };
        const playerArray = Array.from(gameState.players.values());
        const myIndex = playerArray.findIndex(p => p.sessionId === sessionId);
        if (myIndex === -1) return { left: null, right: null };

        const leftIdx = (myIndex - 1 + playerArray.length) % playerArray.length;
        const rightIdx = (myIndex + 1) % playerArray.length;

        const toNeighborInfo = (p: ClientPlayer) => ({
            sessionId: p.sessionId,
            wonderId: p.wonderId,
            coins: p.coins,
            militaryPower: p.militaryPower,
            builtCardsCount: p.cityCards.length,
            wonderStagesBuilt: p.wonderStagesBuilt,
            isAI: p.isAI,
        });

        return {
            left: playerArray[leftIdx] ? toNeighborInfo(playerArray[leftIdx]) : null,
            right: playerArray[rightIdx] ? toNeighborInfo(playerArray[rightIdx]) : null,
        };
    }, [gameState, sessionId]);

    // Other players (for top/side panels)  
    const otherPlayers = useMemo(() => {
        if (!gameState || !sessionId) return [];
        const others: Array<{ player: ClientPlayer; position: 'left' | 'right' | 'top' }> = [];
        const positions: Array<'left' | 'right' | 'top'> = ['left', 'right', 'top'];
        let posIndex = 0;

        gameState.players.forEach((player, key) => {
            if (key !== sessionId && posIndex < positions.length) {
                others.push({ player, position: positions[posIndex] });
                posIndex++;
            }
        });
        return others;
    }, [gameState, sessionId]);

    // Build card data for hand
    const handCards = useMemo(() => {
        if (!currentPlayer) return [];
        return currentPlayer.hand.map((cardId) => ({
            id: cardId,
            name: cardId.replace(/_/g, ' ').replace(/\d+P$/i, ''),
        }));
    }, [currentPlayer]);

    // Card color counts for ResourcePanel
    const builtCardColors = useMemo(() => {
        if (!currentPlayer) return {};
        return countCardsByColor(currentPlayer.cityCards);
    }, [currentPlayer]);

    const handleCreateRoom = async () => {
        const roomId = await createRoom({ playerCount, allowAI: true });
        if (roomId) {
            setCurrentView('game');
        }
    };

    const handleJoinRoom = async () => {
        if (!roomIdInput.trim()) return;
        const success = await joinRoom(roomIdInput.trim());
        if (success) {
            setCurrentView('game');
        }
    };

    const handlePlayAgain = () => {
        leaveRoom();
        setCurrentView('lobby');
    };

    // Auto-switch to game view when game starts
    if (gameState?.phase === 'DRAFT' && currentView === 'lobby') {
        setCurrentView('game');
    }
    if (gameState?.phase === 'FINISHED' && currentView !== 'results') {
        setCurrentView('results');
    }

    return (
        <div className="min-h-screen bg-marble-texture">
            {/* Error toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="fixed top-4 right-4 z-50 glass-panel p-4 border border-red-500/50 max-w-sm"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-red-400">⚠️</span>
                            <div className="flex-1">
                                <p className="text-sm text-red-300">{error}</p>
                                <button
                                    className="text-xs text-white/50 hover:text-white mt-1"
                                    onClick={clearError}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════ LOBBY VIEW ═══════════════ */}
            {currentView === 'lobby' && (
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="glass-panel p-8 w-full max-w-md mx-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="font-display text-5xl font-bold text-ancient-gold mb-2">
                                7 Wonders
                            </h1>
                            <p className="text-white/50 text-sm">Build your civilization across three ages</p>
                            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-ancient-gold/30 to-transparent" />
                        </div>

                        {/* Create game */}
                        <div className="space-y-4 mb-6">
                            <h2 className="font-display text-lg text-ancient-gold/80">Create New Game</h2>
                            <div>
                                <label className="block text-xs text-white/60 mb-1">Number of Players</label>
                                <div className="flex gap-2">
                                    {[3, 4, 5, 6, 7].map((n) => (
                                        <button
                                            key={n}
                                            id={`player-count-${n}`}
                                            className={`
                                                flex-1 py-2 rounded-lg text-sm font-medium transition-all
                                                ${playerCount === n
                                                    ? 'bg-ancient-gold/20 border border-ancient-gold/50 text-ancient-gold'
                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'}
                                            `}
                                            onClick={() => setPlayerCount(n)}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                id="btn-create-room"
                                className="btn-primary w-full text-center"
                                onClick={handleCreateRoom}
                                disabled={isConnected}
                            >
                                🏛️ Create Room
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-white/30">OR</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Join game */}
                        <div className="space-y-3">
                            <h2 className="font-display text-lg text-ancient-gold/80">Join Game</h2>
                            <input
                                id="room-id-input"
                                type="text"
                                placeholder="Enter Room ID..."
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-ancient-gold/50"
                                value={roomIdInput}
                                onChange={(e) => setRoomIdInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                            />
                            <button
                                id="btn-join-room"
                                className="btn-primary w-full text-center opacity-80 hover:opacity-100"
                                onClick={handleJoinRoom}
                                disabled={isConnected || !roomIdInput.trim()}
                            >
                                🚪 Join Room
                            </button>
                        </div>

                        {/* Connection status */}
                        {isConnected && (
                            <motion.div
                                className="mt-4 flex items-center gap-2 text-sm text-emerald-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Connected — waiting for players...
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* ═══════════════ GAME VIEW ═══════════════ */}
            {currentView === 'game' && gameState && gameState.phase !== 'LOBBY' && (
                <div className="relative min-h-screen pb-52">
                    {/* Top bar */}
                    <div className="fixed top-0 left-0 right-0 z-30 glass-panel rounded-none border-x-0 border-t-0 px-6 py-3">
                        <div className="flex items-center justify-between max-w-7xl mx-auto">
                            <div className="flex items-center gap-4">
                                <h1 className="font-display text-xl font-bold text-ancient-gold">7 Wonders</h1>
                                <div className="h-4 w-px bg-white/20" />
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-white/60">
                                        Age <span className="text-white font-bold">{gameState.epoch}</span>
                                    </span>
                                    <span className="text-white/60">
                                        Turn <span className="text-white font-bold">{gameState.turn}</span>/6
                                    </span>
                                    <span className={`
                                        px-2 py-0.5 rounded text-xs font-medium
                                        ${gameState.phase === 'DRAFT' ? 'bg-blue-500/20 text-blue-300' : ''}
                                        ${gameState.phase === 'RESOLUTION' ? 'bg-amber-500/20 text-amber-300' : ''}
                                        ${gameState.phase === 'WAR' ? 'bg-red-500/20 text-red-300' : ''}
                                    `}>
                                        {gameState.phase}
                                    </span>
                                </div>
                            </div>

                            {/* Turn progress */}
                            {turnProgress && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-white/50">Ready:</span>
                                    <span className="text-ancient-gold font-bold">
                                        {turnProgress.ready}/{turnProgress.total}
                                    </span>
                                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-ancient-gold rounded-full"
                                            animate={{ width: `${(turnProgress.ready / turnProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Right controls */}
                            <div className="flex items-center gap-3 text-sm text-white/50">
                                <button
                                    id="btn-scoreboard"
                                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all"
                                    onClick={() => setShowScoreboard(true)}
                                >
                                    📊 Score
                                </button>
                                <span>{gameState.direction === 'LEFT' ? '⬅️' : '➡️'}</span>
                                <span>Pass {gameState.direction.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Neighbor panels */}
                    <div className="fixed top-20 left-4 z-20 w-48">
                        <NeighborPanel direction="left" neighbor={neighbors.left} />
                    </div>
                    <div className="fixed top-20 right-4 z-20 w-48">
                        <NeighborPanel direction="right" neighbor={neighbors.right} />
                    </div>

                    {/* Player panels (other players) */}
                    {otherPlayers.slice(2).map(({ player, position }) => (
                        <PlayerPanel
                            key={player.sessionId}
                            player={player}
                            isCurrentPlayer={false}
                            position={position}
                        />
                    ))}

                    {/* Center: Wonder board + resources */}
                    <div className="pt-24 px-8 flex justify-center">
                        {currentPlayer && currentPlayer.wonderId && (
                            <div className="w-full max-w-xl">
                                <WonderBoard
                                    wonderId={currentPlayer.wonderId}
                                    wonderSide={currentPlayer.wonderSide}
                                    stagesBuilt={currentPlayer.wonderStagesBuilt}
                                    startingResource={undefined}
                                    onBuildStage={() => {
                                        // Future: integrate wonder building from board click
                                    }}
                                />

                                {/* Resource panel */}
                                <div className="mt-3">
                                    <ResourcePanel
                                        coins={currentPlayer.coins}
                                        militaryPower={currentPlayer.militaryPower}
                                        scienceCompass={currentPlayer.scienceCompass}
                                        scienceGear={currentPlayer.scienceGear}
                                        scienceTablet={currentPlayer.scienceTablet}
                                        builtCardColors={builtCardColors}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card hand */}
                    <CardHand
                        cards={handCards}
                        onSelectCard={(cardId, action) => selectCard(cardId, action)}
                        disabled={currentPlayer?.isReady ?? false}
                    />

                    {/* Ready overlay */}
                    <AnimatePresence>
                        {currentPlayer?.isReady && (
                            <motion.div
                                className="fixed bottom-52 left-1/2 -translate-x-1/2 z-30"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="glass-panel px-6 py-3 border-emerald-500/30 flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-300 text-sm font-medium">
                                        Waiting for other players...
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scoreboard overlay */}
                    <Scoreboard
                        players={gameState.players}
                        currentSessionId={sessionId}
                        visible={showScoreboard}
                        onClose={() => setShowScoreboard(false)}
                    />

                    {/* Epoch transition overlay */}
                    {epochEvent && (
                        <EpochTransition
                            epoch={epochEvent.epoch}
                            visible={true}
                            onComplete={dismissEpoch}
                        />
                    )}

                    {/* Military results overlay */}
                    {warResults && (
                        <MilitaryResults
                            epoch={warResults.epoch}
                            results={(warResults.results as Array<{
                                playerId: string;
                                tokens: Array<{ value: number; type: string }>;
                            }>).flatMap(r =>
                                r.tokens.map(t => ({
                                    opponentName: r.playerId === sessionId ? 'Neighbor' : `Player`,
                                    yourPower: 0,
                                    theirPower: 0,
                                    result: (t.type === 'VICTORY' ? 'victory' : t.value < 0 ? 'defeat' : 'draw') as 'victory' | 'defeat' | 'draw',
                                    token: t.value,
                                }))
                            )}
                            visible={true}
                            onClose={dismissWar}
                        />
                    )}
                </div>
            )}

            {/* ═══════════════ RESULTS VIEW ═══════════════ */}
            {currentView === 'results' && finalScores && (
                <GameResults
                    scores={finalScores as Array<{
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
                    }>}
                    currentPlayerId={sessionId}
                    onPlayAgain={handlePlayAgain}
                />
            )}

            {/* Fallback results if no final scores yet but game finished */}
            {currentView === 'results' && !finalScores && gameState && (
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="glass-panel p-8 w-full max-w-lg mx-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-center mb-6">
                            <h1 className="font-display text-4xl font-bold text-ancient-gold mb-2">
                                🏆 Game Over
                            </h1>
                            <p className="text-white/50 text-sm">Computing final scores...</p>
                        </div>
                        <button
                            id="btn-new-game"
                            className="btn-primary w-full mt-6 text-center"
                            onClick={handlePlayAgain}
                        >
                            🔄 New Game
                        </button>
                    </motion.div>
                </div>
            )}

            {/* ═══════════════ WAITING/LOBBY STATE ═══════════════ */}
            {currentView === 'game' && gameState?.phase === 'LOBBY' && (
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="glass-panel p-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="animate-float text-6xl mb-4">🏛️</div>
                        <h2 className="font-display text-2xl text-ancient-gold mb-2">
                            Waiting for Players
                        </h2>
                        <p className="text-white/50 text-sm mb-4">
                            {gameState.players.size} players connected
                        </p>
                        <p className="text-xs text-white/30">
                            Room ID: <code className="bg-white/10 px-2 py-0.5 rounded">{gameState.gameId}</code>
                        </p>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default App;
