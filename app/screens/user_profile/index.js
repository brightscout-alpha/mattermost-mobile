// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {setChannelDisplayName} from '@actions/views/channel';
import {makeDirectChannel} from '@actions/views/more_dms';
import {getConfig} from '@mm-redux/selectors/entities/general';
import {getTeammateNameDisplaySetting, getTheme, getBool} from '@mm-redux/selectors/entities/preferences';
import {getCurrentUserTimezone, isTimezoneEnabled} from '@mm-redux/selectors/entities/timezone';
import Preferences from '@mm-redux/constants/preferences';
import {loadBot} from '@mm-redux/actions/bots';
import {getBotAccounts} from '@mm-redux/selectors/entities/bots';
import {getCurrentUserId} from '@mm-redux/selectors/entities/users';
import {getCustomStatus} from '@selectors/custom_status';
import {unsetCustomStatus} from '@actions/views/custom_status';

import UserProfile from './user_profile';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const {createChannel: createChannelRequest} = state.requests.channels;
    const militaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time');
    const enableTimezone = isTimezoneEnabled(state);
    const userTimezone = getCurrentUserTimezone(state);

    return {
        userTimezone,
        config,
        createChannelRequest,
        currentDisplayName: state.views.channel.displayName,
        user: state.entities.users.profiles[ownProps.userId],
        bot: getBotAccounts(state)[ownProps.userId],
        teammateNameDisplay: getTeammateNameDisplaySetting(state),
        enableTimezone,
        militaryTime,
        theme: getTheme(state),
        isMyUser: getCurrentUserId(state) === ownProps.userId,
        customStatus: getCustomStatus(state, ownProps.userId) || {},
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            makeDirectChannel,
            setChannelDisplayName,
            loadBot,
            unsetCustomStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
