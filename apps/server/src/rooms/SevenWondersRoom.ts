import { Room, Client } from "@colyseus/core";
import { GameState } from "../schemas/GameState";
import { Player } from "../schemas/Player";
import { GameEngine } from "../engine/GameEngine";
import { AIPlayer } from "../engine/AIPlayer";
import { getWonderStages } from "../data/wonders/database";
import type { PlayerAction, GameConfig } from "@7wonders/shared";
import { RECONNECTION_GRACE_PERIOD } from "@7wonders/shared";

export class SevenWondersRoom extends Room<GameState> {
    private engine!: GameEngine;
    maxClients = 7;

    onCreate(options: { config: GameConfig }) {
        this.setState(new GameState());

        const config = options.config ?? {
            playerCount: 3,
            expansions: [],
            allowAI: false,
        };

        // Inizializza engine
        const seed = this.generateSeed();
        this.engine = new GameEngine({
            playerCount: config.playerCount,
            expansions: config.expansions ?? [],
            allowAI: config.allowAI ?? false,
            seed,
        });

        this.state.gameId = this.roomId;
        this.state.seed = seed;
        this.state.serverData = {
            config,
            turnBarrier: new Map(),
        };

        // Register message handlers
        this.onMessage("select_card", (client, message) => {
            this.handleSelectCard(client, message as PlayerAction);
        });

        console.log(`✅ Room ${this.roomId} created (${config.playerCount} players)`);
    }

    onJoin(client: Client, options: { userId?: string }) {
        console.log(`👤 Player ${client.sessionId} joined room ${this.roomId}`);

        const player = new Player();
        player.sessionId = client.sessionId;
        player.userId = options.userId ?? client.sessionId;
        player.position = this.state.players.size;
        player.coins = 3;

        this.state.players.set(client.sessionId, player);

        // Broadcast player joined
        this.broadcast("player_joined", {
            sessionId: client.sessionId,
            position: player.position,
            totalPlayers: this.state.players.size,
        });

        // Se tutti presenti, inizia partita
        const requiredPlayers = this.state.serverData?.config.playerCount ?? 3;
        if (this.state.players.size >= requiredPlayers) {
            this.lock(); // No more players
            this.startGame();
        }
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(`👋 Player ${client.sessionId} left (consented: ${consented})`);

        if (!consented && this.state.phase !== "FINISHED") {
            // Disconnessione involontaria → grace period
            try {
                await this.allowReconnection(client, RECONNECTION_GRACE_PERIOD);
                console.log(`✅ Player ${client.sessionId} reconnected`);
            } catch {
                console.log(`⏰ Player ${client.sessionId} timeout → AI takeover`);
                const player = this.state.players.get(client.sessionId);
                if (player) {
                    player.isAI = true;
                    if (!player.isReady) {
                        this.handleAITurn(player);
                    }
                }
            }
        }
    }

    // ========== GAME FLOW ==========

    private startGame() {
        console.log(`🎮 Starting game in room ${this.roomId}...`);

        const playerIds = Array.from(this.state.players.keys());
        this.engine.initializeGame(playerIds);

        // Assegna meraviglie
        const wonders = this.engine.assignWonders();
        playerIds.forEach((sessionId, index) => {
            const player = this.state.players.get(sessionId);
            if (player) {
                player.wonderId = wonders[index].id;
                player.wonderSide = wonders[index].side;
            }
        });

        // Inizia epoca 1
        this.startEpoch(1);
    }

    private startEpoch(epoch: number) {
        this.state.epoch = epoch;
        this.state.turn = 1;
        this.state.phase = "DRAFT";
        this.state.direction = epoch === 2 ? "RIGHT" : "LEFT";

        // Distribuisci carte
        const hands = this.engine.dealCards(epoch);
        hands.forEach((hand, sessionId) => {
            const player = this.state.players.get(sessionId);
            if (player) {
                player.hand.clear();
                hand.forEach((cardId) => player.hand.push(cardId));
                player.isReady = false;
                player.selectedCard = "";
                player.selectedAction = "";
            }
        });

        this.broadcast("epoch_start", { epoch, direction: this.state.direction });
        console.log(`🏛️ Epoch ${epoch} started (direction: ${this.state.direction})`);

        // Handle AI players
        this.state.players.forEach((player) => {
            if (player.isAI && !player.isReady) {
                this.handleAITurn(player);
            }
        });
    }

    // ========== ACTIONS ==========

    private handleSelectCard(client: Client, data: PlayerAction) {
        const player = this.state.players.get(client.sessionId);
        if (!player || player.isReady) {
            client.send("error", { code: "ALREADY_READY", message: "You already submitted an action" });
            return;
        }

        if (this.state.phase !== "DRAFT") {
            client.send("error", { code: "WRONG_PHASE", message: "Not in DRAFT phase" });
            return;
        }

        // Ensure playerId matches session
        const action: PlayerAction = {
            ...data,
            playerId: client.sessionId,
        };

        // Validazione server-side
        const validation = this.engine.validateAction(client.sessionId, action);
        if (!validation.valid) {
            client.send("error", {
                code: "INVALID_ACTION",
                errors: validation.errors,
            });
            return;
        }

        // Marca come pronto
        player.selectedCard = action.cardId;
        player.selectedAction = action.action;
        player.isReady = true;

        // Rimuovi carta dalla mano (visivamente)
        const cardIndex = Array.from(player.hand).findIndex((c) => c === action.cardId);
        if (cardIndex >= 0) {
            player.hand.splice(cardIndex, 1);
        }

        // Salva azione in barrier
        this.state.serverData!.turnBarrier.set(client.sessionId, action);

        // Broadcast progresso
        const readyCount = Array.from(this.state.players.values()).filter(
            (p) => p.isReady
        ).length;

        this.broadcast("turn_progress", {
            ready: readyCount,
            total: this.state.players.size,
        });

        console.log(
            `[${this.roomId}] Player ${client.sessionId}: ${action.action} ${action.cardId} (${readyCount}/${this.state.players.size})`
        );

        // Se tutti pronti, risolvi turno
        if (readyCount === this.state.players.size) {
            this.resolveTurn();
        }
    }

    private resolveTurn() {
        console.log(`⚙️ Resolving turn ${this.state.turn} (epoch ${this.state.epoch})...`);

        this.state.phase = "RESOLUTION";

        // Raccogli azioni
        const actions: PlayerAction[] = [];
        this.state.serverData!.turnBarrier.forEach((action) => {
            actions.push(action as PlayerAction);
        });

        // Esegui engine
        const result = this.engine.resolveTurn(actions);

        // Aggiorna stato Colyseus
        this.applyEngineResult(result as { actions: PlayerAction[]; playerUpdates: Array<{ playerId: string; updates: Record<string, unknown> }> });

        // Reset barrier
        this.state.serverData!.turnBarrier.clear();
        this.state.players.forEach((player) => {
            player.isReady = false;
            player.selectedCard = "";
            player.selectedAction = "";
        });

        // Broadcast risultato
        this.broadcast("turn_resolved", {
            turn: this.state.turn,
            epoch: this.state.epoch,
            actions: result.actions.map((a) => ({
                playerId: a.playerId,
                cardId: a.cardId,
                action: a.action,
            })),
        });

        // Prossimo turno o fine epoca
        if (this.state.turn >= 6) {
            this.resolveEpochEnd();
        } else {
            this.state.turn++;
            this.state.phase = "DRAFT";
            this.passHands();

            // Handle AI for next turn
            this.state.players.forEach((player) => {
                if (player.isAI && !player.isReady) {
                    this.handleAITurn(player);
                }
            });
        }
    }

    private passHands() {
        const playerArray = Array.from(this.state.players.values());

        // Collect current hands
        const tempHands: string[][] = playerArray.map((p) =>
            Array.from(p.hand)
        );

        // Pass based on direction
        const isLeftDirection = this.state.direction === "LEFT";

        playerArray.forEach((player, index) => {
            const sourceIndex = isLeftDirection
                ? (index + 1) % playerArray.length
                : (index - 1 + playerArray.length) % playerArray.length;

            player.hand.clear();
            tempHands[sourceIndex].forEach((cardId) => player.hand.push(cardId));
        });

        console.log(`🔄 Hands passed ${this.state.direction}`);
    }

    private resolveEpochEnd() {
        console.log(`🏛️ Epoch ${this.state.epoch} ended — resolving military...`);

        this.state.phase = "WAR";

        // Risolvi guerra
        const warResults = this.engine.resolveMilitaryConflicts(this.state.epoch);

        // Aggiorna segnalini militari
        warResults.forEach(({ playerId, tokens }) => {
            const player = this.state.players.get(playerId);
            if (player) {
                tokens.forEach((token) => player.militaryTokens.push(token));
            }
        });

        this.broadcast("war_resolved", { epoch: this.state.epoch, results: warResults });

        // Prossima epoca o fine partita
        if (this.state.epoch < 3) {
            // Delay before next epoch for UI animations
            this.clock.setTimeout(() => {
                this.startEpoch((this.state.epoch + 1) as 1 | 2 | 3);
            }, 3000);
        } else {
            this.endGame();
        }
    }

    private endGame() {
        this.state.phase = "FINISHED";

        const scores = this.engine.calculateFinalScores();
        this.broadcast("game_end", { scores });

        console.log(`🏆 Game ${this.roomId} finished!`);
        scores.forEach((s, i) => {
            console.log(`  ${i + 1}. Player ${s.playerId}: ${s.total} VP`);
        });

        // Persist game to database
        this.persistGame(scores).catch((err) => {
            console.error("Failed to persist game:", err);
        });

        // Auto-dispose room after delay
        this.clock.setTimeout(() => {
            this.disconnect();
        }, 30000);
    }

    // ========== HELPERS ==========

    private applyEngineResult(result: { actions: PlayerAction[]; playerUpdates: Array<{ playerId: string; updates: Record<string, unknown> }> }) {
        result.playerUpdates.forEach(({ playerId, updates }) => {
            const player = this.state.players.get(playerId);
            if (!player) return;

            if (typeof updates.coins === "number") player.coins = updates.coins;
            if (typeof updates.militaryPower === "number") player.militaryPower = updates.militaryPower;
            if (typeof updates.wonderStagesBuilt === "number") player.wonderStagesBuilt = updates.wonderStagesBuilt;
            if (typeof updates.scienceCompass === "number") player.scienceCompass = updates.scienceCompass;
            if (typeof updates.scienceGear === "number") player.scienceGear = updates.scienceGear;
            if (typeof updates.scienceTablet === "number") player.scienceTablet = updates.scienceTablet;

            if (Array.isArray(updates.cityCards)) {
                (updates.cityCards as string[]).forEach((cardId: string) => {
                    if (!player.cityCards.includes(cardId)) {
                        player.cityCards.push(cardId);
                    }
                });
            }
        });
    }

    private handleAITurn(player: Player) {
        const hand = Array.from(player.hand);
        if (hand.length === 0) return;

        // Build AI context from game state
        const playerArray = Array.from(this.state.players.values());
        const playerIndex = playerArray.findIndex(p => p.sessionId === player.sessionId);
        const leftNeighbor = playerArray[(playerIndex - 1 + playerArray.length) % playerArray.length];
        const rightNeighbor = playerArray[(playerIndex + 1) % playerArray.length];

        // Determine wonder total stages
        const wonderStages = getWonderStages(player.wonderId, player.wonderSide as "DAY" | "NIGHT");
        const wonderTotalStages = wonderStages.length;

        // Create AI instance with deterministic seed per player
        const aiSeed = `${this.state.seed}-ai-${player.sessionId}-${this.state.epoch}-${this.state.turn}`;
        const ai = new AIPlayer(aiSeed);

        const action = ai.chooseAction(
            player.sessionId,
            hand.filter((c): c is string => typeof c === 'string'),
            Array.from(player.cityCards).filter((c): c is string => typeof c === 'string'),
            player.coins,
            this.state.epoch,
            player.militaryPower,
            leftNeighbor?.militaryPower ?? 0,
            rightNeighbor?.militaryPower ?? 0,
            Array.from(leftNeighbor?.cityCards ?? []).filter((c): c is string => typeof c === 'string'),
            Array.from(rightNeighbor?.cityCards ?? []).filter((c): c is string => typeof c === 'string'),
            player.wonderStagesBuilt,
            wonderTotalStages,
            player.scienceCompass,
            player.scienceGear,
            player.scienceTablet,
            { leftRaw: false, rightRaw: false, bothMfg: false }
        );

        // Apply AI action
        player.selectedCard = action.cardId;
        player.selectedAction = action.action;
        player.isReady = true;

        const cardIndex = hand.indexOf(action.cardId);
        if (cardIndex >= 0) {
            player.hand.splice(cardIndex, 1);
        }

        this.state.serverData!.turnBarrier.set(player.sessionId, action);

        console.log(`🤖 AI ${player.sessionId}: ${action.action} ${action.cardId}`);

        // Check if all players ready
        const readyCount = Array.from(this.state.players.values()).filter(
            (p) => p.isReady
        ).length;
        if (readyCount === this.state.players.size) {
            this.resolveTurn();
        }
    }

    private generateSeed(): string {
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    private async persistGame(_scores: unknown): Promise<void> {
        // TODO: Implement with Prisma
        // const prisma = new PrismaClient();
        // await prisma.game.update({ ... });
    }
}
