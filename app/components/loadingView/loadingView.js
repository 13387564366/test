/**
 * Created by cui on 9/4/16.
 */

import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';

export default class Loading extends Component {

  static propTypes = {
    isDismissible: React.PropTypes.bool,
    isVisible: React.PropTypes.bool.isRequired,
    color: React.PropTypes.string,
    size: React.PropTypes.oneOf(['small', 'large']),
    overlayColor: React.PropTypes.string,
    panelColor: React.PropTypes.string
  };

  static defaultProps = {
    isDismissible: false,
    isVisible: false,
    color: '#000',
    size: 'large',
    overlayColor: 'rgba(0, 0, 0, 0)',
    panelColor: 'rgba(0, 0, 0, 0.3)'
  };

  _renderSpinner = () => {
    const spinnerStyle = {
      width: 150,
      height: 100,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: this.props.panelColor
    };

    return (
      <View style={spinnerStyle}>
        <ActivityIndicator color={this.props.color} size={this.props.size} />
      </View>
    );
  }

  render() {
    if (this.props.isVisible) {
      return (
        <View
          key="Loading"
          style={[{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: this.props.overlayColor
          }]}
          underlayColor={this.props.overlayColor}
          activeOpacity={1}
          {...this.props}
        >
          {this._renderSpinner()}
        </View>
      );
    }

    return (
      <View />
    );
  }
}
