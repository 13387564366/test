/**
 * Created by cui on 10/12/16.
 */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';

class RNButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static propTypes = {
    title: React.PropTypes.string,
    textStyle: React.PropTypes.any
  };

  static defaultProps = {
    title: 'RNButton'
  };

  render() {
    if (this.props.underlayColor) {
      return (
        <TouchableHighlight
          style={[{ backgroundColor: 'gray', width: 100, height: 30 }, this.props.style]}
          {...this.props}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text
              style={[{ fontSize: 15, color: 'blue' }, this.props.textStyle]}
            >
              {this.props.title}
            </Text>
          </View>
        </TouchableHighlight>
      );
    }

    return (
      <TouchableOpacity
        style={[{ backgroundColor: 'gray', width: 100, height: 30 }, this.props.style]}
        {...this.props}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text
            style={[{ fontSize: 15, color: 'blue' }, this.props.textStyle]}
          >
            {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

}

export default RNButton;
