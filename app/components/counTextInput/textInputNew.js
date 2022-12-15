/**
 * Created by cui on 10/12/16.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

export default class TextInputNew extends Component {

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
        ' ' + (this.props.maxLength - this.props.value.length) + '/' + (this.props.maxLength)
    );
  }

  _limitLength(_text) {
    const textLength = _text ? _text.length : 0;
    if (textLength > this.props.maxLength) {
      this.setState({
        tips: ' ' + (this.props.maxLength - textLength) + '/' + (this.props.maxLength),
        bOut: true,
      });
      this.props.stateCallback(true);
    } else {
      this.setState({
        tips: ' ' + (this.props.maxLength - textLength) + '/' + (this.props.maxLength),
        bOut: false,
      });
      this.props.stateCallback(false);
      this.props.callback(_text);
    }
  }

  _renderTips = () => (
    <Text
      style={{
        color: this.state.bOut ? 'red' : '#CCCCCC',
        fontSize: 15,
        marginVertical: 5,
        marginRight: 10,
        textAlign: 'right',
      }}
    >{this.state.tips}</Text>
  );

  render() {
    return (
      <View style={{
            backgroundColor: '#FFFFFF',marginBottom: 10}}>
        <TextInput underlineColorAndroid='transparent'
          {...this.props}
          style={[{
            alignSelf: 'stretch',
            flex: 1,
            fontSize: 15,
            paddingTop:1,
            height: 70,
            textAlignVertical: 'top',
          }, this.props.style]}
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

