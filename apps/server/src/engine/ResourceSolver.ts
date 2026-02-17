import type { ResourceType, PaymentSolution } from "@7wonders/shared";
import type { CardData } from "../data/cards/database";
import { cardDatabase } from "../data/cards/database";

/**
 * ResourceSolver calculates the optimal way for a player to pay for a card.
 * 
 * The algorithm considers:
 * 1. Player's own resource production (from built brown/grey cards + wonder)
 * 2. Choice resources (produce one of N resources)
 * 3. Trading with neighbors (default cost: 2 coins, discounted: 1 coin)
 * 
 * This is a constraint satisfaction problem that finds the cheapest valid payment.
 */
export class ResourceSolver {
    /**
     * Find all valid payment solutions for a card.
     * Returns the cheapest solution, or null if unpayable.
     */
    static findPaymentSolution(
        cardCost: CardData["cost"],
        playerCards: string[],
        playerCoins: number,
        leftNeighborCards: string[],
        rightNeighborCards: string[],
        tradeDiscounts: { leftRaw: boolean; rightRaw: boolean; bothMfg: boolean }
    ): PaymentSolution | null {
        // If no resource cost, it's free
        const resourceCost = (cardCost as { resources?: Record<string, number> }).resources;
        if (!resourceCost || Object.keys(resourceCost).length === 0) {
            const coinCost = (cardCost as { coins?: number }).coins ?? 0;
            if (coinCost > playerCoins) return null;
            return {
                ownResources: [],
                boughtLeft: [],
                boughtRight: [],
                coinsSpent: coinCost,
            };
        }

        // Gather own production
        const ownProduction = this.getPlayerProduction(playerCards);

        // Simple greedy solver for MVP
        // Try to cover required resources with own production first,
        // then buy from neighbors
        const remaining: Partial<Record<ResourceType, number>> = { ...resourceCost } as Partial<Record<ResourceType, number>>;
        const ownUsed: ResourceType[] = [];
        const boughtLeft: PaymentSolution["boughtLeft"] = [];
        const boughtRight: PaymentSolution["boughtRight"] = [];

        // 1. Use own fixed resources
        for (const resource of ownProduction.fixed) {
            if (remaining[resource] && remaining[resource]! > 0) {
                remaining[resource]! -= 1;
                ownUsed.push(resource);
                if (remaining[resource] === 0) {
                    delete remaining[resource];
                }
            }
        }

        // 2. Use own choice resources
        for (const choices of ownProduction.choice) {
            for (const resource of choices) {
                if (remaining[resource] && remaining[resource]! > 0) {
                    remaining[resource]! -= 1;
                    ownUsed.push(resource);
                    if (remaining[resource] === 0) {
                        delete remaining[resource];
                    }
                    break; // Only one choice per card
                }
            }
        }

        // 3. Buy remaining from neighbors
        let totalCoins = (cardCost as { coins?: number }).coins ?? 0;
        const leftProduction = this.getPlayerProduction(leftNeighborCards);
        const rightProduction = this.getPlayerProduction(rightNeighborCards);

        for (const [resStr, count] of Object.entries(remaining)) {
            const res = resStr as ResourceType;
            const isRaw = ["WOOD", "STONE", "CLAY", "ORE"].includes(res);

            for (let i = 0; i < (count ?? 0); i++) {
                // Try left neighbor first
                const leftCost = isRaw && tradeDiscounts.leftRaw ? 1
                    : !isRaw && tradeDiscounts.bothMfg ? 1
                        : 2;
                const rightCost = isRaw && tradeDiscounts.rightRaw ? 1
                    : !isRaw && tradeDiscounts.bothMfg ? 1
                        : 2;

                const leftHas = leftProduction.fixed.includes(res);
                const rightHas = rightProduction.fixed.includes(res);

                if (leftHas && leftCost <= rightCost) {
                    boughtLeft.push({ resource: res, cost: leftCost });
                    totalCoins += leftCost;
                } else if (rightHas) {
                    boughtRight.push({ resource: res, cost: rightCost });
                    totalCoins += rightCost;
                } else if (leftHas) {
                    boughtLeft.push({ resource: res, cost: leftCost });
                    totalCoins += leftCost;
                } else {
                    // Can't buy this resource from either neighbor
                    return null;
                }
            }
        }

        if (totalCoins > playerCoins) {
            return null;
        }

        return {
            ownResources: ownUsed,
            boughtLeft,
            boughtRight,
            coinsSpent: totalCoins,
        };
    }

    /**
     * Get a player's resource production from their built cards.
     */
    private static getPlayerProduction(cardIds: string[]): {
        fixed: ResourceType[];
        choice: ResourceType[][];
    } {
        const fixed: ResourceType[] = [];
        const choice: ResourceType[][] = [];

        for (const id of cardIds) {
            const card = cardDatabase[id];
            if (!card) continue;

            if (card.producesResource) {
                fixed.push(card.producesResource as ResourceType);
            }
            if (card.producesChoice) {
                choice.push(card.producesChoice as ResourceType[]);
            }
        }

        return { fixed, choice };
    }
}
