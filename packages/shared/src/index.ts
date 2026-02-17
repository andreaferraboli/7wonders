// Types
export type {
    CardColor,
    ResourceType,
    ScienceSymbol,
    CardCost,
    CardEffect,
    Card,
} from './types/cards';

export type {
    GamePhase,
    ActionType,
    PaymentSolution,
    PlayerAction,
    GameConfig,
    WonderAssignment,
    MilitaryConflictResult,
    TurnResult,
    PlayerUpdate,
    FinalScore,
    ValidationResult,
} from './types/game';

export type { EffectAction } from './types/effects';

// Constants
export * from './constants/gameConfig';

// Effects
export * from './types/effects';

// Validators
export {
    CardSchema,
    CardCostSchema,
    CardEffectSchema,
    CardColorSchema,
    ResourceTypeSchema,
    ScienceSymbolSchema,
    ExpansionSchema,
    GamePhaseSchema,
    ActionTypeSchema,
    PaymentSolutionSchema,
    PlayerActionSchema,
    GameConfigSchema,
    validateCard,
    validatePlayerAction,
    validateGameConfig,
} from './validators/zod-schemas';
