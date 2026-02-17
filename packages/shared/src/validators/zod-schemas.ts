import { z } from 'zod';

// === Resource & Card Enums ===

export const CardColorSchema = z.enum([
    "BROWN", "GREY", "BLUE", "YELLOW", "RED", "GREEN", "PURPLE", "BLACK"
]);

export const ResourceTypeSchema = z.enum([
    "WOOD", "STONE", "CLAY", "ORE", "GLASS", "PAPYRUS", "LOOM"
]);

export const ScienceSymbolSchema = z.enum(["COMPASS", "GEAR", "TABLET"]);

export const ExpansionSchema = z.enum(["BASE", "LEADERS", "CITIES", "ARMADA", "EDIFICE"]);

// === Card Schemas ===

export const CardCostSchema = z.object({
    coins: z.number().int().min(0).optional(),
    resources: z.record(ResourceTypeSchema, z.number().int().min(1)).optional(),
    freeIf: z.array(z.string()).optional(),
});

export const CardEffectSchema = z.object({
    type: z.enum(["IMMEDIATE", "PERSISTENT", "TRIGGERED", "END_GAME"]),
    timing: z.enum(["ON_BUILD", "ON_TURN_END", "ON_EPOCH_END", "ON_GAME_END"]),
    action: z.string(),
    target: z.enum(["SELF", "NEIGHBORS", "ALL_OTHERS"]).optional(),
    value: z.number().optional(),
    formula: z.string().optional(),
    priority: z.number().int().min(0).max(100),
    trigger: z.object({
        condition: z.string(),
        filters: z.record(z.unknown()).optional(),
        maxActivations: z.number().int().min(1).optional(),
    }).optional(),
});

export const CardSchema = z.object({
    id: z.string().min(1),
    name: z.record(z.string(), z.string()),
    epoch: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    color: CardColorSchema,
    minPlayers: z.union([
        z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)
    ]),
    cost: CardCostSchema,
    effects: z.array(CardEffectSchema),
    concatenationProvides: z.array(z.string()).optional(),
    expansion: ExpansionSchema,
});

// === Game Schemas ===

export const GamePhaseSchema = z.enum([
    "LOBBY", "RECRUITMENT", "DRAFT", "RESOLUTION", "WAR", "FINISHED"
]);

export const ActionTypeSchema = z.enum(["BUILD", "SELL", "WONDER"]);

export const PaymentSolutionSchema = z.object({
    ownResources: z.array(ResourceTypeSchema),
    boughtLeft: z.array(z.object({
        resource: ResourceTypeSchema,
        cost: z.number().int().min(0),
    })),
    boughtRight: z.array(z.object({
        resource: ResourceTypeSchema,
        cost: z.number().int().min(0),
    })),
    coinsSpent: z.number().int().min(0),
});

export const PlayerActionSchema = z.object({
    playerId: z.string().min(1),
    cardId: z.string().min(1),
    action: ActionTypeSchema,
    payment: PaymentSolutionSchema.optional(),
    wonderStageIndex: z.number().int().min(0).optional(),
});

export const GameConfigSchema = z.object({
    playerCount: z.union([
        z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)
    ]),
    expansions: z.array(z.enum(["LEADERS", "CITIES", "ARMADA", "EDIFICE"])),
    allowAI: z.boolean(),
});

// === Validation Helpers ===

export function validateCard(data: unknown) {
    return CardSchema.safeParse(data);
}

export function validatePlayerAction(data: unknown) {
    return PlayerActionSchema.safeParse(data);
}

export function validateGameConfig(data: unknown) {
    return GameConfigSchema.safeParse(data);
}
