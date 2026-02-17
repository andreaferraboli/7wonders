import type { GameConfig, PlayerAction, ValidationResult, WonderAssignment, TurnResult, MilitaryConflictResult, FinalScore } from "@7wonders/shared";
import { CARDS_PER_PLAYER, MILITARY_VICTORY_TOKENS, MILITARY_DEFEAT_TOKEN, SELL_CARD_COINS, SCIENCE_SET_BONUS } from "@7wonders/shared";
import { SeededRandom } from "../utils/SeededRandom";
import { cardDatabase, getFilteredCards, type CardData } from "../data/cards/database";

/**
 * Core game engine — all business logic lives here.
 * This class is pure logic, no Colyseus dependency.
 */
export class GameEngine {
    public seed: string;
    private rng: SeededRandom;
    private playerIds: string[] = [];
    private playerCards: Map<string, string[]> = new Map();   // built cards per player
    private playerCoins: Map<string, number> = new Map();
    private playerMilitary: Map<string, number> = new Map();
    private playerScience: Map<string, { compass: number; gear: number; tablet: number }> = new Map();
    private playerWonders: Map<string, { id: string; side: string; stagesBuilt: number }> = new Map();
    private expansions: string[];
    private playerCount: number;

    constructor(private config: GameConfig & { seed: string }) {
        this.seed = config.seed;
        this.rng = new SeededRandom(this.seed);
        this.expansions = ["BASE", ...config.expansions];
        this.playerCount = config.playerCount;
    }

    /** Initialize game state for all players */
    initializeGame(playerIds: string[]): void {
        this.playerIds = playerIds;

        for (const id of playerIds) {
            this.playerCards.set(id, []);
            this.playerCoins.set(id, 3);
            this.playerMilitary.set(id, 0);
            this.playerScience.set(id, { compass: 0, gear: 0, tablet: 0 });
        }
    }

    /** Assign wonders randomly to players */
    assignWonders(): WonderAssignment[] {
        const wonderIds = [
            "ALEXANDRIA", "BABYLON", "EPHESUS", "GIZA",
            "HALIKARNASSUS", "OLYMPIA", "RHODES",
        ];

        const shuffled = this.rng.shuffle(wonderIds);
        const assignments: WonderAssignment[] = [];

        for (let i = 0; i < this.playerIds.length; i++) {
            const assignment: WonderAssignment = {
                id: shuffled[i],
                side: this.rng.nextBoolean() ? "DAY" : "NIGHT",
            };
            assignments.push(assignment);
            this.playerWonders.set(this.playerIds[i], {
                ...assignment,
                stagesBuilt: 0,
            });
        }

        return assignments;
    }

    /** Deal cards for a specific epoch */
    dealCards(epoch: number): Map<string, string[]> {
        const availableCards = getFilteredCards(epoch, this.playerCount, this.expansions);
        const shuffled = this.rng.shuffle(availableCards);

        const hands = new Map<string, string[]>();

        this.playerIds.forEach((playerId, index) => {
            const start = index * CARDS_PER_PLAYER;
            const handCards = shuffled
                .slice(start, start + CARDS_PER_PLAYER)
                .map((c) => c.id);
            hands.set(playerId, handCards);
        });

        return hands;
    }

    /** Validate a player's action */
    validateAction(playerId: string, action: PlayerAction): ValidationResult {
        const errors: string[] = [];

        // Check player exists
        if (!this.playerIds.includes(playerId)) {
            errors.push("Player not found");
        }

        // Check card exists
        const card = cardDatabase[action.cardId];
        if (!card) {
            errors.push(`Card ${action.cardId} not found`);
        }

        // Check action type
        if (!["BUILD", "SELL", "WONDER"].includes(action.action)) {
            errors.push(`Invalid action type: ${action.action}`);
        }

        // For WONDER action, validate wonder stage
        if (action.action === "WONDER") {
            const wonder = this.playerWonders.get(playerId);
            if (!wonder) {
                errors.push("Player has no wonder assigned");
            }
            // TODO: validate wonder stage availability
        }

        // For BUILD action, check if card is already built
        if (action.action === "BUILD") {
            const builtCards = this.playerCards.get(playerId) ?? [];
            if (builtCards.includes(action.cardId)) {
                errors.push("Card already built");
            }
            // TODO: validate resource requirements
        }

        return { valid: errors.length === 0, errors };
    }

    /** Resolve all actions for a turn (simultaneous) */
    resolveTurn(actions: PlayerAction[]): TurnResult {
        const playerUpdates: TurnResult["playerUpdates"] = [];

        for (const action of actions) {
            const card = cardDatabase[action.cardId];

            switch (action.action) {
                case "BUILD": {
                    // Add card to player's city
                    const builtCards = this.playerCards.get(action.playerId) ?? [];
                    builtCards.push(action.cardId);
                    this.playerCards.set(action.playerId, builtCards);

                    const updates: TurnResult["playerUpdates"][0]["updates"] = {
                        cityCards: [action.cardId],
                    };

                    // Apply immediate effects
                    if (card) {
                        this.applyCardEffects(action.playerId, card, updates);
                    }

                    playerUpdates.push({ playerId: action.playerId, updates });
                    break;
                }

                case "SELL": {
                    // Sell card for coins
                    const currentCoins = this.playerCoins.get(action.playerId) ?? 0;
                    this.playerCoins.set(action.playerId, currentCoins + SELL_CARD_COINS);

                    playerUpdates.push({
                        playerId: action.playerId,
                        updates: { coins: currentCoins + SELL_CARD_COINS },
                    });
                    break;
                }

                case "WONDER": {
                    const wonder = this.playerWonders.get(action.playerId);
                    if (wonder) {
                        wonder.stagesBuilt += 1;
                        this.playerWonders.set(action.playerId, wonder);
                    }

                    playerUpdates.push({
                        playerId: action.playerId,
                        updates: {
                            wonderStagesBuilt: wonder?.stagesBuilt ?? 0,
                        },
                    });
                    break;
                }
            }
        }

        return { actions, playerUpdates };
    }

    /** Resolve military conflicts at end of epoch */
    resolveMilitaryConflicts(epoch: number): MilitaryConflictResult[] {
        const results: MilitaryConflictResult[] = [];
        const victoryValue = MILITARY_VICTORY_TOKENS[epoch] ?? 1;

        for (let i = 0; i < this.playerIds.length; i++) {
            const playerId = this.playerIds[i];
            const leftNeighborId = this.playerIds[(i - 1 + this.playerIds.length) % this.playerIds.length];
            const rightNeighborId = this.playerIds[(i + 1) % this.playerIds.length];

            const myPower = this.playerMilitary.get(playerId) ?? 0;
            const leftPower = this.playerMilitary.get(leftNeighborId) ?? 0;
            const rightPower = this.playerMilitary.get(rightNeighborId) ?? 0;

            const tokens: string[] = [];

            // Compare with left neighbor
            if (myPower > leftPower) {
                tokens.push(`+${victoryValue}`);
            } else if (myPower < leftPower) {
                tokens.push(`${MILITARY_DEFEAT_TOKEN}`);
            }

            // Compare with right neighbor
            if (myPower > rightPower) {
                tokens.push(`+${victoryValue}`);
            } else if (myPower < rightPower) {
                tokens.push(`${MILITARY_DEFEAT_TOKEN}`);
            }

            results.push({ playerId, tokens });
        }

        return results;
    }

    /** Calculate final scores for all players */
    calculateFinalScores(): FinalScore[] {
        const scores: FinalScore[] = [];

        for (const playerId of this.playerIds) {
            const builtCards = this.playerCards.get(playerId) ?? [];
            const coins = this.playerCoins.get(playerId) ?? 0;
            const science = this.playerScience.get(playerId) ?? { compass: 0, gear: 0, tablet: 0 };

            // Military score: sum of all tokens
            const military = 0; // TODO: sum from military tokens

            // Treasury: 1 VP per 3 coins
            const treasury = Math.floor(coins / 3);

            // Wonder score
            const wonder = 0; // TODO: calculate from wonder stages

            // Civilian (blue cards) score
            const civilian = builtCards
                .map((id) => cardDatabase[id])
                .filter((c) => c?.color === "BLUE")
                .reduce((sum, c) => {
                    const vpEffect = c.effects.find((e) => e.action === "GAIN_VP");
                    return sum + ((vpEffect?.value as number) ?? 0);
                }, 0);

            // Science score
            const scienceScore = this.calculateScienceScore(science);

            // Commerce (yellow cards) — end-game VP
            const commerce = 0; // TODO: formula-based scoring

            // Guild (purple cards) — end-game VP
            const guild = 0; // TODO: formula-based scoring

            const total = military + treasury + wonder + civilian + scienceScore + commerce + guild;

            scores.push({
                playerId,
                military,
                treasury,
                wonder,
                civilian,
                science: scienceScore,
                commerce,
                guild,
                total,
            });
        }

        // Sort by total descending
        scores.sort((a, b) => b.total - a.total);

        return scores;
    }

    // ========== PRIVATE HELPERS ==========

    /** Apply immediate card effects to player state */
    private applyCardEffects(
        playerId: string,
        card: CardData,
        updates: TurnResult["playerUpdates"][0]["updates"]
    ): void {
        for (const effect of card.effects) {
            const action = effect.action as string;
            const value = (effect.value as number) ?? 0;

            switch (action) {
                case "GAIN_COINS": {
                    const current = this.playerCoins.get(playerId) ?? 0;
                    this.playerCoins.set(playerId, current + value);
                    updates.coins = current + value;
                    break;
                }
                case "GAIN_MILITARY": {
                    const current = this.playerMilitary.get(playerId) ?? 0;
                    this.playerMilitary.set(playerId, current + value);
                    updates.militaryPower = current + value;
                    break;
                }
                case "GAIN_SCIENCE": {
                    const science = this.playerScience.get(playerId) ?? { compass: 0, gear: 0, tablet: 0 };
                    const symbol = (effect.formula as string)?.toUpperCase();
                    if (symbol === "COMPASS") science.compass += value;
                    else if (symbol === "GEAR") science.gear += value;
                    else if (symbol === "TABLET") science.tablet += value;
                    this.playerScience.set(playerId, science);
                    updates.scienceCompass = science.compass;
                    updates.scienceGear = science.gear;
                    updates.scienceTablet = science.tablet;
                    break;
                }
                // Resource production is tracked via card ownership, not direct updates
            }
        }
    }

    /** Calculate science VP: each symbol squared + 7 per set */
    private calculateScienceScore(science: { compass: number; gear: number; tablet: number }): number {
        const { compass, gear, tablet } = science;
        const sets = Math.min(compass, gear, tablet);
        return (
            compass * compass +
            gear * gear +
            tablet * tablet +
            sets * SCIENCE_SET_BONUS
        );
    }
}
