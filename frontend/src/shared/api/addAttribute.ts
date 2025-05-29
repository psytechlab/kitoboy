import {fetchApi} from 'src/shared/lib/fetch';

/**
 * Добавляет один (существующий в системе) Атрибут отдельному Посту
 *
 * @param postId
 * @param attributeId
 */
export const addAttribute = async (postId: string, attributeId: string) => {
    return fetchApi({
        path: `add-attribute/${postId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({attributeId}),
    });
};
