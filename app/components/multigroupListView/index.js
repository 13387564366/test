import React, { Component } from 'react';
import {
  ScrollView,
  ListView,
  RefreshControl,
  Image,
  Text,
  View,
  TouchableOpacity,
  Dimensions
} from 'react-native';

import GroupItem from './group';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => {
  if (typeof r1.status !== 'undefined') {
    return true;
  }
  return r1 !== r2;
}
});

export default class ExtendList extends Component {
  constructor(props) {
    super(props);
    this._renderGroup = this._renderGroup.bind(this);
    this.state = {
      isRefreshing: false,
      loaded: 0
    };
  }

  static propTypes = {
    renderGroupHead: React.PropTypes.func.isRequired,
    renderGroupItem: React.PropTypes.func.isRequired,
    groupHeadKey: React.PropTypes.string.isRequired,
    groupItemKey: React.PropTypes.string.isRequired,
    dataSource: React.PropTypes.array.isRequired,
    headPress: React.PropTypes.func,
    groupContainerStyle: React.PropTypes.any,

    refreshList: React.PropTypes.func,
    renderHeader: React.PropTypes.func,
  
    textStyle: React.PropTypes.any,
    imageStyle:React.PropTypes.any,
    style:React.PropTypes.any,
    imageUrl:React.PropTypes.any,
    refreshStyle:React.PropTypes.any,
  };

  _onRefresh = () => {
    this.setState({ isRefreshing: true });
    setTimeout(() => {
      if (this.props.refreshList) {
        this.props.refreshList();
      }

      this.setState({ isRefreshing: false });
    }, 500);
  };

  startRefresh = () => {
    this.setState({ isRefreshing: true });
    setTimeout(() => {
      if (this.props.refreshList) {
        this.props.refreshList(() => this.endRefresh());
      }
    }, 250);
  };

  endRefresh = () => {
    this.setState({ isRefreshing: false });
  };

  static defaultProps = {
    title: '重新加载',
    imageUrl:require('../../image/empty.png')
  };


  _renderGroup(rowData, rowId) {
    const { renderGroupItem, renderGroupHead, groupHeadKey, groupItemKey, groupContainerStyle } = this.props;

    return (
      <GroupItem
        key={rowId}
        index={rowId}
        groupContainerStyle={groupContainerStyle}
        renderGroupHead={renderGroupHead}
        renderGroupItem={renderGroupItem}
        groupHeadKey={groupHeadKey}
        groupItemKey={groupItemKey}
        groupData={rowData}
      />
    );
  }

  render() {
    const { dataSource, renderHeader } = this.props;
    if(!dataSource.length>0){
      return(
          <View
              style={[{ alignItems: 'center', justifyContent: 'center',alignSelf:'center'},this.props.style]}
              {...this.props}>
            <Image
                style={
                  [{width: deviceWidth, resizeMode: 'contain',
                    marginTop: deviceHeight * 0.1},this.props.imageStyle]}
                version="1"
                source={this.props.imageUrl}
            />
            <TouchableOpacity
                style={[{ justifyContent: 'center', alignItems: 'center', alignSelf:'center'}, this.props.refreshStyle]}

            >
              <Text
                  style={[{ fontSize: 16, color: '#D3D3D3' }, this.props.textStyle]}
              >
                {this.props.title}
              </Text>
            </TouchableOpacity>
          </View>
      )
    }
    return (
      <ScrollView
        {...this.props}
        style={{ flexDirection: 'column', backgroundColor: 'transparent' }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
        this.props.refreshList ?
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this.startRefresh}
            tintColor="#ff0000"
            titleColor="#00ff00"
          /> :
          null
        }
      >
        <ListView
          renderHeader={renderHeader}
          dataSource={ds.cloneWithRows(dataSource)}
          renderRow={this._renderGroup}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}
        />
      </ScrollView>
    );
  }
}
