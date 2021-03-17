// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {SettingsSidebar} from '@support/ui/component';

class UserProfileScreen {
    testID = {
        userProfileScreen: 'user_profile.screen',
        customStatus: 'user_profile.custom_status',
        profilePicture: 'user_profile.profile_picture',
        closeUserProfileButton: 'close.settings.button',
    }

    userProfileScreen = element(by.id(this.testID.userProfileScreen));
    customStatus = element(by.id(this.testID.customStatus));
    profilePicture = element(by.id(this.testID.profilePicture))
    closeUserProfileButton = element(by.id(this.testID.closeUserProfileButton))

    toBeVisible = async () => {
        await expect(this.userProfileScreen).toBeVisible();

        return this.userProfileScreen;
    }

    open = async () => {
        // # Open custom status screen
        await SettingsSidebar.userInfoAction.tap();

        return this.toBeVisible();
    }

    close = async () => {
        await this.closeUserProfileButton.tap();
        return expect(this.userProfileScreen).not.toBeVisible();
    }
}

const userProfileScreen = new UserProfileScreen();
export default userProfileScreen;
