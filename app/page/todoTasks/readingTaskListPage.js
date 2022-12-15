/**
 * Created by Administrator on 2016/11/12.
 */

import React, {Component} from 'react';
import {
    ListView,
    View,
    Text,
    Image,
    Dimensions,
    Alert,
    StyleSheet,
    RefreshControl,
    ActivityIndica,
    TouchableOpacity,
    InteractionManager,
    Platform,
} from 'react-native';

import TodoTaskActions from '../../actions/FlowActions';
import AppStore from '../../stores/AppStore';
import EmptyData from '../../components/emptyData/emptyData';
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import ListItem from '../commonStyle/listItem';
import CommonFunc from '../commonStyle/commonFunc';
import TodoTaskDetailPage from './todoTaskDetailPage';
import CommonStyle from '../../modules/CommonStyle';

import EventDic from '../../modules/eventDic';

const {
    REFRESH_DATA_READ,
} = EventDic;

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const TEXT_ITEM_PADDING = 14;

export default class ReadingTaskListPage extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._toTaskDetailPage = this._toTaskDetailPage.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._dataChangeListener = this._dataChangeListener.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: [],
            isLoadingMore: false,
            refreshing: false,
        };
        this.pageIndex = 1;
        this.canLoadMore = true;
        this.isPullDown = null;

        this.itemHeight = 0;
        this.listViewContainerHeight = 0;
        this.dataOverScreen = false;
        this.lastFetchReturn = null;
    }

    componentDidMount() {
        this._fetchData();
        AppStore.addChangeListener(this._dataChangeListener, REFRESH_DATA_READ);
    }

    componentWillUnmount() {
        AppStore.removeChangeListener(this._dataChangeListener, REFRESH_DATA_READ);
    }

    _dataChangeListener() {
        if (this.lastFetchReturn) {
            this.canLoadMore = true;
            this.pageIndex = 1;
            this.isPullDown = true;
            this.lastFetchReturn = false;
            this._fetchData();
        }
    }

    _fetchData() {
        TodoTaskActions.getReadingTaskListByPage({
            pageIndex: this.pageIndex,
            limit: 20,
        }, (response) => {
            const currentDs = this.state.dataSource || [];
            const newDs = CommonFunc.handleListDatas(response.datas || []);
            const newDsLength = newDs.length;
            this.canLoadMore = newDsLength !== 0;
            let newDataSource = this.isPullDown ? newDs : currentDs.concat(newDs);
            this.pageIndex++;
            this.lastFetchReturn = true;
            this.setState({
                dataSource: newDataSource,
                isLoadingMore: false,
                refreshing: false
            });
            // }
        }, (error) => {
            this.lastFetchReturn = true;
            this.setState({refreshing: false});
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _toTaskDetailPage(listObjData) {
        const flowName = CommonFunc.getValue(listObjData, 'FLOWNAME');
        this.props.navigator.push({
                id: 'TodoTaskDetailPage',
                comp: TodoTaskDetailPage,
                param: {
                    title: flowName,
                    listData: listObjData,
                    editable: false,
                    isReading: true,
                }
            }
        );
    }

    // 上拉加载
    _onEndReach() {
        if (this.canLoadMore && this.pageIndex !== 1 && this.lastFetchReturn) {
            this.isPullDown = false;
            this.lastFetchReturn = false;
            this._fetchData();
        }
    }

    // 下拉刷新
    _onPullRefresh() {
        if (this.lastFetchReturn) {
            this.lastFetchReturn = false;
            this.canLoadMore = true;
            this.pageIndex = 1;
            this.isPullDown = true;
            this._fetchData();
        }

    }

    _taskList(rowData, sectionID, rowID) {
        if (rowData.taskType == '会签') {
            return (
                <Image source={require('../../image/home_countersign.png')}/>
            );
        }
        if (rowData.taskType == '传阅') {
            return (
                <Image source={require('../../image/home_look.png')}/>
            );
        }
        if (rowData.taskType == '待办') {
            return (
                <Image source={require('../../image/home_normal.png')}/>
            );
        }
        if (rowData.taskType == '退回') {
            return (
                <Image source={require('../../image/home_return.png')}/>
            );
        } else {/*默认返回的图标类型*/
            return (
                <Image source={require('../../image/home_countersign.png')}/>
            );
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <ListItem
                data={rowData}
                onPress={() => this._toTaskDetailPage(rowData.listData)}
            />
        );
    }

    _renderFooter() {
        if (this.state.isLoadingMore) {
            return <LoadMoreFooter style={{width: WINDOW_WIDTH,}}/>
        } else if (!this.state.isLoadingMore && this.canLoadMore) {
            return <View/>
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

    _renderContent() {
        if (this.state.dataSource <= 0 && !this.state.refreshing) {
            return (
                <EmptyData
                    style={[{flex: 1, backgroundColor: '#F0F0F0',}, CommonStyle.backgroundColor]}
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
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        paddingBottom: Platform.OS === 'ios' ? 50 : 50,
                    }}
                    style={[{flex: 1, marginBottom: 0, backgroundColor: '#E7E7E7',}, CommonStyle.backgroundColor]}
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
                    renderRow={this._renderRow}
                    automaticallyAdjustContentInsets={false}
                    enableEmptySections={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                    initialListSize={20}
                    pageSize={20}
                    onEndReachedThreshold={20}
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

    render() {
        return this._renderContent();
    }

    _setDataOverListView() {
        this.dataOverScreen = this.state.dataSource.length * this.itemHeight > this.listViewContainerHeight;
    }
}