// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import Preferences from '@mm-redux/constants/preferences';
import DateTimeSelector from './date_time_selector';
import { renderWithRedux } from 'test/testing_library';

describe('screens/clear_after_modal', () => {
    const baseProps = {
        theme: Preferences.THEMES.default,
        handleChange: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = renderWithRedux(
            <DateTimeSelector {...baseProps} />,
        );

        expect(wrapper.toJSON()).toMatchSnapshot();
    });
});
