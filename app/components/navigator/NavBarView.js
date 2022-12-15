import React, {Component} from 'react';
import {isIphoneX} from '../../modules/ScreenUtil';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
  StyleSheet
} from 'react-native';

import Icon from '../../../node_modules/react-native-vector-icons/Ionicons';

export class NavBarView extends Component {

  static propTypes = {
    goBack: React.PropTypes.bool,
    title: React.PropTypes.string,
    titleColor: React.PropTypes.string,
    naviBarStyle: View.propTypes.style,
    rightAction: React.PropTypes.func,
    contentMarginBottom: React.PropTypes.number,
    isLandscape: React.PropTypes.bool,
    isEmptBottom: React.PropTypes.bool
  };

  static defaultProps = {
    goBack: false,
    title: '',
    titleColor: '#000',
    rightAction: null,
    isLandscape: false,
    isEmptBottom: false,
  };

  _goBack = () => {
    this.props.navigator.pop();
  };

  _renderLeft = () => {
    if (this.props.goBack) {
      return (
        <TouchableOpacity
          onPress={() => this._goBack()}
        >
          <Icon
            name="ios-arrow-back"
            size={25}
            color="#000"
            style={{
              height: 30,
              width: 15
            }}
          />
        </TouchableOpacity>
      );
    }
  };

  _renderCenter = () => (
    <Text
      style={[{
        fontSize: Platform.OS === 'ios' ? 16 : 18,
        color: this.props.titleColor,
        textAlign: "center",
      }]}
    >
      {this.props.title}
    </Text>
  );

  _renderRight = () => {
    if (this.props.rightAction != null) {
      return this.props.rightAction();
    }
  };
  _renderBottom = () => {
    if (!this.props.isEmptBottom && this.props.goBack) {
      return (<View style={{
        height: (this.props.isLandscape ? 20 : (isIphoneX() ? 34 : 0)),
      }}></View>)
    }
  };
  render () {
    const isIos = Platform.OS === 'ios';
    let barHeigth = (isIos ? 44 : 48);
    const statusBarHeight = (isIos ? (isIphoneX() ? (this.props.isLandscape ? 20 : 44) : 20) : 0)
    if (isIos) {
      barHeigth += statusBarHeight;
    }
    let fixContainer = {marginBottom: isIos ? 0 : this.props.contentMarginBottom}
    return (
      <View style={[{flex: 1}, this.props.style]}>
        <View style={[{
          height: barHeigth,
          backgroundColor: "white",
          borderBottomWidth: 0.5,
          borderBottomColor: '#E4E7F0',
        }, this.props.naviBarStyle]}>
          <View
            style={{
              top: statusBarHeight,
              height: Platform.OS === 'ios' ? 44 : 48, flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{alignItems: 'center', paddingLeft: 15}}>
              {this._renderLeft()}
            </View>

            <View style={{flex: 1}}>
              {this._renderCenter()}
            </View>

            <View style={{alignItems: 'center', paddingRight: 15}}>
              {this._renderRight()}
            </View>
          </View>
        </View>
        <View style={[styles.container, fixContainer]}>
          {this.props.children}
        </View>
        {this._renderBottom()}
      </View>
    );
  }
}
let styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 0,
  }
});
module.exports = NavBarView;
