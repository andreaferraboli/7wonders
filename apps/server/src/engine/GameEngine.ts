import type { GameConfig, PlayerAction, ValidationResult, WonderAssignment, TurnResult, MilitaryConflictResult, FinalScore } from "@7wonders/shared";
import { CARDS_PER_PLAYER, MILITARY_VICTORY_TOKENS, MILITARY_DEFEAT_TOKEN, SELL_CARD_COINS, SCIENCE_SET_BONUS } from "@7wonders/shared";
import { SeededRandom } from "../utils/SeededRandom";
import { getCardsForAgeAndPlayers, getGuildCardNames, getNonGuildAge3Cards } from "../data/cards/cardPlayerMapping";

/**
 * Core game engine — all business logic lives here.
 * Cards are dealt using Italian names (matching asset image files).
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
    private playerMilitaryTokens: Map<string, number[]> = new Map();
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
            this.playerMilitaryTokens.set(id, []);
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
                id: shuffled[i % shuffled.length],
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

    /** Deal cards for a specific epoch using Italian card names */
    dealCards(epoch: number): Map<string, string[]> {
        let cardPool: string[];

        if (epoch === 3) {
            // Age 3: non-guild cards + random selection of guilds
            const nonGuildCards = getNonGuildAge3Cards(this.playerCount);
            const allGuilds = getGuildCardNames();
            const shuffledGuilds = this.rng.shuffle(allGuilds);
            const selectedGuilds = shuffledGuilds.slice(0, this.playerCount + 2);
            cardPool = [...nonGuildCards, ...selectedGuilds];
        } else {
            cardPool = getCardsForAgeAndPlayers(epoch, this.playerCount);
        }

        const shuffled = this.rng.shuffle(cardPool);
        const hands = new Map<string, string[]>();
        const cardsPerPlayer = CARDS_PER_PLAYER;

        this.playerIds.forEach((playerId, index) => {
            const start = index * cardsPerPlayer;
            const handCards = shuffled.slice(start, start + cardsPerPlayer);
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
        }

        // For BUILD action, check if card is already built (same name)
        if (action.action === "BUILD") {
            const builtCards = this.playerCards.get(playerId) ?? [];
            if (builtCards.includes(action.cardId)) {
                errors.push("Card already built");
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /** Resolve all actions for a turn (simultaneous) */
    resolveTurn(actions: PlayerAction[]): TurnResult {
        const playerUpdates: TurnResult["playerUpdates"] = [];

        for (const action of actions) {
            switch (action.action) {
                case "BUILD": {
                    // Add card to player's city
                    const builtCards = this.playerCards.get(action.playerId) ?? [];
                    builtCards.push(action.cardId);
                    this.playerCards.set(action.playerId, builtCards);

                    const updates: TurnResult["playerUpdates"][0]["updates"] = {
                        cityCards: [action.cardId],
                    };

                    // Apply card effects based on Italian card name
                    this.applyCardEffectsByName(action.playerId, action.cardId, updates);

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
            const playerTokens = this.playerMilitaryTokens.get(playerId) ?? [];

            // Compare with left neighbor
            if (myPower > leftPower) {
                tokens.push(`+${victoryValue}`);
                playerTokens.push(victoryValue);
            } else if (myPower < leftPower) {
                tokens.push(`${MILITARY_DEFEAT_TOKEN}`);
                playerTokens.push(MILITARY_DEFEAT_TOKEN);
            }

            // Compare with right neighbor
            if (myPower > rightPower) {
                tokens.push(`+${victoryValue}`);
                playerTokens.push(victoryValue);
            } else if (myPower < rightPower) {
                tokens.push(`${MILITARY_DEFEAT_TOKEN}`);
                playerTokens.push(MILITARY_DEFEAT_TOKEN);
            }

            this.playerMilitaryTokens.set(playerId, playerTokens);
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
            const militaryTokens = this.playerMilitaryTokens.get(playerId) ?? [];

            // Military score: sum of all tokens
            const military = militaryTokens.reduce((sum, t) => sum + t, 0);

            // Treasury: 1 VP per 3 coins
            const treasury = Math.floor(coins / 3);

            // Wonder score
            const wonder = this.calculateWonderScore(playerId);

            // Civilian (blue cards) score - estimate from card names
            const civilian = this.estimateCivilianScore(builtCards);

            // Science score
            const scienceScore = this.calculateScienceScore(science);

            // Commerce (yellow cards) — end-game VP
            const commerce = 0; // Simplified

            // Guild (purple cards) — end-game VP
            const guild = 0; // Simplified

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

    /** Apply card effects based on Italian card name */
    private applyCardEffectsByName(
        playerId: string,
        cardName: string,
        updates: TurnResult["playerUpdates"][0]["updates"]
    ): void {
        // Military cards
        const militaryCards: Record<string, number> = {
            "palizzata": 1, "caserma": 1, "torre_di_guardia": 1,
            "scuderie": 2, "campo_di_tiro_con_l_arco": 2, "mura": 2, "zona_di_addestramento": 2,
            "arsenale": 3, "fortificazioni": 3, "opificio_d_assedio": 3, "circo": 3,
            "palestra_gladatoria": 3, "castra": 3,
        };

        if (militaryCards[cardName] !== undefined) {
            const current = this.playerMilitary.get(playerId) ?? 0;
            this.playerMilitary.set(playerId, current + militaryCards[cardName]);
            updates.militaryPower = current + militaryCards[cardName];
        }

        // Commercial cards that give coins
        const coinCards: Record<string, number> = {
            "taverna": 5,
        };

        if (coinCards[cardName] !== undefined) {
            const current = this.playerCoins.get(playerId) ?? 0;
            this.playerCoins.set(playerId, current + coinCards[cardName]);
            updates.coins = current + coinCards[cardName];
        }

        // Science cards
        const scienceCards: Record<string, string> = {
            "farmacia": "compass", "ambulatorio": "compass",
            "opificio": "gear", "laboratorio": "gear",
            "scrittorio": "tablet", "biblioteca": "tablet", "scuola": "tablet",
            "loggia": "compass", "osservatorio": "compass",
            "accademia": "gear", "universita": "gear",
            "studio": "tablet",
        };

        if (scienceCards[cardName]) {
            const science = this.playerScience.get(playerId) ?? { compass: 0, gear: 0, tablet: 0 };
            const symbol = scienceCards[cardName] as keyof typeof science;
            science[symbol] += 1;
            this.playerScience.set(playerId, science);
            updates.scienceCompass = science.compass;
            updates.scienceGear = science.gear;
            updates.scienceTablet = science.tablet;
        }
    }

    /** Estimate VP from blue/civic cards */
    private estimateCivilianScore(builtCards: string[]): number {
        const blueVP: Record<string, number> = {
            "pozzo": 3, "bagni": 3, "altare": 2, "teatro": 2,
            "statua": 4, "acquedotto": 5, "tempio": 3, "tribunale": 4,
            "pantheon": 7, "giardini": 5, "municipio": 6, "palazzo": 8, "senato": 6,
        };
        return builtCards.reduce((sum, card) => sum + (blueVP[card] ?? 0), 0);
    }

    /** Calculate wonder VP */
    private calculateWonderScore(playerId: string): number {
        const wonder = this.playerWonders.get(playerId);
        if (!wonder) return 0;
        // Simplified: each stage gives ~3-7 VP
        const vpPerStage = [3, 5, 7, 5];
        let total = 0;
        for (let i = 0; i < wonder.stagesBuilt; i++) {
            total += vpPerStage[i] ?? 3;
        }
        return total;
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
