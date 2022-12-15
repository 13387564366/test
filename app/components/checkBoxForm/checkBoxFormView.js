/**
 * Created by cui on 11/11/16.
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import ItemCheckbox from 'react-native-item-checkbox';

class CheckBoxFormView extends Component {
    constructor (props) {
        super (props);
        this.state = {};
    }

    static propTypes = {
        dataSource: React.PropTypes.array.required,
        icon: React.PropTypes.string,
        size: React.PropTypes.number,
        iconSize: React.PropTypes.number,
        backgroundColor: React.PropTypes.string,
        color: React.PropTypes.string,
        onCheck: React.PropTypes.func,
        onUncheck: React.PropTypes.func,
        checked: React.PropTypes.bool, //calles onCheck or onUncheck
        default: React.PropTypes.bool, // doesn't call onCheck or onUncheck)
        formHorizontal: React.PropTypes.bool,
        leftText: React.PropTypes.string,
        leftTextStyle: React.propTypes.object,
        rightText: React.PropTypes.string,
        rightTextStyle: React.PropTypes.object
    };

    static defaultProps = {
        formHorizontal: false,
        leftTextStyle: {
            margin: 5,
            color: '#222',
            fontSize: 14
        },
        rightTextStyle: {
            margin: 5,
            color: '#222',
            fontSize: 14
        }
    };

    _renderItemCheckBox(item, i) {
        return (
            <TouchableOpacity
                style={[{ margin: 6 }, this.props.itemStyle,
                { flexDirection: 'row', padding: 5, justifyContent: 'center', alignItems: 'center' }]}
                onPress={}
            >
                {this.props.leftText ?  <Text style={this.props.leftTextStyle}>{this.props.leftText}</Text> : null}
                <ItemCheckbox {...this.props} />
                {this.props.rightText ?  <Text style={this.props.rightTextStyle}>{this.props.rightText}</Text> : null}
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <ScrollView
                contentContainerStyle={{
                    flexDirection: this.props.formHorizontal ? 'row' : 'column',
                    flexWrap: 'wrap', alignItems: 'flex-start', padding: 5
                }}
            >
                {
                    this.props.dataSource.map((item, i) => {
                        
                    })
                }

            </ScrollView>
        )
    }
}
