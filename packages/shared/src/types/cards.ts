export type CardColor =
    | "BROWN"    // Materie prime
    | "GREY"     // Manufatti
    | "BLUE"     // Civili
    | "YELLOW"   // Commerciali
    | "RED"      // Militari
    | "GREEN"    // Scientifiche
    | "PURPLE"   // Gilde
    | "BLACK";   // Cities expansion

export type ResourceType =
    | "WOOD" | "STONE" | "CLAY" | "ORE"      // Materie prime
    | "GLASS" | "PAPYRUS" | "LOOM";          // Manufatti

export type ScienceSymbol = "COMPASS" | "GEAR" | "TABLET";

export interface CardCost {
    coins?: number;
    resources?: Partial<Record<ResourceType, number>>;
    freeIf?: string[];  // Concatenazione: ["THEATER_SYMBOL"]
}

export interface CardEffect {
    type: "IMMEDIATE" | "PERSISTENT" | "TRIGGERED" | "END_GAME";
    timing: "ON_BUILD" | "ON_TURN_END" | "ON_EPOCH_END" | "ON_GAME_END";
    action: string;  // GAIN_COINS, MOVE_FLEET, etc.
    target?: "SELF" | "NEIGHBORS" | "ALL_OTHERS";
    value?: number;
    formula?: string;  // "COUNT(cards.YELLOW) * 2"
    priority: number;  // 0-100
    trigger?: {
        condition: string;
        filters?: Record<string, unknown>;
        maxActivations?: number;
    };
}

export interface Card {
    id: string;
    name: Record<string, string>;  // { en: "Theater", it: "Teatro" }
    epoch: 1 | 2 | 3;
    color: CardColor;
    minPlayers: 3 | 4 | 5 | 6 | 7;
    cost: CardCost;
    effects: CardEffect[];
    concatenationProvides?: string[];
    expansion: "BASE" | "LEADERS" | "CITIES" | "ARMADA" | "EDIFICE";
}
