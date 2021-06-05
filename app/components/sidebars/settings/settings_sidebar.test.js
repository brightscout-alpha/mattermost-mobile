// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallowWithIntl} from 'test/intl-test-helper';

import Preferences from '@mm-redux/constants/preferences';

import SettingsSidebar from './settings_sidebar.ios';
import {CustomStatusDuration} from '@mm-redux/types/users';

describe('SettingsSidebar', () => {
    const customStatus = {
        emoji: 'calendar',
        text: 'In a meeting',
        duration: CustomStatusDuration.DONT_CLEAR,
    };

    const baseProps = {
        actions: {
            logout: jest.fn(),
            setStatus: jest.fn(),
            unsetCustomStatus: jest.fn(),
        },
        currentUser: {
            id: 'user-id',
        },
        status: 'offline',
        theme: Preferences.THEMES.default,
        isCustomStatusEnabled: false,
        isCustomStatusExpired: false,
        customStatus,
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <SettingsSidebar {...baseProps}/>,
        );

        expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should match snapshot with custom status enabled', () => {
        const wrapper = shallowWithIntl(
            <SettingsSidebar
                {...baseProps}
                isCustomStatusEnabled={true}
            />,
        );

        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
