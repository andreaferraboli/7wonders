/**
 * Effect action constants used throughout the game engine.
 * These are referenced by CardEffect.action fields in card data.
 */

// === Resource Production ===
export const PRODUCE_RESOURCE = "PRODUCE_RESOURCE";
export const PRODUCE_CHOICE = "PRODUCE_CHOICE";      // Produce one of multiple resources

// === Military ===
export const GAIN_MILITARY = "GAIN_MILITARY";
export const LOSE_MILITARY = "LOSE_MILITARY";

// === Economy ===
export const GAIN_COINS = "GAIN_COINS";
export const LOSE_COINS = "LOSE_COINS";
export const TRADE_DISCOUNT = "TRADE_DISCOUNT";       // Reduce trade cost with neighbors

// === Science ===
export const GAIN_SCIENCE = "GAIN_SCIENCE";
export const GAIN_SCIENCE_WILD = "GAIN_SCIENCE_WILD"; // Choose any symbol

// === Victory Points ===
export const GAIN_VP = "GAIN_VP";
export const GAIN_VP_FORMULA = "GAIN_VP_FORMULA";     // VP based on formula

// === Special ===
export const FREE_BUILD = "FREE_BUILD";               // Build for free once per epoch
export const PLAY_DISCARD = "PLAY_DISCARD";            // Play from discard pile
export const COPY_GUILD = "COPY_GUILD";                // Copy a neighbor's guild
export const BUILD_LAST_CARD = "BUILD_LAST_CARD";      // Build 7th card instead of discarding

// === Cities Expansion ===
export const GAIN_DIPLOMACY = "GAIN_DIPLOMACY";        // Skip military conflict
export const SPY = "SPY";                               // Copy neighbor's science symbol
export const MOVE_FLEET = "MOVE_FLEET";                 // Armada fleet movement

// === Armada Expansion ===
export const GAIN_ISLAND = "GAIN_ISLAND";
export const NAVAL_WARFARE = "NAVAL_WARFARE";

// === Leaders Expansion ===
export const RECRUIT_LEADER = "RECRUIT_LEADER";
export const LEADER_DISCOUNT = "LEADER_DISCOUNT";

// === Edifice Expansion ===
export const CONTRIBUTE_EDIFICE = "CONTRIBUTE_EDIFICE";
export const EDIFICE_PENALTY = "EDIFICE_PENALTY";

/** All possible effect actions as a union type */
export type EffectAction =
    | typeof PRODUCE_RESOURCE
    | typeof PRODUCE_CHOICE
    | typeof GAIN_MILITARY
    | typeof LOSE_MILITARY
    | typeof GAIN_COINS
    | typeof LOSE_COINS
    | typeof TRADE_DISCOUNT
    | typeof GAIN_SCIENCE
    | typeof GAIN_SCIENCE_WILD
    | typeof GAIN_VP
    | typeof GAIN_VP_FORMULA
    | typeof FREE_BUILD
    | typeof PLAY_DISCARD
    | typeof COPY_GUILD
    | typeof BUILD_LAST_CARD
    | typeof GAIN_DIPLOMACY
    | typeof SPY
    | typeof MOVE_FLEET
    | typeof GAIN_ISLAND
    | typeof NAVAL_WARFARE
    | typeof RECRUIT_LEADER
    | typeof LEADER_DISCOUNT
    | typeof CONTRIBUTE_EDIFICE
    | typeof EDIFICE_PENALTY;
