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
    const [turnProgress, setTurnProgress] = useState<TurnProgress | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [epochEvent, setEpochEvent] = useState<{ epoch: number; direction: string } | null>(null);
    const [warResults, setWarResults] = useState<{ epoch: number; results: unknown[] } | null>(null);
    const [finalScores, setFinalScores] = useState<unknown[] | null>(null);

    // Convert Colyseus schema to plain object
    const schemaToState = useCallback((state: Record<string, unknown>): ClientGameState => {
        const playersMap = new Map<string, ClientPlayer>();
        const players = state.players as Map<string, Record<string, unknown>>;

        if (players?.forEach) {
            players.forEach((player: Record<string, unknown>, key: string) => {
                playersMap.set(key, {
                    sessionId: player.sessionId as string,
                    userId: player.userId as string,
                    position: player.position as number,
                    wonderId: player.wonderId as string,
                    wonderSide: player.wonderSide as string,
                    wonderStagesBuilt: player.wonderStagesBuilt as number,
                    cityCards: Array.from(player.cityCards as Iterable<string>),
                    coins: player.coins as number,
                    militaryPower: player.militaryPower as number,
                    militaryTokens: Array.from(player.militaryTokens as Iterable<string>),
                    scienceCompass: player.scienceCompass as number,
                    scienceGear: player.scienceGear as number,
                    scienceTablet: player.scienceTablet as number,
                    hand: Array.from(player.hand as Iterable<string>),
                    selectedCard: player.selectedCard as string,
                    selectedAction: player.selectedAction as string,
                    isReady: player.isReady as boolean,
                    isAI: player.isAI as boolean,
                });
            });
        }

        return {
            gameId: state.gameId as string,
            phase: state.phase as string,
            epoch: state.epoch as number,
            turn: state.turn as number,
            direction: state.direction as string,
            players: playersMap,
            seed: state.seed as string,
        };
    }, []);

    const setupRoomListeners = useCallback((room: Room) => {
        room.onStateChange((state) => {
            setGameState(schemaToState(state as unknown as Record<string, unknown>));
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
        });

        room.onLeave((code) => {
            console.log('Left room with code:', code);
            setIsConnected(false);
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
            const room = await colyseusClient.create('7wonders', {
                config: {
                    playerCount: config?.playerCount ?? 3,
                    expansions: config?.expansions ?? [],
                    allowAI: config?.allowAI ?? true,
                },
            });
            roomRef.current = room;
            setSessionId(room.sessionId);
            setIsConnected(true);
            setupRoomListeners(room);
            return room.id;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to create room';
            setError(msg);
            return null;
        }
    }, [setupRoomListeners]);

    const joinRoom = useCallback(async (roomId: string) => {
        try {
            setError(null);
            const room = await colyseusClient.joinById(roomId, {
                userId: 'user-' + Math.random().toString(36).slice(2),
            });
            roomRef.current = room;
            setSessionId(room.sessionId);
            setIsConnected(true);
            setupRoomListeners(room);
            return true;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to join room';
            setError(msg);
            return false;
        }
    }, [setupRoomListeners]);

    const selectCard = useCallback((cardId: string, action: ActionType) => {
        if (!roomRef.current) return;
        roomRef.current.send('select_card', {
            cardId,
            action,
            playerId: roomRef.current.sessionId,
        });
    }, []);

    const leaveRoom = useCallback(() => {
        if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
            setIsConnected(false);
            setGameState(null);
            setSessionId(null);
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
        leaveRoom,
        clearError: () => setError(null),
        dismissEpoch: () => setEpochEvent(null),
        dismissWar: () => setWarResults(null),
    };
}
