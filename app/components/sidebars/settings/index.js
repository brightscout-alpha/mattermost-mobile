// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {unsetCustomStatus} from '@actions/views/custom_status';
import {setStatus} from '@mm-redux/actions/users';
import {getTheme} from '@mm-redux/selectors/entities/preferences';
import {getCurrentUser, getStatusForUserId} from '@mm-redux/selectors/entities/users';
import {isCustomStatusEnabled, getCustomStatus} from '@selectors/custom_status';

import {logout} from 'app/actions/views/user';

import SettingsSidebar from './settings_sidebar';
import {getCurrentUserTimezone} from '@mm-redux/selectors/entities/timezone';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state) || {};
    const status = getStatusForUserId(state, currentUser.id);
    const userTimezone = getCurrentUserTimezone(state);

    const customStatusEnabled = isCustomStatusEnabled(state);
    const customStatus = customStatusEnabled ? getCustomStatus(state) : undefined;
    return {
        userTimezone,
        currentUser,
        locale: currentUser?.locale,
        status,
        theme: getTheme(state),
        isCustomStatusEnabled: customStatusEnabled,
        customStatus,
        setStatusRequestStatus: state.requests.users?.setCustomStatus?.status,
        clearStatusRequestStatus: state.requests.users?.clearCustomStatus?.status,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            logout,
            setStatus,
            unsetCustomStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(SettingsSidebar);
