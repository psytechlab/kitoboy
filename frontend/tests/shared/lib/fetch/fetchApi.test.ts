import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {API_TOKEN_NAME} from '../../../../src/shared/consts';
import {fetchApi, fetchKitoboy} from '../../../../src/shared/lib/fetch';
import {showToastError} from '../../../../src/shared/lib/showToast';

describe('fetchApi', () => {
    vi.mock('../../../../src/shared/lib/showToast', {
        spy: true,
    });
    vi.mock('../../../../src/shared/lib/fetch', {
        spy: true,
    });

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    beforeEach(() => {
        vi.mocked(showToastError).mockImplementation(() => {});
        vi.mocked(fetchKitoboy).mockImplementation(async () => {
            return Promise.resolve({});
        });
        getItemSpy.mockReturnValue(null);
    });

    afterEach(() => {
        vi.resetAllMocks();
        getItemSpy.mockClear();
    });

    it('should check for auth token in local storage', () => {
        fetchApi({path: 'testPath'});

        expect(getItemSpy).toHaveBeenCalledWith(API_TOKEN_NAME);
    });

    it('should add auth token to headers', () => {
        getItemSpy.mockReturnValue('test token');

        fetchApi({
            path: 'testPath',
        });

        expect(fetchKitoboy).toHaveBeenCalledWith(
            'http://localhost:3052/testPath',
            expect.objectContaining({
                headers: {
                    Authorization: 'Bearer test token',
                },
            })
        );
    });

    it('should call fetchKitoboy with correct url, headers and body', () => {
        const testBody = {some: 'test'} as unknown as FormData;
        const testHeaders = {testHeader: 'testValue'};

        fetchApi({
            path: 'testPath',
            body: testBody,
            headers: testHeaders,
        });

        expect(fetchKitoboy).toHaveBeenCalledWith(
            'http://localhost:3052/testPath',
            expect.objectContaining({
                body: testBody,
                headers: testHeaders,
            })
        );
    });

    it('should call fetchKitoboy with POST method if other was not passed', () => {
        fetchApi({
            path: 'testPath',
        });

        expect(fetchKitoboy).toHaveBeenCalledWith(
            'http://localhost:3052/testPath',
            expect.objectContaining({method: 'POST'})
        );
    });

    it('should call fetchKitoboy with passed method', () => {
        fetchApi({
            path: 'testPath',
            method: 'GET',
        });

        expect(fetchKitoboy).toHaveBeenCalledWith(
            'http://localhost:3052/testPath',
            expect.objectContaining({method: 'GET'})
        );
    });
});
