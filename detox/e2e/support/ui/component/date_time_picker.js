// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

class DateTimePicker {
    changeMinuteValue = async (minute) => {
        const keyboardIconButton = element(
            by.type('androidx.appcompat.widget.AppCompatImageButton'),
        );

        await keyboardIconButton.tap();

        const minuteTextinput = element(
            by.type('androidx.appcompat.widget.AppCompatEditText'),
        ).atIndex(1);

        await minuteTextinput.replaceText(minute);
    }

    changeHourValue = async (hour) => {
        const keyboardIconButton = element(
            by.type('androidx.appcompat.widget.AppCompatImageButton'),
        );

        await keyboardIconButton.tap();

        const hourTextinput = element(
            by.type('androidx.appcompat.widget.AppCompatEditText'),
        ).atIndex(0);

        await hourTextinput.replaceText(hour);
    }

    tapCancelButtonAndroid = async () => {
        await element(by.text('Cancel')).tap();
    }

    tapOkButtonAndroid = async () => {
        await element(by.text('OK')).tap();
    }
}

const dateTimePicker = new DateTimePicker();
export default dateTimePicker;
