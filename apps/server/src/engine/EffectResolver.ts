import type { CardEffect } from "@7wonders/shared";
import type { CardData } from "../data/cards/database";

/**
 * EffectResolver processes card effects and applies them to game state.
 * Effects are resolved in priority order (lower = first).
 */
export class EffectResolver {
    /**
     * Sort effects by priority for correct resolution order.
     * Lower priority numbers execute first.
     */
    static sortByPriority(effects: CardEffect[]): CardEffect[] {
        return [...effects].sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get all immediate effects from a card.
     */
    static getImmediateEffects(card: CardData): CardEffect[] {
        return (card.effects as CardEffect[]).filter(
            (e) => e.type === "IMMEDIATE" || e.type === "PERSISTENT"
        );
    }

    /**
     * Get all end-game scoring effects from a card.
     */
    static getEndGameEffects(card: CardData): CardEffect[] {
        return (card.effects as CardEffect[]).filter(
            (e) => e.type === "END_GAME" && e.timing === "ON_GAME_END"
        );
    }

    /**
     * Evaluate a formula-based effect.
     * Example: "COUNT(cards.YELLOW) * 2"
     */
    static evaluateFormula(
        formula: string,
        context: {
            ownCards: CardData[];
            neighborLeftCards: CardData[];
            neighborRightCards: CardData[];
        }
    ): number {
        // Simple formula evaluation for MVP
        const countMatch = formula.match(/COUNT\(cards\.(\w+)\)\s*\*\s*(\d+)/);
        if (countMatch) {
            const color = countMatch[1];
            const multiplier = parseInt(countMatch[2], 10);
            const count = context.ownCards.filter((c) => c.color === color).length;
            return count * multiplier;
        }

        // COUNT with neighbors
        const countAllMatch = formula.match(/COUNT_ALL\(cards\.(\w+)\)\s*\*\s*(\d+)/);
        if (countAllMatch) {
            const color = countAllMatch[1];
            const multiplier = parseInt(countAllMatch[2], 10);
            const totalCount =
                context.ownCards.filter((c) => c.color === color).length +
                context.neighborLeftCards.filter((c) => c.color === color).length +
                context.neighborRightCards.filter((c) => c.color === color).length;
            return totalCount * multiplier;
        }

        return 0;
    }
}
