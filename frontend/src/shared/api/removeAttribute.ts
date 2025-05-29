import {fetchApi} from 'src/shared/lib/fetch';

/**
 * Удаляет отдельный Атрибут Поста
 *
 * @param postId
 * @param attributeId
 */
export const removeAttribute = async (postId: string, attributeId: string) => {
    return fetchApi({
        path: `remove-attribute/${postId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({attributeId}),
    });
};
