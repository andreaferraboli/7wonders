import { useCallback, useEffect, useRef, useState } from 'react';
import { Room } from 'colyseus.js';
import { colyseusClient } from '@/lib/colyseus';
import type { ActionType } from '@7wonders/shared';

// Simplified game state interface for the client
export interface ClientGameState {
    gameId: string;
    phase: string;
    epoch: number;
    turn: number;
    direction: string;
    players: Map<string, ClientPlayer>;
    seed: string;
}

export interface ClientPlayer {
    sessionId: string;
    userId: string;
    position: number;
    wonderId: string;
    wonderSide: string;
    wonderStagesBuilt: number;
    cityCards: string[];
    coins: number;
    militaryPower: number;
    militaryTokens: string[];
    scienceCompass: number;
    scienceGear: number;
    scienceTablet: number;
    hand: string[];
    selectedCard: string;
    selectedAction: string;
    isReady: boolean;
    isAI: boolean;
}

export interface TurnProgress {
    ready: number;
    total: number;
}

export interface ServerError {
    code: string;
    message?: string;
    errors?: string[];
}

export function useColyseus() {
    const roomRef = useRef<Room | null>(null);
    const [gameState, setGameState] = useState<ClientGameState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [turnProgress, setTurnProgress] = useState<TurnProgress | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [epochEvent, setEpochEvent] = useState<{ epoch: number; direction: string } | null>(null);
    const [warResults, setWarResults] = useState<{ epoch: number; results: unknown[] } | null>(null);
    const [finalScores, setFinalScores] = useState<unknown[] | null>(null);

    // Convert Colyseus schema to plain object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemaToState = useCallback((state: any): ClientGameState => {
        // Colyseus Schema objects need toJSON() to get plain properties
        const json = typeof state.toJSON === 'function' ? state.toJSON() : state;

        const playersMap = new Map<string, ClientPlayer>();

        // Players can be a Map, object, or MapSchema
        const playersSource = state.players;
        if (playersSource) {
            const iteratePlayers = (player: any, key: string) => {
                const p = typeof player.toJSON === 'function' ? player.toJSON() : player;
                playersMap.set(key, {
                    sessionId: p.sessionId ?? '',
                    userId: p.userId ?? '',
                    position: p.position ?? 0,
                    wonderId: p.wonderId ?? '',
                    wonderSide: p.wonderSide ?? 'DAY',
                    wonderStagesBuilt: p.wonderStagesBuilt ?? 0,
                    cityCards: Array.isArray(p.cityCards) ? p.cityCards : [],
                    coins: p.coins ?? 3,
                    militaryPower: p.militaryPower ?? 0,
                    militaryTokens: Array.isArray(p.militaryTokens) ? p.militaryTokens : [],
                    scienceCompass: p.scienceCompass ?? 0,
                    scienceGear: p.scienceGear ?? 0,
                    scienceTablet: p.scienceTablet ?? 0,
                    hand: Array.isArray(p.hand) ? p.hand : [],
                    selectedCard: p.selectedCard ?? '',
                    selectedAction: p.selectedAction ?? '',
                    isReady: p.isReady ?? false,
                    isAI: p.isAI ?? false,
                });
            };

            if (typeof playersSource.forEach === 'function') {
                playersSource.forEach(iteratePlayers);
            } else if (typeof playersSource === 'object') {
                Object.entries(playersSource).forEach(([key, val]) => iteratePlayers(val, key));
            }
        }

        return {
            gameId: json.gameId ?? '',
            phase: json.phase ?? 'LOBBY',
            epoch: json.epoch ?? 1,
            turn: json.turn ?? 0,
            direction: json.direction ?? 'LEFT',
            players: playersMap,
            seed: json.seed ?? '',
        };
    }, []);

    const setupRoomListeners = useCallback((room: Room) => {
        room.onStateChange((state) => {
            const gs = schemaToState(state);
            console.log('[Colyseus] onStateChange - phase:', gs.phase, 'epoch:', gs.epoch, 'turn:', gs.turn, 'players:', gs.players.size);
            setGameState(gs);
        });

        room.onMessage('error', (message: ServerError) => {
            console.error('Server error:', message);
            setError(message.code + (message.message ? `: ${message.message}` : ''));
        });

        room.onMessage('turn_progress', (data: TurnProgress) => {
            setTurnProgress(data);
        });

        room.onMessage('turn_resolved', (data) => {
            console.log('Turn resolved:', data);
            setTurnProgress(null);
        });

        room.onMessage('epoch_start', (data: { epoch: number; direction: string }) => {
            console.log('Epoch started:', data);
            setEpochEvent(data);
            // Force re-read state in case onStateChange didn't fire
            setGameState(schemaToState(room.state));
        });

        room.onMessage('war_resolved', (data: { epoch: number; results: unknown[] }) => {
            console.log('War resolved:', data);
            setWarResults(data);
        });

        room.onMessage('game_end', (data: { scores: unknown[] }) => {
            console.log('Game ended:', data);
            setFinalScores(data.scores);
        });

        room.onMessage('player_joined', (data) => {
            console.log('Player joined:', data);
            // Force re-read state to update player list in lobby
            setGameState(schemaToState(room.state));
        });

        room.onLeave((code) => {
            console.log('Left room with code:', code);
            setIsConnected(false);
            setRoomId(null);
            roomRef.current = null;
        });
    }, [schemaToState]);

    const createRoom = useCallback(async (config?: {
        playerCount?: number;
        expansions?: string[];
        allowAI?: boolean;
    }) => {
        try {
            setError(null);
            const roomConfig = {
                config: {
                    playerCount: config?.playerCount ?? 3,
                    expansions: config?.expansions ?? [],
                    allowAI: config?.allowAI ?? true,
                },
            };
            console.log('Creating room with config:', roomConfig);
            const room = await colyseusClient.create('7wonders', roomConfig);
            roomRef.current = room;
            setSessionId(room.sessionId);
            setRoomId(room.id);
            setIsConnected(true);
            setupRoomListeners(room);
            // Read initial state immediately (may already be DRAFT if AI filled)
            setGameState(schemaToState(room.state));
            const initialState = schemaToState(room.state);
            console.log('Room created:', room.id, 'Session:', room.sessionId, 'Phase:', initialState.phase);
            return room.id;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to create room';
            console.error('Create room error:', e);
            setError(msg);
            return null;
        }
    }, [setupRoomListeners, schemaToState]);

    const joinRoom = useCallback(async (roomId: string) => {
        try {
            setError(null);
            const room = await colyseusClient.joinById(roomId, {
                userId: 'user-' + Math.random().toString(36).slice(2),
            });
            roomRef.current = room;
            setSessionId(room.sessionId);
            setRoomId(room.id);
            setIsConnected(true);
            setupRoomListeners(room);
            // Read initial state immediately
            setGameState(schemaToState(room.state));
            return true;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to join room';
            setError(msg);
            return false;
        }
    }, [setupRoomListeners, schemaToState]);

    const selectCard = useCallback((cardId: string, action: ActionType) => {
        if (!roomRef.current) return;
        roomRef.current.send('select_card', {
            cardId,
            action,
            playerId: roomRef.current.sessionId,
        });
    }, []);

    const startGame = useCallback(() => {
        if (!roomRef.current) {
            console.error('[startGame] No room ref!');
            return;
        }
        console.log('[startGame] Sending start_game to room', roomRef.current.id);
        roomRef.current.send('start_game');
    }, []);

    const leaveRoom = useCallback(() => {
        if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
            setIsConnected(false);
            setGameState(null);
            setSessionId(null);
            setRoomId(null);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.leave();
            }
        };
    }, []);

    return {
        room: roomRef.current,
        roomId,
        gameState,
        error,
        isConnected,
        sessionId,
        turnProgress,
        epochEvent,
        warResults,
        finalScores,
        createRoom,
        joinRoom,
        selectCard,
        startGame,
        leaveRoom,
        clearError: () => setError(null),
        dismissEpoch: () => setEpochEvent(null),
        dismissWar: () => setWarResults(null),
    };
}
