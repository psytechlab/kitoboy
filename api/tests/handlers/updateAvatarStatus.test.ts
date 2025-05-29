import {Request, Response} from 'express';

import {AvatarRepository, initEmptyModels} from '../../src/db';
import {updateAvatarStatusHandler} from '../../src/handlers';
import {AVATAR_MOCK} from '../../src/entities/mocks/avatar.mock';
import {AvatarInstance} from '../../src/db/tables/avatar';

describe('updateAvatarStatusHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let updateAvatarMock = jest.spyOn(AvatarRepository, 'update');

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        } as Request;
        updateAvatarMock.mockResolvedValue([
            1,
            // @ts-ignore
            [AVATAR_MOCK as AvatarInstance],
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if avatarId was not passed', async () => {
            req.body.statusId = 'statusId';

            await updateAvatarStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if statusId was not passed', async () => {
            req.params.avatarId = 'avatarId';

            await updateAvatarStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req.body.statusId = 'statusId';
            req.params.avatarId = 'avatarId';
        });

        it('should update Avatar with passed id by passed statusId', async () => {
            await updateAvatarStatusHandler(req, res);

            expect(updateAvatarMock).toHaveBeenCalledWith(
                {statusId: 'statusId'},
                {
                    where: {
                        id: 'avatarId',
                    },
                    returning: true,
                }
            );
        });

        it('should return 500 if update failed', async () => {
            updateAvatarMock.mockImplementation(() => {
                return Promise.reject();
            });

            await updateAvatarStatusHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Error while updating avatar status',
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return 400 if Avatar with passed Id was not found', async () => {
            // @ts-ignore
            updateAvatarMock.mockResolvedValue([0, []]);

            await updateAvatarStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Error while updating avatar status',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return updated Avatar with status 200', async () => {
            await updateAvatarStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith(AVATAR_MOCK);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
