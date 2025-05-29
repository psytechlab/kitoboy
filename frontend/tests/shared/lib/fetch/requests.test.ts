import {afterEach, describe, expect, it, vi} from 'vitest';

import {
    processError,
    processResponse,
} from '../../../../src/shared/lib/fetch/requests';

describe('requests', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('processResponse', () => {
        const getHeaderFnMock = vi.fn();
        const jsonFnMock = vi.fn();
        const textFnMock = vi.fn();
        const response = {
            headers: {
                get: getHeaderFnMock,
            },
            json: jsonFnMock,
            text: textFnMock,
        };

        it('should check if response contains json header', () => {
            processResponse(response as unknown as Response);

            expect(getHeaderFnMock).toHaveBeenCalledWith('Content-Type');
        });

        it('should call json method if request contains json header', () => {
            getHeaderFnMock.mockReturnValue(['application/json']);

            processResponse(response as unknown as Response);

            expect(jsonFnMock).toHaveBeenCalled();
            expect(textFnMock).not.toHaveBeenCalled();
        });

        it('should call text method if request does not contain json header', () => {
            getHeaderFnMock.mockReturnValue([]);

            processResponse(response as unknown as Response);

            expect(textFnMock).toHaveBeenCalled();
            expect(jsonFnMock).not.toHaveBeenCalled();
        });
    });

    describe('processError', () => {
        const response = {
            status: 404,
            statusText: undefined,
        };

        it('should return constructed Error', () => {
            const result = processError(
                response as unknown as Response,
                'parsed text',
                ''
            );

            expect(result instanceof Error).toBe(true);
        });

        it('should return Error with get method when http method was not passed', () => {
            const result = processError(
                response as unknown as Response,
                'parsed text',
                ''
            );

            expect(result.httpMethod).toBe('get');
        });

        it('should return Error with passed http method', () => {
            const result = processError(
                response as unknown as Response,
                'parsed text',
                '',
                {
                    method: 'post',
                }
            );

            expect(result.httpMethod).toBe('post');
        });

        it('should return Error with default statusText if other was not passed', () => {
            response.statusText = undefined;
            const result = processError(
                response as unknown as Response,
                'parsed text',
                ''
            );

            expect(result.statusText).toBe('No response');
        });

        it('should return Error with passed statusText', () => {
            response.statusText = 'test status text';
            const result = processError(
                response as unknown as Response,
                'parsed text',
                ''
            );

            expect(result.statusText).toBe('test status text');
        });

        it('should return Error with passed status', () => {
            response.statusText = 'test status text';
            const result = processError(
                response as unknown as Response,
                'parsed text',
                ''
            );

            expect(result.status).toBe(404);
        });

        it('should return Error with passed data string', () => {
            response.statusText = 'test status text';
            const result = processError(
                response as unknown as Response,
                'parsed text',
                ''
            );

            expect(result.data).toBe('parsed text');
        });

        it('should return Error with passed data object', () => {
            response.statusText = 'test status text';
            const result = processError(
                response as unknown as Response,
                {message: 'parsed text'},
                ''
            );

            expect(result.data).toEqual({message: 'parsed text'});
        });
    });
});
