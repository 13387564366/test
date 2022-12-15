/**
 * Created by cui on 9/27/16.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
} from 'react-native';

class NameCircleView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  static propTypes = {
    name: React.PropTypes.string,
    style: React.PropTypes.any,
    nameTextStyle: React.PropTypes.any,
    diameter: React.PropTypes.number,
    renderBadge: React.PropTypes.any
  };

  static defaultProps = {
    name: 'I',
    nameTextStyle: {
      fontSize: 10,
      color: 'white'
    }
  };

  componentDidMount() {

  }

  _renderBadge(props) {
    if (this.props.renderBadge) {
      return React.cloneElement(this.props.renderBadge(props), props);
    }

    return null;
  }

  render() {
    const firstChar = this.props.name;
    const diameter = this.props.diameter;
    return (
      <View
        style={[{ backgroundColor: '#2f86d5', borderWidth: 0.5, borderColor: '#E7E7E7' },
         this.props.style,
         { justifyContent: 'center', alignItems: 'center', width: diameter, height: diameter,
         borderRadius: diameter / 2 }]}
      >
        <Text style={[this.props.nameTextStyle]}>{firstChar}</Text>
        <View
          style={{ position: 'absolute', right: diameter / 4, top: diameter * 3 / 4,
         height: 15, width: 15, justifyContent: 'center', alignItems: 'center' }}
        >
          {this._renderBadge()}
        </View>
      </View>
    );
  }

}

export default NameCircleView;
