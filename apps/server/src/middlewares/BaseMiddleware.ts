/**
 * Base middleware interface for expansion-specific logic.
 * Middlewares intercept turn resolution to add expansion-specific behavior.
 */
export abstract class BaseMiddleware {
    abstract name: string;

    /**
     * Called before turn resolution.
     * Can modify actions or add pre-turn effects.
     */
    abstract preTurn(actions: unknown[]): unknown[];

    /**
     * Called after turn resolution.
     * Can apply post-turn effects (e.g., fleet movement, edifice contribution).
     */
    abstract postTurn(result: unknown): unknown;

    /**
     * Called at end of epoch.
     */
    abstract onEpochEnd(epoch: number): void;
}
