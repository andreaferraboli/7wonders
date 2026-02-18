import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useColyseus } from './hooks/useColyseus';
import type { ClientPlayer } from './hooks/useColyseus';
import { CardHand } from './components/game/CardHand';
import { WonderBoard } from './components/game/WonderBoard';
import { PlayerPanel } from './components/game/PlayerPanel';
import { NeighborPanel } from './components/game/NeighborPanel';
import { BuiltCardsArea } from './components/game/BuiltCardsArea';
import { EpochTransition } from './components/ui/EpochTransition';
import type { ActionType } from '@7wonders/shared';
import { useGameStore } from './stores/gameStore';

function App() {
    const {
        gameState,
        error,
        isConnected,
        sessionId,
        roomId,
        turnProgress,
        epochEvent,
        warResults,
        finalScores,
        createRoom,
        joinRoom,
        selectCard,
        startGame,
        leaveRoom,
        clearError,
        dismissEpoch,
        dismissWar,
    } = useColyseus();

    const [playerCount, setPlayerCount] = useState(3);
    const [aiPlayers, setAiPlayers] = useState(true);
    const [joinRoomId, setJoinRoomId] = useState('');

    const [showEpochTransition, setShowEpochTransition] = useState(false);

    // Current player
    const currentPlayer = useMemo(() => {
        if (!gameState || !sessionId) return null;
        return gameState.players.get(sessionId) ?? null;
    }, [gameState, sessionId]);

    // Is connected to a room?
    const isInRoom = !!roomId && isConnected;

    // Phase
    const phase = gameState?.phase ?? 'LOBBY';

    // Handle epoch events
    useEffect(() => {
        if (epochEvent) {
            setShowEpochTransition(true);
            const timer = setTimeout(() => {
                setShowEpochTransition(false);
                dismissEpoch();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [epochEvent, dismissEpoch]);

    // Get neighbors
    const neighbors = useMemo(() => {
        if (!gameState || !currentPlayer) return { left: null, right: null };
        const players = Array.from(gameState.players.values());
        const myIndex = players.findIndex((p: { sessionId: string }) => p.sessionId === currentPlayer.sessionId);
        if (myIndex < 0) return { left: null, right: null };

        const leftIndex = (myIndex - 1 + players.length) % players.length;
        const rightIndex = (myIndex + 1) % players.length;

        return {
            left: players[leftIndex] ?? null,
            right: players[rightIndex] ?? null,
        };
    }, [gameState, currentPlayer]);

    // Other players (not self, not neighbors)
    const otherPlayers = useMemo(() => {
        if (!gameState || !currentPlayer) return [];
        const players = Array.from(gameState.players.values());
        const myIndex = players.findIndex((p: { sessionId: string }) => p.sessionId === currentPlayer.sessionId);
        if (myIndex < 0) return [];

        return players.filter((_p: unknown, i: number) => {
            const leftIndex = (myIndex - 1 + players.length) % players.length;
            const rightIndex = (myIndex + 1) % players.length;
            return i !== myIndex && i !== leftIndex && i !== rightIndex;
        });
    }, [gameState, currentPlayer]);

    // Handle card action
    const handleCardAction = (cardId: string, action: ActionType) => {
        selectCard(cardId, action);
    };

    // ==========================================
    // SCREEN 1: Home / Create or Join
    // ==========================================
    if (!isInRoom) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: 'radial-gradient(ellipse at 30% 30%, #1A1A2E, #0F0F23)',
                }}
            >
                <motion.div
                    className="w-full max-w-lg p-8 rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                        border: '1px solid rgba(212, 165, 116, 0.3)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Title */}
                    <div className="text-center mb-8">
                        <motion.h1
                            className="text-5xl font-bold mb-2"
                            style={{
                                fontFamily: 'Cinzel, Georgia, serif',
                                background: 'linear-gradient(to right, #D4A574, #FFD700, #CD7F32)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            7 Wonders
                        </motion.h1>
                        <p className="text-white/40 text-sm">Costruisci la tua civiltà antica</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="mb-4 px-4 py-2 rounded-lg text-sm text-red-300 cursor-pointer"
                            style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)' }}
                            onClick={clearError}
                        >
                            {error}
                        </div>
                    )}

                    {/* Create Game */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Giocatori</label>
                            <div className="flex gap-2">
                                {[3, 4, 5, 6, 7].map(n => (
                                    <button
                                        key={n}
                                        className="flex-1 py-2 rounded-lg font-bold text-sm transition-all"
                                        style={{
                                            background: playerCount === n
                                                ? 'linear-gradient(135deg, #D4A574, #CD7F32)'
                                                : 'rgba(255,255,255,0.06)',
                                            color: playerCount === n ? '#1A1A2E' : 'rgba(255,255,255,0.5)',
                                            border: playerCount === n
                                                ? '1px solid #D4A574'
                                                : '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        onClick={() => setPlayerCount(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="input-ai-toggle"
                                type="checkbox"
                                className="w-4 h-4 accent-amber-500"
                                checked={aiPlayers}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiPlayers(e.target.checked)}
                            />
                            <label className="text-sm text-white/60">Completa con AI (inizia subito)</label>
                        </div>

                        <button
                            id="btn-create-room"
                            className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                fontFamily: 'Cinzel, Georgia, serif',
                                background: 'linear-gradient(135deg, #D4A574, #CD7F32)',
                                color: '#1A1A2E',
                                boxShadow: '0 4px 20px rgba(212, 165, 116, 0.3)',
                            }}
                            onClick={() => createRoom({
                                playerCount,
                                expansions: [],
                                allowAI: aiPlayers,
                            })}
                        >
                            {aiPlayers ? 'Gioca Subito' : 'Crea Lobby'}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-white/30 uppercase">oppure unisciti</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Join Game */}
                    <div className="flex gap-2">
                        <input
                            id="input-room-id"
                            type="text"
                            className="flex-1 px-4 py-3 rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-amber-500/50"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                            placeholder="ID Stanza..."
                            value={joinRoomId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinRoomId(e.target.value)}
                        />
                        <button
                            id="btn-join-room"
                            className="px-6 py-3 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(212, 165, 116, 0.3)',
                                color: '#D4A574',
                            }}
                            onClick={() => joinRoom(joinRoomId)}
                        >
                            Unisciti
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // SCREEN 2: Lobby / Waiting for players
    // ==========================================
    if (phase === 'LOBBY') {
        const humanPlayers = gameState
            ? Array.from(gameState.players.values()).filter((p: { isAI: boolean }) => !p.isAI)
            : [];
        const expectedPlayers = playerCount;

        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: 'radial-gradient(ellipse at 30% 30%, #1A1A2E, #0F0F23)',
                }}
            >
                <motion.div
                    className="w-full max-w-md p-8 rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                        border: '1px solid rgba(212, 165, 116, 0.3)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-6">
                        <h2
                            className="text-3xl font-bold mb-1"
                            style={{
                                fontFamily: 'Cinzel, Georgia, serif',
                                background: 'linear-gradient(to right, #D4A574, #FFD700, #CD7F32)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Lobby
                        </h2>
                        <p className="text-white/40 text-sm">In attesa di giocatori...</p>
                    </div>

                    {/* Room ID */}
                    <div
                        className="mb-6 px-4 py-3 rounded-lg text-center"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">ID Stanza</div>
                        <div className="text-lg font-mono text-amber-400 select-all">{roomId}</div>
                    </div>

                    {/* Player list */}
                    <div className="space-y-2 mb-6">
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                            Giocatori ({humanPlayers.length}/{expectedPlayers})
                        </div>
                        {humanPlayers.map((p: { sessionId: string }, i: number) => (
                            <div
                                key={p.sessionId}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #D4A574, #CD7F32)',
                                        color: '#1A1A2E',
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <span className="text-white/70 text-sm">
                                    {p.sessionId === sessionId ? 'Tu (Host)' : `Giocatore ${i + 1}`}
                                </span>
                                {p.sessionId === sessionId && (
                                    <span className="ml-auto text-[10px] text-emerald-400/60 uppercase">host</span>
                                )}
                            </div>
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: expectedPlayers - humanPlayers.length }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px dashed rgba(255,255,255,0.08)',
                                }}
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                    style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
                                >
                                    <span className="text-white/20">?</span>
                                </div>
                                <span className="text-white/20 text-sm">In attesa...</span>
                            </div>
                        ))}
                    </div>

                    {/* Pulsante animato attesa */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: '#D4A574' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: '#D4A574' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: '#D4A574' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        />
                    </div>

                    {/* Start with AI button */}
                    <button
                        className="w-full py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
                        style={{
                            fontFamily: 'Cinzel, Georgia, serif',
                            background: 'linear-gradient(135deg, #D4A574, #CD7F32)',
                            color: '#1A1A2E',
                            boxShadow: '0 4px 20px rgba(212, 165, 116, 0.3)',
                        }}
                        onClick={() => startGame()}
                    >
                        Avvia Partita (riempi con AI)
                    </button>

                    {/* Leave button */}
                    <button
                        className="w-full py-2 rounded-lg font-medium text-sm transition-all hover:bg-white/5"
                        style={{
                            color: 'rgba(255,255,255,0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onClick={leaveRoom}
                    >
                        Esci dalla Lobby
                    </button>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // SCREEN 3: Game
    // ==========================================
    if (!gameState || !currentPlayer) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0F23' }}>
                <div className="text-white/40 text-lg">Caricamento partita...</div>
            </div>
        );
    }

    const isPlayerReady = currentPlayer.isReady;
    const handCards = Array.from(currentPlayer.hand).map((id: unknown) => ({
        id: id as string,
        name: (id as string).replace(/_/g, ' '),
        epoch: gameState.epoch,
    }));

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                background: 'radial-gradient(ellipse at 50% 30%, #1A1A2E, #0F0F23)',
            }}
        >
            {/* ========== TOP BAR ========== */}
            <div
                className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between"
                style={{
                    background: 'linear-gradient(to bottom, rgba(15,15,35,0.95), rgba(15,15,35,0.7))',
                    borderBottom: '1px solid rgba(212, 165, 116, 0.15)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Left: epoch & turn */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-lg font-bold"
                            style={{ fontFamily: 'Cinzel, Georgia, serif', color: '#D4A574' }}
                        >
                            {['I', 'II', 'III'][gameState.epoch - 1]}
                        </span>
                        <span className="text-white/30 text-xs">
                            Turno {gameState.turn}/6
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/40">
                        <span>{gameState.direction === 'LEFT' ? '\u2B05' : '\u27A1'}</span>
                        <span>{gameState.direction === 'LEFT' ? 'Sinistra' : 'Destra'}</span>
                    </div>
                </div>

                {/* Center: phase */}
                <div className="flex items-center gap-2">
                    {turnProgress && (
                        <span className="text-xs text-white/40 mr-2">
                            {turnProgress.ready}/{turnProgress.total} pronti
                        </span>
                    )}
                    <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                            backgroundColor: phase === 'DRAFT' ? '#16a34a' : phase === 'WAR' ? '#dc2626' : '#f59e0b',
                        }}
                    />
                    <span className="text-xs text-white/50 uppercase tracking-wider">
                        {phase === 'DRAFT' ? 'Scegli carta' : phase === 'WAR' ? 'Guerra' : phase}
                    </span>
                </div>

                {/* Right: stats */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5" title="Monete">
                        <span className="text-base">💰</span>
                        <span className="text-yellow-400 font-bold font-mono text-sm">{currentPlayer.coins}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Militare">
                        <span className="text-base">⚔️</span>
                        <span className="text-red-400 font-bold font-mono text-sm">{currentPlayer.militaryPower}</span>
                    </div>
                    <button
                        className="text-xs text-white/30 hover:text-white/60 transition-colors ml-2"
                        onClick={leaveRoom}
                        title="Lascia partita"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* ========== GAME CONTENT ========== */}
            <div className="pt-16 pb-64 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">

                    {/* LEFT COLUMN */}
                    <div className="col-span-2 flex flex-col gap-4 pt-4">
                        {neighbors.left && (
                            <NeighborPanel
                                direction="left"
                                neighbor={{
                                    sessionId: neighbors.left.sessionId,
                                    wonderId: neighbors.left.wonderId,
                                    coins: neighbors.left.coins,
                                    militaryPower: neighbors.left.militaryPower,
                                    builtCardsCount: neighbors.left.cityCards.length,
                                    wonderStagesBuilt: neighbors.left.wonderStagesBuilt,
                                    isAI: neighbors.left.isAI,
                                }}
                            />
                        )}
                        {otherPlayers.slice(0, 2).map((player: ClientPlayer) => (
                            <PlayerPanel
                                key={player.sessionId}
                                player={player}
                                isCurrentPlayer={false}
                                position="left"
                            />
                        ))}
                    </div>

                    {/* CENTER */}
                    <div className="col-span-8 flex flex-col gap-4">
                        <WonderBoard
                            wonderId={currentPlayer.wonderId}
                            wonderSide={currentPlayer.wonderSide}
                            stagesBuilt={currentPlayer.wonderStagesBuilt}
                        />
                        <BuiltCardsArea
                            cards={Array.from(currentPlayer.cityCards).map((id: unknown) => ({
                                id: id as string,
                                name: (id as string).replace(/_/g, ' '),
                            }))}
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-2 flex flex-col gap-4 pt-4">
                        {neighbors.right && (
                            <NeighborPanel
                                direction="right"
                                neighbor={{
                                    sessionId: neighbors.right.sessionId,
                                    wonderId: neighbors.right.wonderId,
                                    coins: neighbors.right.coins,
                                    militaryPower: neighbors.right.militaryPower,
                                    builtCardsCount: neighbors.right.cityCards.length,
                                    wonderStagesBuilt: neighbors.right.wonderStagesBuilt,
                                    isAI: neighbors.right.isAI,
                                }}
                            />
                        )}
                        {otherPlayers.slice(2).map((player: ClientPlayer) => (
                            <PlayerPanel
                                key={player.sessionId}
                                player={player}
                                isCurrentPlayer={false}
                                position="right"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== CARD HAND ========== */}
            <CardHand
                cards={handCards}
                onSelectCard={handleCardAction}
                disabled={isPlayerReady || phase !== 'DRAFT'}
            />

            {/* ========== READY INDICATOR ========== */}
            <AnimatePresence>
                {isPlayerReady && phase === 'DRAFT' && (
                    <motion.div
                        className="fixed bottom-52 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(21, 128, 61, 0.9))',
                            border: '1px solid rgba(34, 197, 94, 0.5)',
                            boxShadow: '0 4px 20px rgba(22, 163, 74, 0.3)',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <span className="text-white font-medium text-sm">
                            In attesa degli altri giocatori...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== EPOCH TRANSITION ========== */}
            <AnimatePresence>
                {showEpochTransition && epochEvent && (
                    <EpochTransition
                        epoch={epochEvent.epoch}
                        onComplete={() => {
                            setShowEpochTransition(false);
                            dismissEpoch();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ========== GAME FINISHED ========== */}
            {phase === 'FINISHED' && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    style={{
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="text-center p-8 rounded-2xl max-w-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                            border: '1px solid rgba(212, 165, 116, 0.3)',
                        }}
                        initial={{ scale: 0.8, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <h2
                            className="text-4xl font-bold mb-4"
                            style={{
                                fontFamily: 'Cinzel, Georgia, serif',
                                background: 'linear-gradient(to right, #D4A574, #FFD700, #CD7F32)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Partita Conclusa!
                        </h2>

                        {finalScores && (
                            <div className="mt-6 space-y-2">
                                {(finalScores as Array<{ playerId: string; total: number }>).map((score, index) => (
                                    <div
                                        key={score.playerId}
                                        className="flex items-center justify-between px-4 py-2 rounded-lg"
                                        style={{
                                            background: index === 0
                                                ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(205, 127, 50, 0.1))'
                                                : 'rgba(255,255,255,0.03)',
                                            border: index === 0
                                                ? '1px solid rgba(212, 165, 116, 0.4)'
                                                : '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                            </span>
                                            <span className="text-sm text-white/70">
                                                {score.playerId === sessionId ? 'Tu' : 'Giocatore'}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold" style={{ color: '#D4A574' }}>
                                            {score.total} VP
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="mt-6 px-6 py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(212, 165, 116, 0.3)',
                                color: '#D4A574',
                            }}
                            onClick={leaveRoom}
                        >
                            Torna alla Home
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {/* ========== ERROR TOAST ========== */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2 rounded-lg cursor-pointer"
                        style={{
                            background: 'rgba(220, 38, 38, 0.9)',
                            border: '1px solid rgba(248, 113, 113, 0.5)',
                            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
                        }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={clearError}
                    >
                        <span className="text-white text-sm">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
