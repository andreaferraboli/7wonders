import { ActionValidator } from '../engine/ActionValidator';
import { ResourceSolver } from '../engine/ResourceSolver';
import { GameEngine } from '../engine/GameEngine';

describe('ActionValidator', () => {
    describe('validate', () => {
        it('rejects card not in hand', () => {
            const result = ActionValidator.validate(
                { playerId: 'p1', cardId: 'CARD_C', action: 'BUILD' },
                ['CARD_A', 'CARD_B'],
                10,
                []
            );
            expect(result.valid).toBe(false);
            expect(result.errors.some((e: string) => e.includes('not in'))).toBe(true);
        });

        it('rejects already-built card for BUILD', () => {
            const result = ActionValidator.validate(
                { playerId: 'p1', cardId: 'CARD_A', action: 'BUILD' },
                ['CARD_A', 'CARD_B'],
                10,
                ['CARD_A']  // already built
            );
            expect(result.valid).toBe(false);
            expect(result.errors.some((e: string) => e.includes('already built'))).toBe(true);
        });

        it('accepts valid SELL action', () => {
            const result = ActionValidator.validate(
                { playerId: 'p1', cardId: 'CARD_A', action: 'SELL' },
                ['CARD_A', 'CARD_B'],
                10,
                []
            );
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('accepts valid BUILD action', () => {
            const result = ActionValidator.validate(
                { playerId: 'p1', cardId: 'CARD_A', action: 'BUILD' },
                ['CARD_A', 'CARD_B'],
                10,
                []
            );
            expect(result.valid).toBe(true);
        });

        it('rejects WONDER without wonderStageIndex', () => {
            const result = ActionValidator.validate(
                { playerId: 'p1', cardId: 'CARD_A', action: 'WONDER' },
                ['CARD_A', 'CARD_B'],
                10,
                []
            );
            expect(result.valid).toBe(false);
            expect(result.errors.some((e: string) => e.includes('wonderStageIndex'))).toBe(true);
        });

        it('accepts WONDER with wonderStageIndex', () => {
            const result = ActionValidator.validate(
                { playerId: 'p1', cardId: 'CARD_A', action: 'WONDER', wonderStageIndex: 0 },
                ['CARD_A', 'CARD_B'],
                10,
                []
            );
            expect(result.valid).toBe(true);
        });

        it('rejects BUILD with insufficient coins payment', () => {
            const result = ActionValidator.validate(
                {
                    playerId: 'p1',
                    cardId: 'CARD_A',
                    action: 'BUILD',
                    payment: { ownResources: [], boughtLeft: [], boughtRight: [], coinsSpent: 10 },
                },
                ['CARD_A', 'CARD_B'],
                5, // only 5 coins but payment needs 10
                []
            );
            expect(result.valid).toBe(false);
            expect(result.errors.some((e: string) => e.includes('Insufficient coins'))).toBe(true);
        });
    });
});

describe('ResourceSolver', () => {
    describe('findPaymentSolution', () => {
        const noDiscounts = { leftRaw: false, rightRaw: false, bothMfg: false };

        it('free card returns zero-cost solution', () => {
            const result = ResourceSolver.findPaymentSolution(
                {},          // no cost
                [],          // no player cards
                10,          // coins
                [],          // left neighbor
                [],          // right neighbor
                noDiscounts
            );

            expect(result).not.toBeNull();
            expect(result!.coinsSpent).toBe(0);
            expect(result!.ownResources).toHaveLength(0);
        });

        it('coin-only cost returns correct payment', () => {
            const result = ResourceSolver.findPaymentSolution(
                { coins: 3 },
                [],
                5,
                [], [],
                noDiscounts
            );

            expect(result).not.toBeNull();
            expect(result!.coinsSpent).toBe(3);
        });

        it('returns null when coins insufficient for coin-only cost', () => {
            const result = ResourceSolver.findPaymentSolution(
                { coins: 5 },
                [],
                3,
                [], [],
                noDiscounts
            );

            expect(result).toBeNull();
        });
    });
});

describe('GameEngine - Full Game Flow', () => {
    it('can simulate a complete 3-epoch game with SELL actions', () => {
        const engine = new GameEngine({
            playerCount: 3,
            expansions: [],
            allowAI: false,
            seed: 'full-game-test-seed',
        });

        const playerIds = ['alice', 'bob', 'charlie'];
        engine.initializeGame(playerIds);
        engine.assignWonders();

        for (let epoch = 1; epoch <= 3; epoch++) {
            const hands = engine.dealCards(epoch);

            for (let turn = 1; turn <= 6; turn++) {
                const actions = playerIds.map(pid => {
                    const hand = hands.get(pid)!;
                    return {
                        playerId: pid,
                        cardId: hand[0],
                        action: 'SELL' as const,
                    };
                });

                engine.resolveTurn(actions);

                // Simulate card drafting: remove played card
                hands.forEach((hand) => {
                    hand.shift();
                });
            }

            const warResults = engine.resolveMilitaryConflicts(epoch);
            expect(warResults.length).toBe(3);
        }

        const scores = engine.calculateFinalScores();
        expect(scores.length).toBe(3);

        for (const score of scores) {
            expect(score.total).toBeGreaterThanOrEqual(0);
            expect(score.treasury).toBeGreaterThanOrEqual(0);
        }
    });
});
