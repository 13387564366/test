/**
 * Created by cui on 11/1/16.
 */

const React = require('react');
const ReactNative = require('react-native');
const {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  Image  
} = ReactNative;

const Button = (props) => {
  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity {...props}>
        {props.children}
      </TouchableOpacity>
    );
  }
  return (
    <TouchableNativeFeedback
      delayPressIn={0}
      background={TouchableNativeFeedback.SelectableBackground()} // eslint-disable-line new-cap
      {...props}
    >
      {props.children}
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'blue',
    // marginBottom: 24
  },
});

class AndroidTabBar extends React.Component {

  constructor(props) {
    super(props);
    this.renderTab = this.renderTab.bind(this);
    this.state = {};
  }

  static propTypes = {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    backgroundColor: React.PropTypes.string,
    activeTextColor: React.PropTypes.string,
    inactiveTextColor: React.PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: View.propTypes.style,
    renderTab: React.PropTypes.func,
    tabsIcon: React.PropTypes.array
  };

  static defaultProps = {
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
  };

  renderTab(name, page, isTabActive, onPressHandler) {
    const { activeTextColor, inactiveTextColor, textStyle, tabsIcon} = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';
    const imageSource = isTabActive ? tabsIcon[page].selectedIcon : tabsIcon[page].icon;
    return (
      <Button
        style={{ flex: 1, }}
        key={name}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
      >
        <View style={[styles.tab, this.props.tabStyle, ]}>
          <Image style={{ height: 20, width: 20 }} source={imageSource} />
          <Text style={[{ color: textColor, fontWeight, }, textStyle, ]}>
            {name}
          </Text>
        </View>
      </Button>
    );
  }

  render() {
    return (
      <View style={[styles.tabs, { backgroundColor: this.props.backgroundColor }, this.props.style, ]}>
        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage);
        })}
      </View>
    );
  }
}

export default AndroidTabBar;
