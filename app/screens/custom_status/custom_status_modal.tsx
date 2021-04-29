// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, NavigationComponent, NavigationComponentProps, OptionsTopBarButton, Options } from 'react-native-navigation';

import StatusBar from '@components/status_bar';
import { t } from '@utils/i18n';
import { CustomStatusDuration, ExpiryMenuItems, UserCustomStatus, UserTimezone } from '@mm-redux/types/users';
import Emoji from '@components/emoji';
import CompassIcon from '@components/compass_icon';
import { changeOpacity, getKeyboardAppearanceFromTheme, makeStyleSheetFromTheme } from '@utils/theme';
import { Theme } from '@mm-redux/types/preferences';
import { CustomStatus, DeviceTypes } from '@constants';
import CustomStatusSuggestion from '@screens/custom_status/custom_status_suggestion';
import { dismissModal, showModal, mergeNavigationOptions } from '@actions/navigation';
import ClearButton from '@components/custom_status/clear_button';
import { preventDoubleTap } from '@utils/tap';
import { getCurrentDateAndTimeForTimezone } from '@utils/timezone';
import moment from 'moment';

type DefaultUserCustomStatus = {
    emoji: string;
    message: string;
    messageDefault: string;
    durationDefault: string;
};

const defaultCustomStatusSuggestions: DefaultUserCustomStatus[] = [
    { emoji: 'calendar', message: t('custom_status.suggestions.in_a_meeting'), messageDefault: 'In a meeting', durationDefault: CustomStatusDuration.ONE_HOUR },
    { emoji: 'hamburger', message: t('custom_status.suggestions.out_for_lunch'), messageDefault: 'Out for lunch', durationDefault: CustomStatusDuration.THIRTY_MINUTES },
    { emoji: 'sneezing_face', message: t('custom_status.suggestions.out_sick'), messageDefault: 'Out sick', durationDefault: CustomStatusDuration.TODAY },
    { emoji: 'house', message: t('custom_status.suggestions.working_from_home'), messageDefault: 'Working from home', durationDefault: CustomStatusDuration.TODAY },
    { emoji: 'palm_tree', message: t('custom_status.suggestions.on_a_vacation'), messageDefault: 'On a vacation', durationDefault: CustomStatusDuration.THIS_WEEK },
];

interface Props extends NavigationComponentProps {
    intl: typeof intlShape;
    theme: Theme;
    customStatus: UserCustomStatus;
    userTimezone: UserTimezone;
    recentCustomStatuses: UserCustomStatus[];
    isLandscape: boolean;
    actions: {
        setCustomStatus: (customStatus: UserCustomStatus) => void;
        unsetCustomStatus: () => void;
        removeRecentCustomStatus: (customStatus: UserCustomStatus) => void;
    };
}

type State = {
    emoji: string;
    text: string;
    duration: string;
    expires_at: Date;
}

class CustomStatusModal extends NavigationComponent<Props, State> {
    rightButton: OptionsTopBarButton = {
        id: 'update-custom-status',
        testID: 'custom_status.done.button',
        enabled: true,
        showAsAction: 'always',
    };

    static options(): Options {
        return {
            topBar: {
                title: {
                    alignment: 'center',
                },
            },
        };
    }

    constructor(props: Props) {
        super(props);
        const { customStatus, userTimezone } = props;

        this.rightButton.text = props.intl.formatMessage({ id: 'mobile.custom_status.modal_confirm', defaultMessage: 'Done' });
        this.rightButton.color = props.theme.sidebarHeaderTextColor;

        const options: Options = {
            topBar: {
                rightButtons: [this.rightButton],
            },
        };
        mergeNavigationOptions(props.componentId, options);

        let currentTime = new Date();
        let timezone: string | undefined;
        timezone = userTimezone.manualTimezone;
        if (userTimezone.useAutomaticTimezone) {
            timezone = userTimezone.automaticTimezone;
        }
        currentTime = getCurrentDateAndTimeForTimezone(timezone);

        let initialCustomExpiryTime: Date = currentTime;

        const isCurrentCustomStatusSet = customStatus.text || customStatus.emoji;
        if (isCurrentCustomStatusSet && customStatus.duration === CustomStatusDuration.DATE_AND_TIME) {
            initialCustomExpiryTime = new Date(customStatus.expires_at);
        }

        this.state = {
            emoji: props.customStatus.emoji || '',
            text: props.customStatus.text || '',
            duration: props.customStatus.duration || CustomStatusDuration.DONT_CLEAR,
            expires_at: initialCustomExpiryTime,
        };
    }

    componentDidMount() {
        Navigation.events().bindComponent(this);
    }

    navigationButtonPressed() {
        this.handleSetStatus();
    }

    handleSetStatus = () => {
        const { emoji, text, duration, expires_at } = this.state;
        const isStatusSet = emoji || text;
        const { customStatus } = this.props;
        if (isStatusSet) {
            const isStatusSame = customStatus.emoji === emoji && customStatus.text === text && customStatus.expires_at === expires_at.toISOString();
            if (!isStatusSame) {
                const status = {
                    emoji: emoji || 'speech_balloon',
                    text: text.trim(),
                    duration,
                    expires_at: this.calculateExpiryTime(duration),
                };
                this.props.actions.setCustomStatus(status);
            }
        } else if (customStatus && customStatus.emoji) {
            this.props.actions.unsetCustomStatus();
        }
        Keyboard.dismiss();
        dismissModal();
    };

    calculateExpiryTime = (duration: string): string => {
        const { expires_at } = this.state;
        switch (duration) {
            case CustomStatusDuration.DONT_CLEAR:
                return '';
            case CustomStatusDuration.THIRTY_MINUTES:
                return moment().add(30, 'minutes').seconds(0).milliseconds(0).toISOString();
            case CustomStatusDuration.ONE_HOUR:
                return moment().add(1, 'hour').seconds(0).milliseconds(0).toISOString();
            case CustomStatusDuration.FOUR_HOURS:
                return moment().add(4, 'hours').seconds(0).milliseconds(0).toISOString();
            case CustomStatusDuration.TODAY:
                return moment().endOf('day').toISOString();
            case CustomStatusDuration.THIS_WEEK:
                return moment().endOf('week').toISOString();
            case CustomStatusDuration.DATE_AND_TIME:
                return expires_at.toISOString();
            default:
                return '';
        }
    };

    handleTextChange = (value: string) => this.setState({ text: value });

    handleRecentCustomStatusClear = (status: UserCustomStatus) => this.props.actions.removeRecentCustomStatus(status);

    clearHandle = () => {
        this.setState({ emoji: '', text: '', duration: CustomStatusDuration.DONT_CLEAR });
    };

    handleCustomStatusSuggestionClick = (status: { emoji: string, text: string, duration: string }) => {
        const { emoji, text, duration } = status;
        this.setState({ emoji, text, duration });
    };

    handleRecentCustomStatusSuggestionClick = (status: { emoji: string, text: string, duration: string }) => {
        const { emoji, text, duration } = status;
        this.setState({ emoji, text, duration });
        if (duration === CustomStatusDuration.DATE_AND_TIME)
            this.openClearAfterModal();
    };

    renderRecentCustomStatuses = () => {
        const { recentCustomStatuses, theme } = this.props;
        const style = getStyleSheet(theme);
        const recentStatuses = recentCustomStatuses.map((status: UserCustomStatus, index: number) => {
            return (
                <CustomStatusSuggestion
                    key={status.text}
                    handleSuggestionClick={this.handleRecentCustomStatusSuggestionClick}
                    handleClear={this.handleRecentCustomStatusClear}
                    emoji={status.emoji}
                    text={status.text}
                    theme={theme}
                    separator={index !== recentCustomStatuses.length - 1}
                    duration={status.duration}
                    expires_at={status.expires_at}
                />
            );
        });

        if (recentStatuses.length <= 0) {
            return null;
        }

        return (
            <>
                <View style={style.separator} />
                <View testID='custom_status.recents'>
                    <Text style={style.title}>
                        {this.props.intl.formatMessage({
                            id: 'custom_status.suggestions.recent_title',
                            defaultMessage: 'RECENT',
                        })}
                    </Text>
                    <View style={style.block}>
                        {recentStatuses}
                    </View>
                </View >
            </>
        );
    };

    renderCustomStatusSuggestions = () => {
        const { recentCustomStatuses, theme } = this.props;
        const style = getStyleSheet(theme);
        const recentCustomStatusTexts = recentCustomStatuses.map((status: UserCustomStatus) => status.text);
        const customStatusSuggestions = defaultCustomStatusSuggestions.
            map((status) => ({
                emoji: status.emoji,
                text: status.messageDefault,
                duration: status.durationDefault,
            })).
            filter((status: UserCustomStatus) => !recentCustomStatusTexts.includes(status.text)).
            map((status: UserCustomStatus, index: number, arr: UserCustomStatus[]) => (
                <CustomStatusSuggestion
                    key={status.text}
                    handleSuggestionClick={this.handleCustomStatusSuggestionClick}
                    emoji={status.emoji}
                    text={status.text}
                    theme={theme}
                    separator={index !== arr.length - 1}
                    duration={status.duration}
                />
            ));

        if (customStatusSuggestions.length <= 0) {
            return null;
        }

        return (
            <>
                <View style={style.separator} />
                <View testID='custom_status.suggestions'>
                    <Text style={style.title}>
                        {this.props.intl.formatMessage({
                            id: 'custom_status.suggestions.title',
                            defaultMessage: 'SUGGESTIONS',
                        })}
                    </Text>
                    <View style={style.block}>
                        {customStatusSuggestions}
                    </View>
                </View>
            </>
        );
    };

    openEmojiPicker = () => {
        const { theme, intl } = this.props;
        CompassIcon.getImageSource('close', 24, theme.sidebarHeaderTextColor).then((source) => {
            const screen = 'AddReaction';
            const title = intl.formatMessage({ id: 'mobile.custom_status.choose_emoji', defaultMessage: 'Choose an emoji' });
            const passProps = {
                closeButton: source,
                onEmojiPress: this.handleEmojiClick,
            };

            requestAnimationFrame(() => showModal(screen, title, passProps));
        });
    };

    handleEmojiClick = (emoji: string) => {
        dismissModal();
        this.setState({ emoji });
    }

    handleClearAfterClick = (duration: CustomStatusDuration, expires_at: string) => {
        dismissModal();
        this.setState({ duration });
        if (duration === CustomStatusDuration.DATE_AND_TIME) {
            this.setState({ expires_at: new Date(expires_at) });
        }
    };

    openClearAfterModal = () => {
        const { intl, theme } = this.props;
        const screen = 'ClearAfter';
        const title = intl.formatMessage({ id: 'mobile.custom_status.clear_after', defaultMessage: 'Clear After' });
        const passProps = { handleClearAfterClick: this.handleClearAfterClick, initialDuration: this.state.duration };
        showModal(screen, title, passProps);
    };

    render() {
        const { emoji, text } = this.state;
        const { theme, isLandscape, intl } = this.props;

        const isStatusSet = emoji || text;
        const style = getStyleSheet(theme);
        const customStatusEmoji = (
            <TouchableOpacity
                testID={`custom_status.emoji.${isStatusSet ? (emoji || 'speech_balloon') : 'default'}`}
                onPress={preventDoubleTap(this.openEmojiPicker)}
                style={style.iconContainer}
            >
                {isStatusSet ? (
                    <Text style={style.emoji}>
                        <Emoji
                            emojiName={emoji || 'speech_balloon'}
                            size={20}
                        />
                    </Text>
                ) : (
                    <CompassIcon
                        name='emoticon-happy-outline'
                        size={24}
                        style={style.icon}
                    />
                )}
            </TouchableOpacity>
        );

        const clearAfter = (
            <TouchableOpacity onPress={this.openClearAfterModal}>
                <View style={style.inputContainer}>
                    <Text style={style.expiryTime}>{intl.formatMessage({ id: 'mobile.custom_status.clear_after', defaultMessage: 'Clear After' })}</Text>
                    {this.state.duration ? <Text style={style.expiryTimeShow}>{ExpiryMenuItems[this.state.duration].value}</Text> : null}
                    <CompassIcon
                        name='chevron-right'
                        size={24}
                        style={style.rightIcon}
                    />
                </View>
            </TouchableOpacity>
        );

        const customStatusInput = (
            <View style={style.inputContainer}>
                <TextInput
                    testID='custom_status.input'
                    autoCapitalize='none'
                    autoCorrect={false}
                    blurOnSubmit={false}
                    disableFullscreenUI={true}
                    keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                    keyboardType='default'
                    maxLength={CustomStatus.CUSTOM_STATUS_TEXT_CHARACTER_LIMIT}
                    onChangeText={this.handleTextChange}
                    placeholder={this.props.intl.formatMessage({ id: 'custom_status.set_status', defaultMessage: 'Set a Status' })}
                    placeholderTextColor={changeOpacity(theme.centerChannelColor, 0.5)}
                    returnKeyType='go'
                    style={style.input}
                    secureTextEntry={false}
                    underlineColorAndroid='transparent'
                    value={text}
                />
                {customStatusEmoji}
                {isStatusSet ? (
                    <View
                        style={style.clearButton}
                        testID='custom_status.input.clear.button'
                    >
                        <ClearButton
                            handlePress={this.clearHandle}
                            theme={theme}
                        />
                    </View>
                ) : null}
            </View>
        );

        let keyboardOffset = DeviceTypes.IS_IPHONE_WITH_INSETS ? 110 : 60;
        if (isLandscape) {
            keyboardOffset = DeviceTypes.IS_IPHONE_WITH_INSETS ? 0 : 10;
        }

        return (
            <SafeAreaView
                testID='custom_status.screen'
                style={style.container}
            >
                <KeyboardAvoidingView
                    behavior='padding'
                    style={style.container}
                    keyboardVerticalOffset={keyboardOffset}
                    enabled={Platform.OS === 'ios'}
                >
                    <ScrollView
                        bounces={false}
                    >
                        <StatusBar />
                        <View style={style.scrollView}>
                            {customStatusInput}
                            {clearAfter}
                            {this.renderRecentCustomStatuses()}
                            {this.renderCustomStatusSuggestions()}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

export default injectIntl(CustomStatusModal);

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.03),
        },
        scrollView: {
            flex: 1,
            paddingTop: 32,
        },
        inputContainer: {
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.1),
            borderBottomColor: changeOpacity(theme.centerChannelColor, 0.1),
            backgroundColor: theme.centerChannelBg,
        },

        input: {
            alignSelf: 'stretch',
            color: theme.centerChannelColor,
            width: '100%',
            fontSize: 17,
            paddingHorizontal: 52,
            textAlignVertical: 'center',
            height: 48,
        },
        icon: {
            color: changeOpacity(theme.centerChannelColor, 0.64),
        },
        emoji: {
            color: theme.centerChannelColor,
        },
        iconContainer: {
            position: 'absolute',
            left: 14,
            top: 12,
        },
        separator: {
            marginTop: 32,
        },
        block: {
            borderBottomColor: changeOpacity(theme.centerChannelColor, 0.1),
            borderBottomWidth: 1,
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.1),
            borderTopWidth: 1,
        },
        title: {
            fontSize: 17,
            marginBottom: 12,
            color: changeOpacity(theme.centerChannelColor, 0.5),
            marginLeft: 16,
        },
        clearButton: {
            position: 'absolute',
            top: 3,
            right: 14,
        },
        divider: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
            height: 1,
            marginHorizontal: 16,
        },
        expiryTime: {
            fontSize: 17,
            paddingLeft: 16,
            height: 48,
            textAlignVertical: 'center',
            color: theme.centerChannelColor
        },
        expiryTimeShow: {
            position: 'absolute',
            right: 30,
        },
        rightIcon: {
            position: 'absolute',
            right: 6,
            color: changeOpacity(theme.centerChannelColor, 0.32),
        },
    };
});
