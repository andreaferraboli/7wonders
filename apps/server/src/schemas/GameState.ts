import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema {
    @type("string") gameId: string = "";
    @type("string") phase: string = "LOBBY";
    @type("number") epoch: number = 1;
    @type("number") turn: number = 0;
    @type("string") direction: string = "LEFT";

    @type({ map: Player }) players = new MapSchema<Player>();

    @type(["string"]) deck: ArraySchema<string> = new ArraySchema<string>();
    @type(["string"]) discard: ArraySchema<string> = new ArraySchema<string>();

    @type("string") seed: string = "";

    // Non sincronizzato (server-only) — non decorato con @type
    serverData?: {
        config: {
            playerCount: number;
            expansions: string[];
            allowAI: boolean;
        };
        turnBarrier: Map<string, {
            playerId: string;
            cardId: string;
            action: string;
            payment?: unknown;
            wonderStageIndex?: number;
        }>;
    };
}
