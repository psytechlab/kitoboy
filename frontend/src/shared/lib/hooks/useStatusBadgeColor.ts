import {useMemo} from 'react';

import {UserSuicideStatus} from 'src/entities/status';

/**
 * Хук, определяющий цвет для бейджа статуса Персоны или Аватара
 *
 * @param statusId
 */
export const useStatusBadgeColor = (statusId?: UserSuicideStatus) => {
    return useMemo(() => {
        if (!statusId) {
            return 'grey';
        }

        switch (statusId) {
            case UserSuicideStatus.SUICIDE:
                return 'red';
            case UserSuicideStatus.ANTI_SUICIDE:
                return 'teal';
            default:
                return 'purple';
        }
    }, [statusId]);
};
