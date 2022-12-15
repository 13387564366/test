/**
 * Created by amarsoft on 2016/12/13.
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableHighlight
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';

class CheckBoxItem extends Component {
  constructor(props) {
    super(props);
    this._resetUnChecked = this._resetUnChecked.bind(this);
    this._updateCheckedState = this._updateCheckedState.bind(this);
    this.state = {
      isChecked: this.props.isChecked,
    }
  }

  static propTypes = {
    ...View.propTypes,
    leftText: React.PropTypes.string,
    leftTextView: React.PropTypes.element,
    rightText: React.PropTypes.string,
    leftTextStyle: View.propTypes.style,
    rightTextView: React.PropTypes.string,
    rightTextStyle: View.propTypes.style,
    checkedImage: React.PropTypes.element,
    unCheckedImage: React.PropTypes.element,
    onClick: React.PropTypes.func.isRequired,
    isChecked: React.PropTypes.bool,
    enabled: React.PropTypes.bool,
  }
  static defaultProps = {
    enabled: true,
    isChecked: false,
    leftTextStyle: {},
    rightTextStyle: {}
  }

  _resetUnChecked() {
    this.setState({
      isChecked: false
    })
  }

  _updateCheckedState(checked) {
    this.setState({
      isChecked: checked
    })
  }

  _renderLeft() {
    if (this.props.leftTextView)return this.props.leftTextView;
    if (!this.props.leftText)return null;
    return (
        <Text style={[styles.leftText, this.props.leftTextStyle]}>{this.props.leftText}</Text>
    )
  }

  _renderRight() {
    if (this.props.rightTextView)return this.props.rightTextView;
    if (!this.props.rightText)return null;
    return (
        <Text style={[styles.rightText, this.props.rightTextStyle]}>{this.props.rightText}</Text>
    )
  }

  _renderImage() {
    if (this.state.isChecked) {
      return this.props.checkedImage ? this.props.checkedImage : this.genCheckedImage();
    } else {
      return this.props.unCheckedImage ? this.props.unCheckedImage : this.genCheckedImage();
    }
  }

  genCheckedImage() {
    //let source = this.state.isChecked ? require('./img/ic_check_box.png') : require('./img/ic_check_box_outline_blank.png');
    const color = this.props.enabled ? '#2F86D5' : 'gray'
    if (this.state.isChecked) {
      return (
          <View
              style={{
                width: 20, height: 20, borderWidth: 1, borderColor: color, justifyContent: 'center',
                alignItems: 'center'
              }}
          >
            <Icon
                name="md-checkmark"
                size={15}
                color={color}
                backgroundColor="transparent"
            />
          </View>
      )
    }

    return (
        <View
            style={{
              width: 20, height: 20, borderWidth: 1, borderColor: color, justifyContent: 'center',
              alignItems: 'center'
            }}
        />

    )
  }

  onClick() {
    if (this.props.enabled) {
      this.props.onClick(!this.state.isChecked);
      this.setState({
        isChecked: !this.state.isChecked
      });
    }
  }

  render() {
    return (
        <TouchableHighlight
            style={this.props.style}
            onPress={()=>this.onClick()}
            underlayColor='transparent'
        >
          <View style={styles.container}>
            {this._renderLeft()}
            {this._renderImage()}
            {this._renderRight()}
          </View>
        </TouchableHighlight>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftText: {
    flex: 1,
  },
  rightText: {
    flex: 1,
    marginLeft: 10
  }
});

export default CheckBoxItem
