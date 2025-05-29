import {useMemo} from 'react';

import {Attribute} from 'src/entities/attribute';
import {AvatarView} from 'src/entities/avatarView';
import {Post} from 'src/entities/post';

/**
 * Хук, собиращий все уникальные Атрибуты со всех Постов Аватара
 *
 * @param avatar
 */
export const useAvatarAttributes = (avatar: AvatarView): Attribute[] => {
    return useMemo(() => {
        return avatar?.posts?.reduce(
            (avatarAttributes: Attribute[], post: Post) => {
                post.attributes?.forEach((postAttribute: Attribute) => {
                    const attributeAlreadyAdded = avatarAttributes.some(
                        (avatarAttribute: Attribute) => {
                            return avatarAttribute.id === postAttribute.id;
                        }
                    );

                    if (!attributeAlreadyAdded) {
                        avatarAttributes.push(postAttribute);
                    }
                });

                return avatarAttributes;
            },
            []
        );
    }, [avatar]);
};
