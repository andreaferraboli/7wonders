import seedrandom from "seedrandom";

/**
 * Deterministic random number generator using a seed.
 * Ensures reproducible game states for debugging and replay.
 */
export class SeededRandom {
    private rng: () => number;

    constructor(seed: string) {
        this.rng = seedrandom(seed);
    }

    /** Returns a random integer between min and max (inclusive) */
    nextInt(min: number, max: number): number {
        return Math.floor(this.rng() * (max - min + 1)) + min;
    }

    /** Returns a random boolean */
    nextBoolean(): boolean {
        return this.rng() < 0.5;
    }

    /** Returns a random float between 0 (inclusive) and 1 (exclusive) */
    nextFloat(): number {
        return this.rng();
    }

    /** Fisher-Yates shuffle — deterministic */
    shuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /** Pick a random element from array */
    pick<T>(array: T[]): T {
        return array[this.nextInt(0, array.length - 1)];
    }
}
