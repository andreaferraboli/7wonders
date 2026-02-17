import {
    wonderDatabase,
    getAllWonderIds,
    getWonder,
    getWonderStages,
    getWonderResource,
} from '../data/wonders/database';

describe('Wonder Database', () => {
    it('loads all 7 wonders', () => {
        const ids = getAllWonderIds();
        expect(ids.length).toBe(7);
        expect(ids).toContain('ALEXANDRIA');
        expect(ids).toContain('BABYLON');
        expect(ids).toContain('EPHESUS');
        expect(ids).toContain('GIZA');
        expect(ids).toContain('HALIKARNASSUS');
        expect(ids).toContain('OLYMPIA');
        expect(ids).toContain('RHODES');
    });

    it('each wonder has DAY and NIGHT sides', () => {
        for (const id of getAllWonderIds()) {
            const wonder = getWonder(id);
            expect(wonder).toBeDefined();
            expect(wonder!.sides.DAY).toBeDefined();
            expect(wonder!.sides.NIGHT).toBeDefined();
            expect(wonder!.sides.DAY.stages.length).toBeGreaterThanOrEqual(2);
            expect(wonder!.sides.NIGHT.stages.length).toBeGreaterThanOrEqual(2);
        }
    });

    it('each wonder has a starting resource', () => {
        const resources = getAllWonderIds().map((id) => getWonderResource(id));
        expect(resources).toEqual(expect.arrayContaining([
            'GLASS', 'CLAY', 'PAPYRUS', 'STONE', 'LOOM', 'WOOD', 'ORE',
        ]));
    });

    it('each stage has a cost and at least one effect', () => {
        for (const id of getAllWonderIds()) {
            for (const side of ['DAY', 'NIGHT'] as const) {
                const stages = getWonderStages(id, side);
                for (const stage of stages) {
                    expect(stage.cost).toBeDefined();
                    expect(stage.effects.length).toBeGreaterThan(0);
                }
            }
        }
    });

    describe('specific wonders', () => {
        it('Giza NIGHT has 4 stages', () => {
            const stages = getWonderStages('GIZA', 'NIGHT');
            expect(stages.length).toBe(4);
        });

        it('Babylon DAY stage 2 gives science wild', () => {
            const stages = getWonderStages('BABYLON', 'DAY');
            const stage2 = stages[1];
            expect(stage2.effects[0].action).toBe('GAIN_SCIENCE_WILD');
        });

        it('Rhodes DAY stage 2 gives military', () => {
            const stages = getWonderStages('RHODES', 'DAY');
            const stage2 = stages[1];
            expect(stage2.effects[0].action).toBe('GAIN_MILITARY');
            expect(stage2.effects[0].value).toBe(2);
        });

        it('Olympia NIGHT stage 1 gives trade discount', () => {
            const stages = getWonderStages('OLYMPIA', 'NIGHT');
            expect(stages[0].effects[0].action).toBe('TRADE_DISCOUNT');
        });
    });

    it('returns empty stages for unknown wonder', () => {
        const stages = getWonderStages('NONEXISTENT', 'DAY');
        expect(stages).toEqual([]);
    });

    it('returns undefined resource for unknown wonder', () => {
        expect(getWonderResource('NONEXISTENT')).toBeUndefined();
    });
});
