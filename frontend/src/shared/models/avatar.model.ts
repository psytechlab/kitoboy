import {createEffect, createEvent, createStore, sample} from 'effector';

import {Attribute} from 'src/entities/attribute';
import {AvatarView} from 'src/entities/avatarView';
import {
    addAttribute as fetchAddAttribute,
    getAttributes,
    getAvatarById,
    removeAttribute as fetchRemoveAttribute,
} from 'src/shared/api';
import {SearchInputOption} from 'src/shared/components/SearchInput/ui/SearchInput';
import {showToastMessage} from 'src/shared/lib/showToast';
import {PostView} from 'src/entities/postView';

export type PostAttributeActionData = {
    postId: string;
    attributeId: string;
};

export const $avatar = createStore<AvatarView | null>(null);

export const $filteredPosts = createStore<PostView[] | null>(null);

export const $attributeSearchOptions = createStore<SearchInputOption[]>([]);

export const getAvatar = createEvent<string>();

export const filterPostsByAttributes = createEvent<string[]>();

export const loadAttributes = createEvent();

export const addAttribute = createEvent<PostAttributeActionData>();

export const removeAttribute = createEvent<PostAttributeActionData>();

export const getAvatarFx = createEffect(getAvatarById);

export const loadAttributesFx = createEffect(async () => {
    return getAttributes();
});

export const addAttributeFx = createEffect(
    async ({postId, attributeId}: PostAttributeActionData) => {
        return fetchAddAttribute(postId, attributeId);
    }
);

export const removeAttributeFx = createEffect(
    async ({postId, attributeId}: PostAttributeActionData) => {
        return fetchRemoveAttribute(postId, attributeId);
    }
);

sample({
    clock: getAvatar,
    target: getAvatarFx,
});

sample({
    clock: getAvatarFx.doneData,
    target: $avatar,
});

sample({
    clock: getAvatarFx.doneData,
    fn: (avatar: AvatarView) => avatar.posts,
    target: $filteredPosts,
});

sample({
    clock: loadAttributes,
    target: loadAttributesFx,
});

sample({
    clock: loadAttributesFx.doneData,
    fn: ({attributes}: {attributes: Attribute[]}) =>
        attributes.map(({id, name, color}) => ({id, label: name, color})),
    target: $attributeSearchOptions,
});

sample({
    clock: addAttribute,
    target: addAttributeFx,
});

sample({
    clock: removeAttribute,
    target: removeAttributeFx,
});

sample({
    clock: addAttributeFx.doneData,
    source: $avatar,
    filter: (avatar: AvatarView | null) => !!avatar,
    fn: ({id}: AvatarView) => {
        showToastMessage('Атрибут добавлен', 'success');

        return id;
    },
    target: getAvatar,
});

sample({
    clock: removeAttributeFx.doneData,
    source: $avatar,
    filter: (avatar: AvatarView | null) => !!avatar,
    fn: ({id}: AvatarView) => {
        showToastMessage('Атрибут удалён', 'success');

        return id;
    },
    target: getAvatar,
});

sample({
    clock: filterPostsByAttributes,
    source: $avatar,
    filter: (avatar: AvatarView | null) => !!avatar,
    fn: ({posts}: AvatarView, attributesFilterValue: string[]) => {
        if (!attributesFilterValue?.length) {
            return posts;
        }

        return posts?.filter((post: PostView) => {
            const intersection =
                post?.attributes?.filter((x: Attribute) =>
                    (attributesFilterValue || []).includes(x.id)
                ) || [];

            return intersection.length > 0;
        });
    },
    target: $filteredPosts,
});

/**
 * Модель для хранения данных об Аватаре, его Постах и Атрибутах его Постов
 */
export const avatarModel = {
    stores: {
        $attributeSearchOptions,
        $avatar,
        $filteredPosts,
    },
    events: {
        addAttribute,
        filterPostsByAttributes,
        getAvatar,
        loadAttributes,
        removeAttribute,
    },
};
