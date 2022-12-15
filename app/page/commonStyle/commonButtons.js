/**
 * Created by edz on 2017/11/9.
 */
import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';

import RNButton from '../../components/rnButton/rnButton';

export default class CommonButtons extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        show: React.PropTypes.bool,
        /**
         * buttons: [
         *              {
         *                  text: 'btn1_text',
         *                  onPress: ,
         *              },
         *          ]
         */
        buttons: React.PropTypes.array,
        styleNum: React.PropTypes.number,
        containerStyle: React.PropTypes.object,
        buttonStyle: React.PropTypes.object,
        textStyle: React.PropTypes.object,
    };

    static defaultProps = {
        styleNum: 1,
        show: true,
        containerStyle: {},
        buttonStyle: {},
        textStyle: {},
    };

    _renderButtons() {
        const {buttonStyle, textStyle, styleNum} = this.props;
        const defaultStyles = 'Style' + styleNum;
        const buttons = this.props.buttons || [];
        const btnArr = [];
        buttons.forEach((btnInfo, i) => {
            if (i > 0) {
                btnArr.push(
                    <View key={'space-' + i} style={{flex: 1,}}/>
                );
            }
            btnArr.push(
                <RNButton
                    key={'btn-' + i}
                    title={btnInfo.text}
                    style={[styles['button' + defaultStyles], buttonStyle]}
                    textStyle={[styles['text' + defaultStyles], textStyle]}
                    onPress={btnInfo.onPress}
                />
            )
        });
        return btnArr;
    }

    _renderContent() {
        const {show, buttons, containerStyle,} = this.props;
        const showBtns = show && buttons.length > 0;
        if (!showBtns) {
            return null;
        }
        return (
            <View
                style={[styles.containerStyle, containerStyle]}>
                {this._renderButtons()}
            </View>
        );
    }

    render() {
        return this._renderContent();
    }
}
const buttonStyle = {paddingVertical: 10, borderRadius: 5, flex: 4,};
const styles = StyleSheet.create({
        containerStyle: {
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: 'row',
            backgroundColor: '#F5F5F5',
        },
        buttonStyle1: {
            backgroundColor: '#3877bc',
            ...buttonStyle,
        },
        textStyle1: {
            color: 'white',
        },
        buttonStyle2: {
            borderColor: '#6B1785',
            borderWidth: 1,
            backgroundColor: 'white',
            ...buttonStyle,
        },
        textStyle2: {
            color: '#E79200',
        },
    }
);