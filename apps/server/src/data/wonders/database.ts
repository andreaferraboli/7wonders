import wondersData from "../wonders.json";

export interface WonderStage {
    cost: {
        resources?: Record<string, number>;
        coins?: number;
    };
    effects: Array<{
        action: string;
        value?: number;
        formula?: string;
    }>;
}

export interface WonderSide {
    stages: WonderStage[];
}

export interface WonderData {
    id: string;
    name: Record<string, string>;
    resource: string;
    sides: {
        DAY: WonderSide;
        NIGHT: WonderSide;
    };
}

/** All wonders indexed by ID */
export const wonderDatabase: Record<string, WonderData> = {};

const allWonders = wondersData as unknown as WonderData[];

for (const wonder of allWonders) {
    wonderDatabase[wonder.id] = wonder;
}

/** Get all wonder IDs */
export function getAllWonderIds(): string[] {
    return allWonders.map((w) => w.id);
}

/** Get wonder data by ID */
export function getWonder(id: string): WonderData | undefined {
    return wonderDatabase[id];
}

/** Get the stages for a specific wonder side */
export function getWonderStages(
    wonderId: string,
    side: "DAY" | "NIGHT"
): WonderStage[] {
    const wonder = wonderDatabase[wonderId];
    if (!wonder) return [];
    return wonder.sides[side].stages;
}

/** Get the starting resource for a wonder */
export function getWonderResource(wonderId: string): string | undefined {
    return wonderDatabase[wonderId]?.resource;
}

console.log(
    `🏛️ Wonder database loaded: ${allWonders.length} wonders (${allWonders.map((w) => w.id).join(", ")})`
);
