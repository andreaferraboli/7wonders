import { BaseMiddleware } from "./BaseMiddleware";

/**
 * Armada expansion middleware.
 * Adds naval fleet mechanics: COMMERCIAL, MILITARY, SENATE fleets.
 */
export class ArmadaMiddleware extends BaseMiddleware {
    name = "ARMADA";

    preTurn(actions: unknown[]): unknown[] {
        // TODO: Process fleet movement actions
        return actions;
    }

    postTurn(result: unknown): unknown {
        // TODO: Apply naval warfare results
        return result;
    }

    onEpochEnd(_epoch: number): void {
        // TODO: Resolve naval conflicts
    }
}
