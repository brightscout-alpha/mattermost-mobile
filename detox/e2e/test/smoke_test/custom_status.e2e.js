// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ChannelScreen, CustomStatusScreen} from '@support/ui/screen';
import {
    Setup,
    System,
} from '@support/server_api';
import {SettingsSidebar} from '@support/ui/component';

describe('Custom status', () => {
    beforeAll(async () => {
        await System.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});
    });

    beforeEach(async () => {
        const {user} = await Setup.apiInit();

        // # Open channel screen
        await ChannelScreen.open(user);
    });

    afterEach(async () => {
        await ChannelScreen.logout();
    });

    const defaultCustomStatuses = ['In a meeting', 'Out for lunch', 'Out sick', 'Working from home', 'On a vacation'];
    const {
        openSettingsSidebar,
    } = ChannelScreen;

    test('MM-T3890 Setting a custom status', async () => {
        const customStatus = {
            emoji: 'calendar',
            text: 'In a meeting',
        };

        await openSettingsSidebar();
        await CustomStatusScreen.open();
        const isSuggestionPresentPromiseArray = [];
        defaultCustomStatuses.map(async (text) => {
            isSuggestionPresentPromiseArray.push(expect(element(by.text(text))).toBeVisible());
        });

        await Promise.all(isSuggestionPresentPromiseArray);

        await CustomStatusScreen.tapSuggestion(customStatus);

        await CustomStatusScreen.tapSuggestion(customStatus);

        await CustomStatusScreen.close();

        await openSettingsSidebar();
        await expect(element(by.text(customStatus.text))).toBeVisible();
        await expect(element(by.id(`custom_status.emoji.${customStatus.emoji}`))).toBeVisible();

        await CustomStatusScreen.open();
        await CustomStatusScreen.close();
    });

    test.only('MM-T3891 Setting your own custom status', async () => {
        const customStatus = {
            emoji: '😀',
            emojiName: 'grinning',
            text: 'Watering plants',
        };

        await openSettingsSidebar();
        await CustomStatusScreen.open();

        await CustomStatusScreen.input.typeText(customStatus.text);
        await expect(CustomStatusScreen.getCustomStatusSelectedEmoji('speech_balloon')).toBeVisible();
        await CustomStatusScreen.getCustomStatusSelectedEmoji('speech_balloon').multiTap(2);

        await expect(element(by.id('add_reaction.screen'))).toBeVisible();

        await expect(element(by.text(customStatus.emoji))).toBeVisible();
        await element(by.text(customStatus.emoji)).tap();

        await expect(element(by.id('add_reaction.screen'))).not.toBeVisible();
        await expect(CustomStatusScreen.getCustomStatusSelectedEmoji(customStatus.emojiName)).toBeVisible();

        await CustomStatusScreen.close();

        await openSettingsSidebar();
        await expect(element(by.text(customStatus.text).withAncestor(by.id(SettingsSidebar.testID.customStatusAction)))).toBeVisible();
        await expect(element(by.id(`custom_status.emoji.${customStatus.emojiName}`))).toBeVisible();

        await SettingsSidebar.customStatusClearButton.tap();
        await expect(element(by.text(customStatus.text).withAncestor(by.id(SettingsSidebar.testID.customStatusAction)))).not.toBeVisible();
    });
});
