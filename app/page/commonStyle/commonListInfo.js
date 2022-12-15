/**
 * Created by edz on 2017/9/12.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    ListView,
    RefreshControl,
    TouchableOpacity,
    InteractionManager,
    Dimensions,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import NavigationBar from '../../components/navigator/NavBarView';
import EmptyData from '../../components/emptyData/emptyData';
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import BusinessOperationActions from '../../actions/businessOperationAction';

import ChannelApproval from '../channelApproval/channelApprovalInfo';//渠道审批详情
import ListItemStyle from './listItem';

const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 14;

export default class CommonListInfo extends Component {
    constructor(props) {
        super(props);
        this._rightAction = this._rightAction.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._onListContentChangeListener = this._onListContentChangeListener.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._toSearchCustomerPage = this._toSearchCustomerPage.bind(this);
        this._renderListItem = this._renderListItem.bind(this);
        this._toChannelApprovalInfoPage = this._toChannelApprovalInfoPage.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
        this.state = {
            isLoadingMore: false,
            refreshing: false,
            dataSource: [],
        };
        this.pageIndex = 1;
        this.isPullDown = null;
        this.itemHeight = 0;
        this.listViewContainerHeight = 0;
        this.dataOverScreen = false;
        this.lastFetchReturn = null;
        this.canLoadMore = true;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._fetchData();
        });
        // AppStore.addChangeListener(this._onListContentChangeListener, EventDic.REFRESH_DATA_CUTOMER_INFO);
    }

    componentWillUnmount() {
        // AppStore.removeChangeListener(this._onListContentChangeListener, EventDic.REFRESH_DATA_CUTOMER_INFO);
    }

    _onListContentChangeListener() {
        if (this.lastFetchReturn) {
            this.canLoadMore = true;
            this.currentDataSource = new Array();
            this.pageIndex = 1;
            this.isPullDown = true;
            this.lastFetchReturn = false;
            this.setState({refreshing: true});
            InteractionManager.runAfterInteractions(() => {
                this._fetchData();
            });
        }
    }


    _fetchData() {
        BusinessOperationActions.getChannelApprovalList({
            pageIndex: this.pageIndex,
            limit: 10,
        }, (responseData) => {
            const curDs = this.state.dataSource;
            let newDatas = responseData.datas;
            this.canLoadMore = newDatas.length != 0;
            newDatas = this._handleListDatas(newDatas);
            const newDataSource = this.isPullDown ? newDatas : curDs.concat(newDatas);
            this.setState({
                dataSource: newDataSource,
                isLoadingMore: false,
                refreshing: false
            });
            this.pageIndex++;
            this.lastFetchReturn = true;
        }, (errMsg) => {
            this.lastFetchReturn = true;
            this.setState({refreshing: false});
            Alert.alert('提示', errMsg,
                [
                    {
                        text: '确定',
                    }
                ]
            );
        });
    }

    // 上拉加载
    _onEndReach() {
        if (this.canLoadMore && this.pageIndex !== 1 && this.lastFetchReturn) {
            this.isPullDown = false;
            this.lastFetchReturn = false;
            this.setState({isLoadingMore: true,})
            this._fetchData();
        }
    }

    // 下拉刷新
    _onPullRefresh() {
        if (this.lastFetchReturn) {
            this.canLoadMore = true;
            this.currentDataSource = new Array();
            this.pageIndex = 1;
            this.isPullDown = true;
            this.lastFetchReturn = false;
            this.setState({refreshing: true});
            this._fetchData();
        }
    }

    _renderFooter() {
        if (this.state.isLoadingMore) {
            return <LoadMoreFooter style={{width: WINDOW_WIDTH,}}/>
        } else if (!this.state.isLoadingMore && this.canLoadMore) {
            return <View />
        } else {
            return (
                <View style={{height: 20, width: WINDOW_WIDTH}}>
                    <Text style={{
                        fontSize: 14, color: 'gray', alignItems: 'center',
                        justifyContent: 'center', alignSelf: 'center'
                    }}>
                        没有更多数据啦...
                    </Text>
                </View>
            );
        }
    }

    _rightAction() {
        return null;
        return (
            <TouchableOpacity
                onPress={() => {
                }}
                style={{
                    flexDirection: 'row',
                    paddingLeft: 5
                }}
            >
                <Icon
                    name="md-add"
                    size={28}
                    color="#F5F5F5"
                    style={{
                        height: 28,
                        width: 28,
                    }}
                />
            </TouchableOpacity>
        );
    }

    _handleArr2Obj(arrData, keyOfKey) {
        const retObj = {};
        for (let idx in arrData) {
            const fieldObj = arrData[idx];
            const key = fieldObj[keyOfKey];
            retObj[key] = fieldObj;
        }
        return retObj;
    }

    _handleListDatas(originDataArr) {
        const handledDataArr = [];
        for (let idx in originDataArr) {
            const itemObj = originDataArr[idx];
            const listItemObj = this._handleArr2Obj(itemObj.list_data, 'colname');
            const detailItemData = this._handleArr2Obj(itemObj.detail_data, 'colname');
            handledDataArr.push({listData: listItemObj, detailData: detailItemData});
        }
        return handledDataArr;
    }

    _toChannelApprovalInfoPage(detailDatas, editable) {
        this.props.navigator.push({
            id: 'ChannelApproval',
            comp: ChannelApproval,
            param: {
                infos: detailDatas,
                projectId: detailDatas.ID.value,
                editable: editable,
            }
        });
    }

    _renderListItem(rowData, sectionID, rowID) {
        const data = rowData || [];
        return (
            <ListItemStyle
                data={data}
                onPress={() => this._toChannelApprovalInfoPage(rowData.detailData, false)}
            />);
    }

    _renderListContent() {
        if (this.state.dataSource <= 0 && !this.state.refreshing) {
            return (
                <EmptyData
                    style={{flex: 1, backgroundColor: '#F0F0F0',}}
                    refreshStyle={{
                        borderColor: '#F4F4F4', height: 30, marginTop: 20,
                        borderWidth: 1, borderRadius: 5
                    }}
                    textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                    onPress={() => this._onPullRefresh()}
                />
            );
        }
        return (
            <View style={{flex: 1}}>
                <ListView
                    contentContainerStyle={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        paddingHorizontal: 0,
                        paddingBottom: Platform.OS === 'ios' ? 0 : 50,
                    }}
                    style={{flex: 1, marginBottom: 0, backgroundColor: '#F1F2F7',}}
                    refreshControl={
                        <RefreshControl
                            enabled={true}
                            refreshing={this.state.refreshing}
                            tintColor="#cc0"
                            title="正在加载中……"
                            color="#ccc"
                            onRefresh={this._onPullRefresh}
                        />
                    }
                    dataSource={this.ds.cloneWithRows(this.state.dataSource)}
                    renderRow={this._renderListItem}
                    automaticallyAdjustContentInsets={false}
                    enableEmptySections={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                    initialListSize={20}
                    pageSize={20}
                    onEndReachedThreshold={100}
                    scrollRenderAheadDistance={1000}
                    onEndReached={this._onEndReach}
                    renderFooter={this._renderFooter}
                    onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        this.listViewContainerHeight = layout.height;
                        this._setDataOverListView();
                    }}
                />
            </View>

        );
    }

    _toSearchCustomerPage() {
        this.props.navigator.push({
            id: '',
            comp: '',
            param: {
                title: '自然人客户',
            }
        });
    }

    _setDataOverListView() {
        this.dataOverScreen = this.state.dataSource.length * this.itemHeight > this.listViewContainerHeight;
    }

    _renderSearchContent() {
        return (
            <View
                style={{
                    backgroundColor: '#E7E7E7',
                    paddingVertical: 10,
                    paddingHorizontal: TEXT_ITEM_PADDING,
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={this._toSearchCustomerPage}
                >
                    <View
                        style={{
                            backgroundColor: 'white',
                            height: 40,
                            paddingVertical: 15,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                        }}
                    >
                        <Image
                            source={require('../../image/search.png')}
                        />
                        <Text style={{color: '#ddd', fontSize: 15, marginLeft: 5,}}>搜索客户</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                goBack={true}
                title="渠道审批列表"
                rightAction={this._rightAction}
            >
                {/*{this._renderSearchContent()}*/}
                {this._renderListContent()}
            </NavigationBar>
        );
    }
}