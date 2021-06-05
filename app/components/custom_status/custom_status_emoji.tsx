// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Text, TextStyle} from 'react-native';
import {useSelector} from 'react-redux';

import Emoji from '@components/emoji';
import {GlobalState} from '@mm-redux/types/store';
import {makeGetCustomStatus, isCustomStatusExpired} from '@selectors/custom_status';

interface ComponentProps {
    emojiSize?: number;
    userID?: string;
    style?: TextStyle;
    testID?: string;
}

const CustomStatusEmoji = ({emojiSize, userID, style, testID}: ComponentProps) => {
    const getCustomStatus = makeGetCustomStatus();
    const customStatus = useSelector((state: GlobalState) => getCustomStatus(state, userID));
    const customStatusExpired = useSelector((state: GlobalState) => isCustomStatusExpired(state, customStatus));

    if (!customStatus?.emoji || customStatusExpired) {
        return null;
    }

    const testIdPrefix = testID ? `${testID}.` : '';
    return (
        customStatus ? (
            <Text
                style={style}
                testID={`${testIdPrefix}custom_status_emoji.${customStatus.emoji}`}
            >
                <Emoji
                    size={emojiSize}
                    emojiName={customStatus.emoji}
                />
            </Text>
        ) : null
    );
};

CustomStatusEmoji.defaultProps = {
    emojiSize: 16,
};

export default CustomStatusEmoji;
