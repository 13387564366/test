import React, { Component } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  ListView
} from 'react-native';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => {
  if (typeof r1.status !== 'undefined') {
    return true;
  }
  return r1 !== r2;
}
});

export default class GroupItem extends Component {

  static propTypes = {
    index: React.PropTypes.string,
    renderGroupHead: React.PropTypes.func.isRequired,
    renderGroupItem: React.PropTypes.func.isRequired,
    groupHeadKey: React.PropTypes.string.isRequired,
    groupItemKey: React.PropTypes.string.isRequired,
    groupData: React.PropTypes.any.isRequired,
    headPress: React.PropTypes.func,
    groupContainerStyle: React.PropTypes.any
  };

  constructor(props) {
    super(props);
    // initial state
    const groupItemKey = this.props.groupItemKey;
    const itemsLength = !!this.props.groupData && !!this.props.groupData[groupItemKey] ?
      this.props.groupData[groupItemKey].length : 0;  // TODO: 异常判断  数据名称

    this.itemHeight = 0;
    this.clickGroup = this.clickGroup.bind(this);
    this._renderGroupHead = this._renderGroupHead.bind(this);
    this._renderGroupItem = this._renderGroupItem.bind(this);
    this._renderGroupItemRow = this._renderGroupItemRow.bind(this);

    this.state = {
      open: true,
      fadeAnim: new Animated.Value(-1),
      itemsLength
    };
  }
  // Platform.OS === 'ios' ?
  // new Animated.Value(this.itemHeight * itemsLength) : this.itemHeight * itemsLength,

  componentWillReceiveProps(nextProps) {
    const groupItemKey = nextProps.groupItemKey;
    const itemsLength = !!nextProps.groupData && !!nextProps.groupData[groupItemKey] ?
      nextProps.groupData[groupItemKey].length : 0;

    this.setState({ itemsLength });
  }

  clickGroup() {
    this.setState({ open: !this.state.open });
    if (this.props.headPress) this.props.headPress(this.state.open);
    if (!this.state.open) {
      Animated.timing(          // Uses easing functions
        this.state.fadeAnim,    // The value to drive
        { toValue: this.itemHeight * this.state.itemsLength, duration: 300 }          // Configuration
      ).start();
    } else {
      Animated.timing(          // Uses easing functions
        this.state.fadeAnim,    // The value to drive
        { toValue: 0, duration: 300 }          // Configuration
      ).start();
    }
  }

  _renderGroupHead() {
    const { groupData, index, renderGroupHead, groupHeadKey } = this.props;
    return (
      <TouchableOpacity
        onPress={this.clickGroup}
        opacity={0.6}
      >
        {renderGroupHead(groupData[groupHeadKey], index, this.state.open)}
      </TouchableOpacity>
    );
  }
  _renderGroupItem() {
    const { groupData, index, groupItemKey } = this.props;
    return (
      <Animated.View
        style={{ height: this.state.fadeAnim }}
      >
        <ListView
          key={index}
          dataSource={ds.cloneWithRows(groupData[groupItemKey])}
          renderRow={this._renderGroupItemRow}
        />
      </Animated.View>
    );
  }

  _renderGroupItemRow(rowData, sectionID, rowID) {
    const { renderGroupItem } = this.props;
    return (
      <View
        ref="GroupItemRowView"
        key={rowID}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          this.itemHeight = layout.height;
        }}
      >
        {renderGroupItem(rowData, sectionID, rowID)}
      </View>
    );
  }

  render() {
    return (
      <View style={[{ overflow: 'hidden' }, this.props.groupContainerStyle]}>
        {this._renderGroupHead()}
        {this._renderGroupItem()}
      </View>
    );
  }
}
