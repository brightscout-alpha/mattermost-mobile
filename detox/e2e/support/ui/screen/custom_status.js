// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {SettingsSidebar} from '@support/ui/component';

class CustomStatusScreen {
    testID = {
        customStatusScreen: 'custom_status.screen',
        input: 'custom_status.input',
        selectedEmojiPrefix: 'custom_status.emoji.',
        clearInputButton: 'custom_status.clear_input',
        doneButton: 'custom_status.done_button',
    }

    customStatusScreen = element(by.id(this.testID.customStatusScreen));
    input = element(by.id(this.testID.input));
    clearInputButton = element(by.id(this.testID.clearInputButton))
    doneButton = element(by.id(this.testID.doneButton))

    getCustomStatusSelectedEmoji = (emoji) => {
        const emojiTestID = `${this.testID.selectedEmojiPrefix}${emoji}`;
        return element(by.id(emojiTestID));
    }

    toBeVisible = async () => {
        await expect(this.customStatusScreen).toBeVisible();

        return this.customStatusScreen;
    }

    open = async () => {
        // # Open custom status screen
        await SettingsSidebar.tapCustomStatusAction();

        return this.toBeVisible();
    }

    tapSuggestion = async ({emoji, text}) => {
        await element(by.text(text).withAncestor(by.id('custom_status.suggestions'))).tap();

        await expect(this.input).toHaveText(text);
        await expect(this.getCustomStatusSelectedEmoji(emoji)).toBeVisible();
    }

    close = async () => {
        await this.doneButton.tap();
        return expect(this.customStatusScreen).not.toBeVisible();
    }
}

const customStatusScreen = new CustomStatusScreen();
export default customStatusScreen;
