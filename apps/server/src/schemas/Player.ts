import { Schema, type, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("string") sessionId: string = "";
    @type("string") userId: string = "";
    @type("number") position: number = 0;

    // Wonder
    @type("string") wonderId: string = "";
    @type("string") wonderSide: string = "DAY";
    @type("number") wonderStagesBuilt: number = 0;

    // City
    @type(["string"]) cityCards = new ArraySchema<string>();
    @type("number") coins: number = 3;
    @type("number") militaryPower: number = 0;
    @type(["string"]) militaryTokens = new ArraySchema<string>();

    // Science
    @type("number") scienceCompass: number = 0;
    @type("number") scienceGear: number = 0;
    @type("number") scienceTablet: number = 0;

    // Hand (solo proprietario vede — filtrato lato room)
    @type(["string"]) hand = new ArraySchema<string>();

    // Turn state
    @type("string") selectedCard: string = "";
    @type("string") selectedAction: string = "";
    @type("boolean") isReady: boolean = false;

    @type("boolean") isAI: boolean = false;
}
