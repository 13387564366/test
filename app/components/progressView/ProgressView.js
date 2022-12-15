/**
 * Created by tenwa on 16/12/26.
 */

import React, {Component} from 'react';

import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

export default class ProgressView extends Component{

    constructor(props){
        super(props);
    }

    static propTypes = {
        max: React.PropTypes.number.isRequired,
        curValue: React.PropTypes.number.isRequired,
        initValue: React.PropTypes.number,

    }

    static defaultProps = {
        max: 100,
        curValue: 0,
        initValue: 0,
    }

    render(){
        let maxValue = this.props.max || 100;
        let curValue = this.props.curValue;
        let progress = curValue / maxValue * 100;
        let progressStr = progress.toString();
        let progressMsg = progress == parseInt(progress.toString()) ? progress.toString() : progressStr.substring(0,progressStr.indexOf('.'));
        let displayText = progressMsg + '%';
        return (
            <View style={[styles.frame, this.props.style]}>
                <Text style={[styles.textStyle,this.props.textStyle]}>{displayText}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    frame: {
        backgroundColor: '#82DB47',
        padding: 10,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStyle: {
        color: 'white',
        textAlign: 'center',
    },
});