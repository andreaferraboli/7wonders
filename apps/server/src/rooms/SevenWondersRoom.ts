import { Room, Client } from "@colyseus/core";
import { GameState } from "../schemas/GameState";
import { Player } from "../schemas/Player";
import { GameEngine } from "../engine/GameEngine";
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

        // Host can manually start the game (fills remaining slots with AI)
        this.onMessage("start_game", (client) => {
            if (this.state.phase !== "LOBBY") {
                client.send("error", { code: "ALREADY_STARTED", message: "Game already started" });
                return;
            }
            if (this.state.players.size < 1) {
                client.send("error", { code: "NO_PLAYERS", message: "Need at least 1 player" });
                return;
            }
            console.log(`🚀 Host ${client.sessionId} requested game start`);
            this.fillWithAI();
            this.lock();
            this.startGame();
        });

        console.log(`✅ Room ${this.roomId} created (${config.playerCount} players, AI: ${config.allowAI})`);
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

        const requiredPlayers = this.state.serverData?.config.playerCount ?? 3;
        const allowAI = this.state.serverData?.config.allowAI ?? false;

        if (allowAI && this.state.players.size === 1) {
            // AI mode: auto-fill and start immediately
            console.log(`🤖 AI mode: filling ${requiredPlayers - 1} AI players and starting...`);
            this.fillWithAI();
            this.lock();
            this.startGame();
        } else if (this.state.players.size >= requiredPlayers) {
            // All humans joined
            this.lock();
            this.startGame();
        }
        // Otherwise stay in LOBBY, wait for more players or host start_game
    }

    /** Fill remaining player slots with AI bots */
    private fillWithAI() {
        const requiredPlayers = this.state.serverData?.config.playerCount ?? 3;
        const currentCount = this.state.players.size;

        for (let i = currentCount; i < requiredPlayers; i++) {
            const aiId = `ai_${i}`;
            const aiPlayer = new Player();
            aiPlayer.sessionId = aiId;
            aiPlayer.userId = aiId;
            aiPlayer.position = i;
            aiPlayer.coins = 3;
            aiPlayer.isAI = true;
            this.state.players.set(aiId, aiPlayer);
            console.log(`🤖 Added AI player: ${aiId} (position ${i})`);
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
        try {
            console.log(`🎮 Starting game in room ${this.roomId}...`);

            const playerIds = Array.from(this.state.players.keys());
            if (playerIds.length === 0) {
                console.error("❌ No players to start game!");
                return;
            }

            this.engine.initializeGame(playerIds);

            // Assegna meraviglie
            console.log("Assigning wonders...");
            const wonders = this.engine.assignWonders();
            playerIds.forEach((sessionId, index) => {
                const player = this.state.players.get(sessionId);
                if (player) {
                    player.wonderId = wonders[index].id;
                    player.wonderSide = wonders[index].side;
                    console.log(`Player ${player.sessionId} assigned ${player.wonderId}`);
                }
            });

            // Inizia epoca 1
            console.log("Starting epoch 1...");
            this.startEpoch(1);
        } catch (e) {
            console.error("❌ Error in startGame:", e);
            this.broadcast("error", {
                code: "GAME_START_FAILED",
                message: `Failed to start game: ${e instanceof Error ? e.message : String(e)}`,
            });
        }
    }

    private startEpoch(epoch: number) {
        try {
            this.state.epoch = epoch;
            this.state.turn = 1;
            this.state.phase = "DRAFT";
            this.state.direction = epoch === 2 ? "RIGHT" : "LEFT";

            // Distribuisci carte
            console.log(`Dealing cards for epoch ${epoch}...`);
            const hands = this.engine.dealCards(epoch);
            if (!hands || hands.size === 0) {
                console.error("❌ No cards dealt!");
                throw new Error("No cards dealt from engine");
            }

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
        } catch (e) {
            console.error("❌ Error in startEpoch:", e);
            this.broadcast("error", {
                code: "EPOCH_START_FAILED",
                message: `Failed to start epoch ${epoch}: ${e instanceof Error ? e.message : String(e)}`,
            });
        }
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
            Array.from(p.hand) as string[]
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

        // Simple AI: randomly choose build/sell with first card
        const wonderInfo = {
            id: player.wonderId,
            stagesBuilt: player.wonderStagesBuilt,
            totalStages: 3, // default
        };

        // Try to get actual total stages
        try {
            const wonderStages = getWonderStages(player.wonderId, player.wonderSide as "DAY" | "NIGHT");
            wonderInfo.totalStages = wonderStages.length;
        } catch { /* use default */ }

        // Simple heuristic: build first card, or sell if can't
        const builtCards = Array.from(player.cityCards);
        let action: PlayerAction;

        // Pick a card that's not already built
        const unbuildCard = hand.find(c => !builtCards.includes(c));

        if (unbuildCard) {
            // 70% chance build, 20% wonder, 10% sell
            const roll = Math.random();
            if (roll < 0.7) {
                action = { playerId: player.sessionId, cardId: unbuildCard, action: "BUILD" };
            } else if (roll < 0.9 && wonderInfo.stagesBuilt < wonderInfo.totalStages) {
                action = { playerId: player.sessionId, cardId: hand[hand.length - 1]!, action: "WONDER" };
            } else {
                action = { playerId: player.sessionId, cardId: hand[hand.length - 1]!, action: "SELL" };
            }
        } else {
            // All cards already built, sell
            action = { playerId: player.sessionId, cardId: hand[0]!, action: "SELL" };
        }

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
    }
}
