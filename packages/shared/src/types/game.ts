import { ResourceType } from './cards';

export type GamePhase =
    | "LOBBY"
    | "RECRUITMENT"  // Leaders
    | "DRAFT"
    | "RESOLUTION"
    | "WAR"
    | "FINISHED";

export type ActionType = "BUILD" | "SELL" | "WONDER";

export interface PaymentSolution {
    ownResources: ResourceType[];
    boughtLeft: Array<{ resource: ResourceType; cost: number }>;
    boughtRight: Array<{ resource: ResourceType; cost: number }>;
    coinsSpent: number;
}

export interface PlayerAction {
    playerId: string;
    cardId: string;
    action: ActionType;
    payment?: PaymentSolution;
    wonderStageIndex?: number;  // Se BUILD_WONDER
}

export interface GameConfig {
    playerCount: 3 | 4 | 5 | 6 | 7;
    expansions: Array<"LEADERS" | "CITIES" | "ARMADA" | "EDIFICE">;
    allowAI: boolean;
}

export interface WonderAssignment {
    id: string;
    side: "DAY" | "NIGHT";
}

export interface MilitaryConflictResult {
    playerId: string;
    tokens: string[];
}

export interface TurnResult {
    actions: PlayerAction[];
    playerUpdates: Array<{
        playerId: string;
        updates: PlayerUpdate;
    }>;
}

export interface PlayerUpdate {
    coins?: number;
    militaryPower?: number;
    cityCards?: string[];
    wonderStagesBuilt?: number;
    scienceCompass?: number;
    scienceGear?: number;
    scienceTablet?: number;
}

export interface FinalScore {
    playerId: string;
    military: number;
    treasury: number;
    wonder: number;
    civilian: number;
    science: number;
    commerce: number;
    guild: number;
    total: number;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
