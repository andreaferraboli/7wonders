import baseAge1 from "./base.json";
import baseAge2 from "./base_age2.json";
import baseAge3 from "./base_age3.json";
import leadersCards from "./leaders.json";
import citiesCards from "./cities.json";

export interface CardData {
    id: string;
    name: Record<string, string>;
    epoch: number;
    color: string;
    minPlayers: number;
    cost: Record<string, unknown>;
    effects: Array<Record<string, unknown>>;
    concatenationProvides?: string[];
    freeIf?: string[];
    expansion: string;
    producesResource?: string;
    producesChoice?: string[];
}

/** Flat map of all cards indexed by ID */
export const cardDatabase: Record<string, CardData> = {};

const allCards: CardData[] = [
    ...(baseAge1 as CardData[]),
    ...(baseAge2 as CardData[]),
    ...(baseAge3 as CardData[]),
    ...(leadersCards as CardData[]),
    ...(citiesCards as CardData[]),
];

for (const card of allCards) {
    cardDatabase[card.id] = card;
}

/** Get cards filtered by epoch, player count, and expansions */
export function getFilteredCards(
    epoch: number,
    playerCount: number,
    expansions: string[] = ["BASE"]
): CardData[] {
    return allCards.filter(
        (card) =>
            card.epoch === epoch &&
            card.minPlayers <= playerCount &&
            expansions.includes(card.expansion)
    );
}

/** Get guild cards (for epoch 3 — pick playerCount+2 guilds) */
export function getGuildCards(): CardData[] {
    return allCards.filter((c) => c.color === "PURPLE");
}

console.log(`📦 Card database loaded: ${Object.keys(cardDatabase).length} cards (Age1: ${(baseAge1 as CardData[]).length}, Age2: ${(baseAge2 as CardData[]).length}, Age3: ${(baseAge3 as CardData[]).length})`);
