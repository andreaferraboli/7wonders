import type { PlayerAction, ActionType } from "@7wonders/shared";
import { SeededRandom } from "../utils/SeededRandom";
import { cardDatabase, type CardData } from "../data/cards/database";
import { ResourceSolver } from "./ResourceSolver";

/**
 * AI Player using a simple heuristic-based strategy.
 * 
 * AI Strategy Priority:
 * 1. Build high-VP blue cards when affordable
 * 2. Build military cards if behind neighbors  
 * 3. Build science sets (tries to complete sets)
 * 4. Build resource cards in early ages
 * 5. Build wonder stages when affordable
 * 6. Sell worst card for coins as fallback
 */
export class AIPlayer {
    private rng: SeededRandom;

    constructor(seed: string) {
        this.rng = new SeededRandom(seed);
    }

    /**
     * Choose the best action for the AI player.
     */
    chooseAction(
        playerId: string,
        hand: string[],
        builtCards: string[],
        coins: number,
        epoch: number,
        militaryPower: number,
        leftNeighborMilitary: number,
        rightNeighborMilitary: number,
        leftNeighborCards: string[],
        rightNeighborCards: string[],
        wonderStagesBuilt: number,
        wonderTotalStages: number,
        scienceCompass: number,
        scienceGear: number,
        scienceTablet: number,
        tradeDiscounts: { leftRaw: boolean; rightRaw: boolean; bothMfg: boolean }
    ): PlayerAction {
        // Score each card in hand
        const scored = hand.map((cardId) => ({
            cardId,
            card: cardDatabase[cardId],
            score: this.scoreCard(
                cardId,
                builtCards,
                epoch,
                militaryPower,
                leftNeighborMilitary,
                rightNeighborMilitary,
                scienceCompass,
                scienceGear,
                scienceTablet
            ),
            canBuild: this.canBuildCard(
                cardId,
                builtCards,
                coins,
                leftNeighborCards,
                rightNeighborCards,
                tradeDiscounts
            ),
        }));

        // Sort by score (highest first)
        scored.sort((a, b) => b.score - a.score);

        // Try to build the best affordable card
        for (const option of scored) {
            if (option.canBuild && !builtCards.includes(option.cardId)) {
                return {
                    playerId,
                    cardId: option.cardId,
                    action: "BUILD",
                };
            }
        }

        // Try to build wonder stage
        if (wonderStagesBuilt < wonderTotalStages) {
            // Use the lowest-scored card for wonder building
            const worstCard = scored[scored.length - 1];
            if (worstCard) {
                return {
                    playerId,
                    cardId: worstCard.cardId,
                    action: "WONDER",
                    wonderStageIndex: wonderStagesBuilt,
                };
            }
        }

        // Sell the lowest-scored card
        const worstCard = scored[scored.length - 1] ?? scored[0];
        return {
            playerId,
            cardId: worstCard.cardId,
            action: "SELL",
        };
    }

    /**
     * Score a card based on heuristic value for the AI.
     * Higher score = more desirable.
     */
    private scoreCard(
        cardId: string,
        builtCards: string[],
        epoch: number,
        militaryPower: number,
        leftNeighborMilitary: number,
        rightNeighborMilitary: number,
        scienceCompass: number,
        scienceGear: number,
        scienceTablet: number
    ): number {
        const card = cardDatabase[cardId];
        if (!card) return 0;

        // Already built this card → worthless
        if (builtCards.includes(cardId)) return -100;

        let score = 0;

        // === Color-based scoring ===

        switch (card.color) {
            case "BROWN":
            case "GREY": {
                // Resource cards are more valuable early game
                if (epoch === 1) score += 8;
                else if (epoch === 2) score += 4;
                else score += 1;

                // Extra value if we don't have many resources yet
                const resourceCount = builtCards.filter(
                    (c) => cardDatabase[c]?.color === "BROWN" || cardDatabase[c]?.color === "GREY"
                ).length;
                if (resourceCount < 3) score += 3;
                break;
            }

            case "BLUE": {
                // Civilian cards are pure VP — always good
                const vpEffect = card.effects.find((e) => e.action === "GAIN_VP");
                const vpValue = (vpEffect?.value as number) ?? 3;
                score += vpValue * 1.5;
                break;
            }

            case "RED": {
                // Military cards — more valuable if behind neighbors
                const maxNeighborMilitary = Math.max(leftNeighborMilitary, rightNeighborMilitary);
                const militaryGap = maxNeighborMilitary - militaryPower;

                if (militaryGap > 0) {
                    // Behind in military — high priority
                    score += 10 + militaryGap * 2;
                } else {
                    // Already ahead — moderate value
                    score += 4;
                }

                // Military more valuable in later epochs (bigger tokens)
                score += epoch * 1.5;
                break;
            }

            case "GREEN": {
                // Science cards — value depends on set completion
                const sciences = [scienceCompass, scienceGear, scienceTablet];
                const cardScience = this.getCardScienceType(card);

                if (cardScience === "COMPASS") {
                    score += this.scienceValue(scienceCompass + 1, scienceGear, scienceTablet) -
                        this.scienceValue(scienceCompass, scienceGear, scienceTablet);
                } else if (cardScience === "GEAR") {
                    score += this.scienceValue(scienceCompass, scienceGear + 1, scienceTablet) -
                        this.scienceValue(scienceCompass, scienceGear, scienceTablet);
                } else if (cardScience === "TABLET") {
                    score += this.scienceValue(scienceCompass, scienceGear, scienceTablet + 1) -
                        this.scienceValue(scienceCompass, scienceGear, scienceTablet);
                } else {
                    // Default science value
                    score += 5 + Math.min(...sciences) * 2;
                }
                break;
            }

            case "YELLOW": {
                // Commercial cards — coins and trade advantages
                score += 6;
                if (epoch === 1) score += 3; // Trade discounts more valuable early
                break;
            }

            case "PURPLE": {
                // Guild/Leader cards — usually high VP potential
                score += 8;
                break;
            }

            case "BLACK": {
                // Cities cards — various effects, moderate value
                score += 5;
                break;
            }
        }

        // === Chain bonus ===
        if (card.freeIf) {
            const hasChain = card.freeIf.some((chainId) =>
                builtCards.some((builtId) => {
                    const builtCard = cardDatabase[builtId];
                    return builtCard?.concatenationProvides?.includes(chainId);
                })
            );
            if (hasChain) score += 4; // Free build via chain = extra value
        }

        // === Slight randomness to avoid predictability ===
        score += this.rng.nextFloat() * 0.5;

        return score;
    }

    /**
     * Check if the AI can afford to build a card.
     */
    private canBuildCard(
        cardId: string,
        builtCards: string[],
        coins: number,
        leftNeighborCards: string[],
        rightNeighborCards: string[],
        tradeDiscounts: { leftRaw: boolean; rightRaw: boolean; bothMfg: boolean }
    ): boolean {
        const card = cardDatabase[cardId];
        if (!card) return false;

        // Check chain build (free)
        if (card.freeIf) {
            const hasChain = card.freeIf.some((chainId) =>
                builtCards.some((builtId) => {
                    const builtCard = cardDatabase[builtId];
                    return builtCard?.concatenationProvides?.includes(chainId);
                })
            );
            if (hasChain) return true;
        }

        // Use ResourceSolver
        const solution = ResourceSolver.findPaymentSolution(
            card.cost,
            builtCards,
            coins,
            leftNeighborCards,
            rightNeighborCards,
            tradeDiscounts
        );

        return solution !== null;
    }

    /**
     * Calculate science VP score.
     * Score = sum of (each_symbol²) + 7 * number_of_complete_sets
     */
    private scienceValue(compass: number, gear: number, tablet: number): number {
        const sets = Math.min(compass, gear, tablet);
        return compass * compass + gear * gear + tablet * tablet + sets * 7;
    }

    /**
     * Determine which science symbol a card provides.
     */
    private getCardScienceType(card: CardData): string | null {
        for (const effect of card.effects) {
            if (effect.action === "GAIN_SCIENCE_COMPASS") return "COMPASS";
            if (effect.action === "GAIN_SCIENCE_GEAR") return "GEAR";
            if (effect.action === "GAIN_SCIENCE_TABLET") return "TABLET";
        }
        return null;
    }
}
