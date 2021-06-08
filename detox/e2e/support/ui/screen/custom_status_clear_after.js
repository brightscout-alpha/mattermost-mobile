// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CustomStatusScreen} from '@support/ui/screen';
import moment from 'moment-timezone';

class ClearAfterScreen {
    testID = {
        clearAfterScreen: 'clear_after.screen',
        doneButton: 'clear_after.done.button',
        suggestionPrefix: 'clear_after.suggestion.',
        selectDateButton: 'clear_after.suggestion.date_and_time.button.date',
        selectTimeButton: 'clear_after.suggestion.date_and_time.button.time',
    }

    clearAfterScreen = element(by.id(this.testID.clearAfterScreen));
    doneButton = element(by.id(this.testID.doneButton));
    selectDateButton = element(by.id(this.testID.selectDateButton));
    selectTimeButton = element(by.id(this.testID.selectTimeButton));

    getClearAfterSuggestion = (duration) => {
        const suggestionID = `${this.testID.suggestionPrefix}${duration}`;
        return element(by.id(suggestionID));
    }

    toBeVisible = async () => {
        await expect(this.clearAfterScreen).toBeVisible();

        return this.clearAfterScreen;
    }

    open = async () => {
        // # Open clear after screen
        await CustomStatusScreen.tapClearAfterAction();

        return this.toBeVisible();
    }

    tapSuggestion = async (duration) => {
        await this.getClearAfterSuggestion(duration).tap();
    }

    openDatePicker = async () => {
        await this.selectDateButton.tap();
    }

    openTimePicker = async () => {
        await this.selectTimeButton.tap();
    }

    close = async () => {
        await this.doneButton.tap();
        return expect(this.clearAfterScreen).not.toBeVisible();
    }

    getExpiryText = (minutes) => {
        const currentMomentTime = moment();
        const expiryMomentTime = currentMomentTime.clone().add(minutes, 'm');
        const plusSixDaysEndTime = currentMomentTime.clone().add(6, 'days').endOf('day');
        const tomorrowEndTime = currentMomentTime.clone().add(1, 'day').endOf('day');
        const todayEndTime = currentMomentTime.clone().endOf('day');

        let useTime = true;
        let useDay = false;
        let isTomorrow = false;
        let isToday = false;
        let useDate = false;
        let format = '';

        if (expiryMomentTime.isSame(todayEndTime)) {
            isToday = true;
        }
        if (expiryMomentTime.isAfter(todayEndTime) && expiryMomentTime.isSameOrBefore(tomorrowEndTime)) {
            isTomorrow = true;
        }
        if (expiryMomentTime.isSame(todayEndTime) || expiryMomentTime.isAfter(tomorrowEndTime)) {
            useTime = false;
        }
        if (expiryMomentTime.isBetween(tomorrowEndTime, plusSixDaysEndTime)) {
            useDay = true;
        }

        const isCurrentYear = currentMomentTime.get('y') === expiryMomentTime.get('y');

        useDate = !(isToday || useTime || useDay || !isCurrentYear);

        if (useDay) {
            format = 'dddd';
        } else if (useDate) {
            format = 'MMM DD';
        } else if (!isCurrentYear) {
            format = 'MMM DD, YYYY';
        }

        const showDayorDate = (useDay || useDate || !isCurrentYear) ? expiryMomentTime.format(format) : '';
        const showTime = useTime ? expiryMomentTime.format('h:mm A') : '';
        const showTomorrow = isTomorrow ? 'Tomorrow at ' : '';
        const showToday = isToday ? 'Today' : '';

        let expiryText = '';
        expiryText += showToday;
        expiryText += showTomorrow;
        expiryText += showTime;
        expiryText += showDayorDate;
        return expiryText;
    }
}

const clearAfterScreen = new ClearAfterScreen();
export default clearAfterScreen;
