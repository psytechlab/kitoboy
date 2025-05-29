import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {fetchKitoboy} from '../../../../src/shared/lib/fetch';
import {processError, processResponse} from '../../../../src/shared/lib/fetch/requests';
import {ExtendedError} from '../../../../src/shared/lib/fetch/types';

describe('fetchKitoboy', () => {
    vi.mock('../../../../src/shared/lib/fetch/requests', {
        spy: true,
    });

    const fetchMockFn = vi.fn();
    let originalFetch = global.fetch;

    beforeEach(() => {
        vi.mocked(processResponse).mockImplementation(
            async () => 'test processed response'
        );
        vi.mocked(processError).mockImplementation(
            () => new Error('test processed error') as ExtendedError
        );

        fetchMockFn.mockImplementation(async () => {
            return Promise.resolve({
                ok: true,
            });
        });
        originalFetch = global.fetch;
        global.fetch = fetchMockFn;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.resetAllMocks();
    });

    it('should fetch passed url', async () => {
        await fetchKitoboy('testPath');

        expect(fetchMockFn).toHaveBeenCalledWith('testPath');
    });

    it('should call processResponse with fetch response', async () => {
        await fetchKitoboy('testPath');

        expect(processResponse).toHaveBeenCalled();
    });

    it('should return parsed response if response status is successful', async () => {
        const result = await fetchKitoboy('testPath');

        expect(result).toBe('test processed response');
    });

    it('should throw Error if response status is not successful', async () => {
        fetchMockFn.mockImplementation(async () => {
            return Promise.resolve({
                ok: false,
            });
        });

        await expect(fetchKitoboy('testPath')).rejects.toThrow(
            'test processed error'
        );
    });
});
