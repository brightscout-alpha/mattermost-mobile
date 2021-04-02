// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {UserCustomStatus} from '@mm-redux/types/users';
import {ActionFunc, DispatchFunc, batchActions} from '@mm-redux/types/actions';
import {bindClientFunc} from '@mm-redux/actions/helpers';
import {Client4} from '@mm-redux/client';
import {UserTypes} from '@mm-redux/action_types';
import {logError} from '@mm-redux/actions/errors';

export function setCustomStatus(customStatus: UserCustomStatus): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({type: UserTypes.SET_CUSTOM_STATUS_REQUEST});

        try {
            await Client4.updateCustomStatus(customStatus);
        } catch (error) {
            dispatch(batchActions([
                {type: UserTypes.SET_CUSTOM_STATUS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch({type: UserTypes.SET_CUSTOM_STATUS_SUCCESS});
        return {data: true};
    };
}

export function unsetCustomStatus(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({type: UserTypes.UNSET_CUSTOM_STATUS_REQUEST});

        try {
            await Client4.unsetCustomStatus();
        } catch (error) {
            dispatch(batchActions([
                {type: UserTypes.UNSET_CUSTOM_STATUS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch({type: UserTypes.UNSET_CUSTOM_STATUS_SUCCESS});
        return {data: true};
    };
}

export function removeRecentCustomStatus(customStatus: UserCustomStatus): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.removeRecentCustomStatus,
        params: [
            customStatus,
        ],
    });
}

export default {
    setCustomStatus,
    unsetCustomStatus,
    removeRecentCustomStatus,
};
