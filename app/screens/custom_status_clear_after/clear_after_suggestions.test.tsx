// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallowWithIntl} from 'test/intl-test-helper';
import Preferences from '@mm-redux/constants/preferences';
import {CustomStatusDuration} from '@mm-redux/types/users';
import ClearAfterSuggestion from './clear_after_suggestions';
import {TouchableOpacity} from 'react-native';

describe('screens/clear_after_suggestions', () => {
    const baseProps = {
        theme: Preferences.THEMES.default,
        duration: CustomStatusDuration.DONT_CLEAR,
        separator: false,
        isSelected: false,
        handleSuggestionClick: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <ClearAfterSuggestion {...baseProps}/>,
        );

        expect(wrapper.dive().getElement()).toMatchSnapshot();
    });

    it('should match snapshot with separator and selected check', () => {
        const wrapper = shallowWithIntl(
            <ClearAfterSuggestion
                {...baseProps}
                separator={true}
                isSelected={true}
            />,
        );

        expect(wrapper.dive().getElement()).toMatchSnapshot();
    });

    it('should call handleSuggestionClick on clicking the suggestion', () => {
        const wrapper = shallowWithIntl(
            <ClearAfterSuggestion
                {...baseProps}
            />,
        );

        wrapper.dive().find(TouchableOpacity).simulate('press');
        expect(baseProps.handleSuggestionClick).toBeCalled();
    });
});
