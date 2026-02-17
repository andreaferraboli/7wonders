/**
 * Game configuration constants for 7 Wonders.
 * These values define the core rules and limits of the game.
 */

/** Number of cards dealt to each player per epoch */
export const CARDS_PER_PLAYER = 7;

/** Number of epochs in a standard game */
export const EPOCH_COUNT = 3;

/** Number of turns per epoch (cards_per_player - 1 for the discarded card) */
export const TURNS_PER_EPOCH = 6;

/** Starting coins for each player */
export const STARTING_COINS = 3;

/** Coins gained when selling a card */
export const SELL_CARD_COINS = 3;

/** Default trade cost when buying resources from neighbors */
export const DEFAULT_TRADE_COST = 2;

/** Discounted trade cost (with marketplace/trading post) */
export const DISCOUNTED_TRADE_COST = 1;

/** Military victory token values by epoch */
export const MILITARY_VICTORY_TOKENS: Record<number, number> = {
    1: 1,
    2: 3,
    3: 5,
};

/** Military defeat token value (always -1) */
export const MILITARY_DEFEAT_TOKEN = -1;

/** Minimum players */
export const MIN_PLAYERS = 3;

/** Maximum players */
export const MAX_PLAYERS = 7;

/** Player count range */
export const PLAYER_COUNT_RANGE = [3, 4, 5, 6, 7] as const;

/** Grace period for reconnection (in seconds) */
export const RECONNECTION_GRACE_PERIOD = 60;

/** Available expansions */
export const AVAILABLE_EXPANSIONS = [
    "LEADERS",
    "CITIES",
    "ARMADA",
    "EDIFICE",
] as const;

/** Wonder IDs */
export const WONDER_IDS = [
    "ALEXANDRIA",
    "BABYLON",
    "EPHESUS",
    "GIZA",
    "HALIKARNASSUS",
    "OLYMPIA",
    "RHODES",
] as const;

/** Science set bonus (for having all 3 different symbols) */
export const SCIENCE_SET_BONUS = 7;

/** Score categories for final scoring */
export const SCORE_CATEGORIES = [
    "military",
    "treasury",
    "wonder",
    "civilian",
    "science",
    "commerce",
    "guild",
] as const;
