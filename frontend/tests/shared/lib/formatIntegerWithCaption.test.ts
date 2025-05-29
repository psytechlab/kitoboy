import {beforeEach, describe, expect, it} from 'vitest';

import {formatIntegerWithCaption} from '../../../src/shared/lib/formatIntegerWithCaption';

describe('formatIntegerWithCaption', () => {
    let forms: [string, string, string];

    describe('feminine', () => {
        beforeEach(() => {
            forms = ['ветка', 'ветки', 'веток'];
        });

        it('one', () => {
            const res = formatIntegerWithCaption.apply(null, [1, ...forms]);

            expect(res).toBe('1 ветка');
        });

        it('two', () => {
            const res = formatIntegerWithCaption.apply(null, [2, ...forms]);

            expect(res).toBe('2 ветки');
        });

        it('five', () => {
            const res = formatIntegerWithCaption.apply(null, [5, ...forms]);

            expect(res).toBe('5 веток');
        });

        it('ten', () => {
            const res = formatIntegerWithCaption.apply(null, [10, ...forms]);

            expect(res).toBe('10 веток');
        });
    });

    describe('masculine', () => {
        beforeEach(() => {
            forms = ['ноготь', 'ногтя', 'ногтей'];
        });

        it('one', () => {
            const res = formatIntegerWithCaption.apply(null, [1, ...forms]);

            expect(res).toBe('1 ноготь');
        });

        it('two', () => {
            const res = formatIntegerWithCaption.apply(null, [2, ...forms]);

            expect(res).toBe('2 ногтя');
        });

        it('five', () => {
            const res = formatIntegerWithCaption.apply(null, [5, ...forms]);

            expect(res).toBe('5 ногтей');
        });

        it('ten', () => {
            const res = formatIntegerWithCaption.apply(null, [10, ...forms]);

            expect(res).toBe('10 ногтей');
        });
    });

    describe('neuter', () => {
        beforeEach(() => {
            forms = ['озеро', 'озера', 'озёр'];
        });

        it('one', () => {
            const res = formatIntegerWithCaption.apply(null, [1, ...forms]);

            expect(res).toBe('1 озеро');
        });

        it('two', () => {
            const res = formatIntegerWithCaption.apply(null, [2, ...forms]);

            expect(res).toBe('2 озера');
        });

        it('five', () => {
            const res = formatIntegerWithCaption.apply(null, [5, ...forms]);

            expect(res).toBe('5 озёр');
        });

        it('ten', () => {
            const res = formatIntegerWithCaption.apply(null, [10, ...forms]);

            expect(res).toBe('10 озёр');
        });
    });
});
