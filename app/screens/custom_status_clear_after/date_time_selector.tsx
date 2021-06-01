// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {View, Button, Platform} from 'react-native';
import DateTimePicker from 'react-native-date-picker';
import {useSelector} from 'react-redux';
import {GlobalState} from '@mm-redux/types/store';
import {getCurrentUserTimezone, isTimezoneEnabled} from '@mm-redux/selectors/entities/timezone';
import {getCurrentDateAndTimeForTimezone} from '@utils/timezone';
import {getBool} from '@mm-redux/selectors/entities/preferences';
import Preferences from '@mm-redux/constants/preferences';
import {Theme} from '@mm-redux/types/preferences';
import {makeStyleSheetFromTheme} from '@utils/theme';
import moment from 'moment';
import {Moment} from 'moment-timezone';

type Props = {
    theme: Theme;
    handleChange: (currentDate: Moment) => void;
}

enum SelectorMode {
    DATE = 'date',
    TIME = 'time',
    DATE_TIME = 'datetime',
}

const DateTimeSelector = (props: Props) => {
    const {theme} = props;
    const styles = getStyleSheet(theme);
    const enableTimezone = useSelector((state: GlobalState) => isTimezoneEnabled(state));
    const militaryTime = useSelector((state: GlobalState) => getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time'));
    const timezone = useSelector((state: GlobalState) => getCurrentUserTimezone(state));
    let currentTime = moment();
    if (enableTimezone && timezone) {
        currentTime = getCurrentDateAndTimeForTimezone(timezone);
    }
    const [date, setDate] = useState<Moment>(currentTime);
    const [mode, setMode] = useState<SelectorMode>(SelectorMode.DATE);
    const [show, setShow] = useState<boolean>(false);

    const onChange = (selectedDate: Date) => {
        const currentDate = selectedDate || date;
        setDate(moment(currentDate));
        props.handleChange(moment(currentDate));
    };

    const showDatepicker = () => {
        setShow(true);
        setMode(SelectorMode.DATE);
    };

    const showTimepicker = () => {
        setShow(true);
        setMode(SelectorMode.TIME);
    };

    const renderDatePicker = show && mode === SelectorMode.DATE && (
        <DateTimePicker
            testID='dateTimePicker'
            date={date.toDate()}
            mode={mode}
            androidVariant={Platform.OS === 'ios' ? 'iosClone' : 'nativeAndroid'}
            onDateChange={onChange}
            minimumDate={currentTime.toDate()}
            timeZoneOffsetInMinutes={-60 * 8}
        />
    );

    const renderTimePicker = show && mode === SelectorMode.TIME && (
        <DateTimePicker
            testID='dateTimePicker'
            date={moment(date).toDate()}
            mode={mode}
            androidVariant={Platform.OS === 'ios' ? 'iosClone' : 'nativeAndroid'}
            is24hourSource={'locale'}
            locale={militaryTime ? 'fr' : 'en'}
            onDateChange={onChange}
            minimumDate={currentTime.toDate()}
            timeZoneOffsetInMinutes={-60 * 8}
        />
    );

    return (
        <View
            style={{
                backgroundColor: theme.centerChannelBg,
                alignItems: 'center',
                paddingBottom: 10,
            }}
        >
            <View style={styles.container}>
                <View style={styles.datePicker}>
                    <Button
                        onPress={showDatepicker}
                        title='Select Date'
                        color={theme.buttonBg}
                    />
                </View>
                <View>
                    <Button
                        onPress={showTimepicker}
                        title='Select Time'
                        color={theme.buttonBg}
                    />
                </View>

            </View>
            {renderDatePicker}
            {renderTimePicker}
        </View>
    );
};

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        datePicker: {
            marginRight: 10,
        },

    };
});
export default DateTimeSelector;
