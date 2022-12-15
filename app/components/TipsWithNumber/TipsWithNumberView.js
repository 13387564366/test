/**
 * Created by tenwa on 16/12/27.
 */

import React, {PropTypes, Component} from 'react';

import {
    View,
    StyleSheet,
    Text,
    Image,
} from 'react-native';
const TIPS_WIDTH = 20;
const LEFT = 60 - TIPS_WIDTH * 1.5;


export default class TipsWithNumberView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        tipsNum: PropTypes.number,
        source: PropTypes.string,
    };

    static defaultProps = {
        tipsNum: 0,
    }

    _renderTips() {
        let tempNum = this.props.tipsNum;
        if (tempNum > 0) {
            let tipsStr = null;
            if (tempNum >= 100) {
                tipsStr = '...';
            } else {
                tipsStr = tempNum.toString();
            }

            let childWidth = this.props.itemWidth ? this.props.itemWidth : 22;
            let offset = childWidth * 3 / 4;
            return (
                <View style={styles.tips}>
                    <Text style={{fontSize: 12, color: 'white', fontWeight: 'bold',}}>{tipsStr}</Text>
                </View>
            );
        }
        return null;

    }

    render() {
        return (
            <View>
                {this.props.children}
                {this._renderTips()}
            </View>
        );

    }

}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        backgroundColor: 'green',
    },
    tips: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: TIPS_WIDTH,
        height: TIPS_WIDTH,
        borderRadius: TIPS_WIDTH,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    }
});