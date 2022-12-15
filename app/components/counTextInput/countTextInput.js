/**
 * Created by cui on 10/12/16.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

export default class CountedTextInput extends Component {

  static propTypes = {
    maxLength: React.PropTypes.number,
    value: React.PropTypes.string,
    callback: React.PropTypes.func.isRequired,
    stateCallback: React.PropTypes.func.isRequired,
    editable: React.PropTypes.bool,
  };

  static defaultProps = {
    maxLength: 200,
    editable: true
  };

  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this._limitLength = this._limitLength.bind(this);
    this._getInitTips = this._getInitTips.bind(this);
    this.state = {
      tips: '',
      bOut: false,
    };
  }

  componentDidMount() {
    this._limitLength(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this._limitLength(nextProps.value);
    }
  }

  _getInitTips() {
    return (
      '还可以输入 ' + (this.props.maxLength - this.props.value.length) + ' 字'
    );
  }

  _limitLength(_text) {
    const textLength = _text ? _text.length : 0;
    if (textLength > this.props.maxLength) {
      this.setState({
        tips: '已超出 ' + (textLength - this.props.maxLength) + ' 字',
        bOut: true,
      });
      this.props.stateCallback(true);
    } else {
      this.setState({
        tips: '还可以输入 ' + (this.props.maxLength - textLength) + ' 字',
        bOut: false,
      });
      this.props.stateCallback(false);
      this.props.callback(_text);
    }
  }

  _renderTips = () => (
    <Text
      style={{
        color: this.state.bOut ? 'red' : 'grey',
        fontSize: 13,
        paddingRight: 10,
        marginVertical: 5,
        textAlign: 'right',
      }}
    >{this.state.tips}</Text>
  );

  render() {
    return (
      <View>
        <TextInput
          {...this.props}
          style={{
            borderColor: '#D3D3D3',
            backgroundColor: 'white',
            alignSelf: 'stretch',
            flex: 1,
            fontSize: 15,
            paddingLeft: 10,
            paddingTop:1,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            height: 100
          }}
          autoCorrect={false}
          multiline={true}
          maxLength={200}
          editable={this.props.editable}
          onChangeText={this._limitLength}
        />
        {this.props.editable ? this._renderTips() : null}
      </View>
    );
  }
}

