import type { PlayerAction, ValidationResult } from "@7wonders/shared";

/**
 * ActionValidator performs server-side validation of all player actions.
 * This is the security boundary — client is always untrusted.
 */
export class ActionValidator {
    /**
     * Validate a complete PlayerAction against the current game state.
     */
    static validate(
        action: PlayerAction,
        playerHand: string[],
        playerCoins: number,
        builtCards: string[]
    ): ValidationResult {
        const errors: string[] = [];

        // Card must be in player's hand
        if (!playerHand.includes(action.cardId)) {
            errors.push(`Card ${action.cardId} is not in your hand`);
        }

        // Can't build a card you already have
        if (action.action === "BUILD" && builtCards.includes(action.cardId)) {
            errors.push(`Card ${action.cardId} is already built`);
        }

        // SELL always valid (if card is in hand—checked above)

        // WONDER requires a valid stage index
        if (action.action === "WONDER" && action.wonderStageIndex === undefined) {
            errors.push("wonderStageIndex is required for WONDER action");
        }

        // Payment validation (for BUILD and WONDER)
        if (action.action !== "SELL" && action.payment) {
            if (action.payment.coinsSpent > playerCoins) {
                errors.push(
                    `Insufficient coins: need ${action.payment.coinsSpent}, have ${playerCoins}`
                );
            }
        }

        return { valid: errors.length === 0, errors };
    }
}
