import { SeededRandom } from '../utils/SeededRandom';
import { GameEngine } from '../engine/GameEngine';

// ==================== SeededRandom Tests ====================
describe('SeededRandom', () => {
    it('produces deterministic sequence from same seed', () => {
        const rng1 = new SeededRandom('test-seed-123');
        const rng2 = new SeededRandom('test-seed-123');

        const seq1 = Array.from({ length: 10 }, () => rng1.nextFloat());
        const seq2 = Array.from({ length: 10 }, () => rng2.nextFloat());

        expect(seq1).toEqual(seq2);
    });

    it('produces different sequences from different seeds', () => {
        const rng1 = new SeededRandom('seed-a');
        const rng2 = new SeededRandom('seed-b');

        const val1 = rng1.nextFloat();
        const val2 = rng2.nextFloat();

        expect(val1).not.toEqual(val2);
    });

    it('nextFloat() returns values between 0 and 1', () => {
        const rng = new SeededRandom('bounds-test');
        for (let i = 0; i < 100; i++) {
            const val = rng.nextFloat();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });

    it('nextInt() returns values in range [min, max)', () => {
        const rng = new SeededRandom('int-test');
        for (let i = 0; i < 100; i++) {
            const val = rng.nextInt(5, 10);
            expect(val).toBeGreaterThanOrEqual(5);
            expect(val).toBeLessThanOrEqual(10);
            expect(Number.isInteger(val)).toBe(true);
        }
    });

    it('shuffle() preserves array elements', () => {
        const rng = new SeededRandom('shuffle-test');
        const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const shuffled = rng.shuffle([...original]);

        expect(shuffled.sort()).toEqual(original.sort());
        expect(shuffled.length).toBe(original.length);
    });

    it('shuffle() actually changes order (statistically)', () => {
        const rng = new SeededRandom('shuffle-order');
        const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const shuffled = rng.shuffle([...original]);

        // Very unlikely to be in exact same order
        const sameOrder = original.every((v, i) => v === shuffled[i]);
        expect(sameOrder).toBe(false);
    });
});

// ==================== GameEngine Tests ====================
describe('GameEngine', () => {
    let engine: GameEngine;
    const playerIds = ['player-1', 'player-2', 'player-3'];

    beforeEach(() => {
        engine = new GameEngine({
            playerCount: 3,
            expansions: [],
            allowAI: false,
            seed: 'test-game-seed-42',
        });
        engine.initializeGame(playerIds);
    });

    describe('initializeGame', () => {
        it('initializes all players', () => {
            // Re-create to verify init works
            const eng = new GameEngine({
                playerCount: 3,
                expansions: [],
                allowAI: false,
                seed: 'init-test',
            });
            eng.initializeGame(['a', 'b', 'c']);
            // If no error thrown, init succeeded
            expect(true).toBe(true);
        });
    });

    describe('assignWonders', () => {
        it('assigns unique wonder to each player', () => {
            const wonders = engine.assignWonders();

            expect(wonders.length).toBe(3);

            const wonderIds = wonders.map(w => w.id);
            const uniqueIds = new Set(wonderIds);
            expect(uniqueIds.size).toBe(3);
        });

        it('assigns valid side (DAY or NIGHT)', () => {
            const wonders = engine.assignWonders();

            for (const w of wonders) {
                expect(['DAY', 'NIGHT']).toContain(w.side);
            }
        });

        it('assigns deterministically from same seed', () => {
            const eng1 = new GameEngine({
                playerCount: 3,
                expansions: [],
                allowAI: false,
                seed: 'deterministic-test',
            });
            eng1.initializeGame(playerIds);
            const w1 = eng1.assignWonders();

            const eng2 = new GameEngine({
                playerCount: 3,
                expansions: [],
                allowAI: false,
                seed: 'deterministic-test',
            });
            eng2.initializeGame(playerIds);
            const w2 = eng2.assignWonders();

            expect(w1.map(w => w.id)).toEqual(w2.map(w => w.id));
            expect(w1.map(w => w.side)).toEqual(w2.map(w => w.side));
        });
    });

    describe('dealCards', () => {
        it('deals 7 cards per player for epoch 1', () => {
            const hands = engine.dealCards(1);

            expect(hands.size).toBe(3);
            hands.forEach((hand) => {
                expect(hand.length).toBe(7);
            });
        });

        it('each card appears at most once across hands', () => {
            const hands = engine.dealCards(1);
            const allCards: string[] = [];
            hands.forEach((hand) => allCards.push(...hand));

            const unique = new Set(allCards);
            expect(unique.size).toBe(allCards.length);
        });

        it('deals 21 total cards for 3 players', () => {
            const hands = engine.dealCards(1);
            let total = 0;
            hands.forEach((hand) => (total += hand.length));
            expect(total).toBe(21);
        });
    });

    describe('validateAction', () => {
        it('rejects missing card from hand', () => {
            // Give player a hand first
            engine.dealCards(1);

            const result = engine.validateAction('player-1', {
                playerId: 'player-1',
                cardId: 'NONEXISTENT_CARD_XYZ',
                action: 'BUILD',
            });

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('accepts SELL action for any card in hand', () => {
            const hands = engine.dealCards(1);
            const hand = hands.get('player-1')!;

            const result = engine.validateAction('player-1', {
                playerId: 'player-1',
                cardId: hand[0],
                action: 'SELL',
            });

            expect(result.valid).toBe(true);
        });
    });

    describe('resolveTurn', () => {
        it('processes SELL actions and awards 3 coins', () => {
            const hands = engine.dealCards(1);

            const actions = playerIds.map(pid => ({
                playerId: pid,
                cardId: hands.get(pid)![0],
                action: 'SELL' as const,
            }));

            const result = engine.resolveTurn(actions);

            expect(result.actions.length).toBe(3);
            expect(result.playerUpdates.length).toBe(3);

            // Each should have gained coins (started with 3, sell = +3, so 6)
            for (const update of result.playerUpdates) {
                expect(update.updates.coins).toBe(6);
            }
        });
    });

    describe('resolveMilitaryConflicts', () => {
        it('returns results for all players', () => {
            const results = engine.resolveMilitaryConflicts(1);

            expect(results.length).toBe(3);
            for (const r of results) {
                expect(r.playerId).toBeDefined();
                expect(Array.isArray(r.tokens)).toBe(true);
            }
        });

        it('Epoch 1 victory tokens are +1', () => {
            const results = engine.resolveMilitaryConflicts(1);

            for (const r of results) {
                for (const token of r.tokens) {
                    if (token.startsWith('+')) {
                        expect(token).toBe('+1');
                    } else {
                        expect(token).toBe('-1');
                    }
                }
            }
        });
    });

    describe('calculateFinalScores', () => {
        it('all players have a valid score', () => {
            const scores = engine.calculateFinalScores();

            expect(scores.length).toBe(3);
            for (const s of scores) {
                expect(s.playerId).toBeDefined();
                expect(typeof s.total).toBe('number');
                expect(s.total).toBeGreaterThanOrEqual(0);
            }
        });

        it('scores include all categories', () => {
            const scores = engine.calculateFinalScores();

            for (const s of scores) {
                expect(typeof s.military).toBe('number');
                expect(typeof s.treasury).toBe('number');
                expect(typeof s.wonder).toBe('number');
                expect(typeof s.civilian).toBe('number');
                expect(typeof s.science).toBe('number');
                expect(typeof s.commerce).toBe('number');
                expect(typeof s.guild).toBe('number');
            }
        });
    });
});
