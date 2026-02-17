import { AIPlayer } from '../engine/AIPlayer';

describe('AIPlayer', () => {
    let ai: AIPlayer;

    beforeEach(() => {
        ai = new AIPlayer('test-ai-seed-42');
    });

    const defaultParams = {
        playerId: 'ai-1',
        coins: 3,
        epoch: 1,
        militaryPower: 0,
        leftNeighborMilitary: 0,
        rightNeighborMilitary: 0,
        leftNeighborCards: [] as string[],
        rightNeighborCards: [] as string[],
        wonderStagesBuilt: 0,
        wonderTotalStages: 3,
        scienceCompass: 0,
        scienceGear: 0,
        scienceTablet: 0,
        tradeDiscounts: { leftRaw: false, rightRaw: false, bothMfg: false },
    };

    describe('chooseAction', () => {
        it('always returns a valid action', () => {
            const result = ai.chooseAction(
                defaultParams.playerId,
                ['LUMBER_YARD', 'STONE_PIT', 'CLAY_POOL'],
                [],
                defaultParams.coins,
                defaultParams.epoch,
                defaultParams.militaryPower,
                defaultParams.leftNeighborMilitary,
                defaultParams.rightNeighborMilitary,
                defaultParams.leftNeighborCards,
                defaultParams.rightNeighborCards,
                defaultParams.wonderStagesBuilt,
                defaultParams.wonderTotalStages,
                defaultParams.scienceCompass,
                defaultParams.scienceGear,
                defaultParams.scienceTablet,
                defaultParams.tradeDiscounts
            );

            expect(result).toBeDefined();
            expect(result.playerId).toBe('ai-1');
            expect(['BUILD', 'SELL', 'WONDER']).toContain(result.action);
            expect(['LUMBER_YARD', 'STONE_PIT', 'CLAY_POOL']).toContain(result.cardId);
        });

        it('never selects a card not in hand', () => {
            const hand = ['LUMBER_YARD', 'CLAY_POOL'];
            const result = ai.chooseAction(
                'ai-1', hand, [],
                3, 1, 0, 0, 0, [], [], 0, 3, 0, 0, 0,
                { leftRaw: false, rightRaw: false, bothMfg: false }
            );

            expect(hand).toContain(result.cardId);
        });

        it('does not try to BUILD an already-built card', () => {
            const alreadyBuilt = ['LUMBER_YARD'];
            const hand = ['LUMBER_YARD', 'CLAY_POOL', 'STONE_PIT'];

            const result = ai.chooseAction(
                'ai-1', hand, alreadyBuilt,
                10, 1, 0, 0, 0, [], [], 0, 3, 0, 0, 0,
                { leftRaw: false, rightRaw: false, bothMfg: false }
            );

            if (result.action === 'BUILD') {
                expect(result.cardId).not.toBe('LUMBER_YARD');
            }
        });

        it('deterministic with same seed', () => {
            const ai1 = new AIPlayer('deterministic-ai');
            const ai2 = new AIPlayer('deterministic-ai');

            const hand = ['LUMBER_YARD', 'STONE_PIT', 'CLAY_POOL'];

            const r1 = ai1.chooseAction(
                'ai-1', hand, [],
                3, 1, 0, 0, 0, [], [], 0, 3, 0, 0, 0,
                { leftRaw: false, rightRaw: false, bothMfg: false }
            );

            const r2 = ai2.chooseAction(
                'ai-1', hand, [],
                3, 1, 0, 0, 0, [], [], 0, 3, 0, 0, 0,
                { leftRaw: false, rightRaw: false, bothMfg: false }
            );

            expect(r1.cardId).toBe(r2.cardId);
            expect(r1.action).toBe(r2.action);
        });

        it('sells when no cards can be built', () => {
            // Use a hand of expensive cards that cannot be afforded
            const hand = ['FORTIFICATIONS', 'SIEGE_WORKSHOP', 'ARSENAL'];

            const result = ai.chooseAction(
                'ai-1', hand, [],
                0, 3, 0, 0, 0, [], [], 0, 3, 0, 0, 0,
                { leftRaw: false, rightRaw: false, bothMfg: false }
            );

            // Should sell or wonder since can't afford to build
            expect(['SELL', 'WONDER']).toContain(result.action);
        });
    });
});
