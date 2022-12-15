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

import SearchBar from '../../components/searchBar/searchBar';
import TodoTaskActions from '../../actions/FlowActions';
import AppStore from '../../stores/AppStore';
import EmptyData from '../../components/emptyData/emptyData';
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import CompletedDetailPage from './todoTaskDetailPage';
import ListItem from '../commonStyle/listItem';
import CommonFunc from '../commonStyle/commonFunc';
import CommonStyle from '../../modules/CommonStyle';
import EventDic from '../../modules/eventDic';
const {
    REFRESH_DATA,
} = EventDic;

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const TEXT_ITEM_PADDING = 14;

export default class CompletedListPage extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._toCompletedDetailPage = this._toCompletedDetailPage.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._dataChangeListener = this._dataChangeListener.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._startSearch = this._startSearch.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: [],
            isLoadingMore: false,
            refreshing: true,
            globalText: '',
            searchPlaceholder: '',
        };
        this.dataCount = '';//初始值为空
        this.itemHeight = 0;
        this.listViewContainerHeight = 0;
        this.dataOverScreen = false;
        this.pageIndex = 1;
        this.pageArray = new Array();
        this.canLoadMore = true;
        this.isPullDown = null;
        this.lastFetchReturn = null;
    }

    componentDidMount() {
        AppStore.addChangeListener(this._dataChangeListener, REFRESH_DATA);
        InteractionManager.runAfterInteractions(()=> {
            this._fetchData();
        });
    }

    componentWillUnmount() {
        AppStore.removeChangeListener(this._dataChangeListener, REFRESH_DATA);
    }

    _dataChangeListener() {
        this._onPullRefresh();
    }

    _fetchData() {
        this.setState({refreshing: true});
        TodoTaskActions.getCompletedList({
            pageIndex: this.pageIndex,
            limit: 10,
            dataCount: this.dataCount,
            globalText: this.state.globalText,
        }, (response) => {
            const currentDs = this.state.dataSource || [];
            const newDs = CommonFunc.handleListDatas(response.datas || []);
            if (newDs.length === 0) this.canLoadMore = false;
            let newDataSource = this.isPullDown ? newDs : currentDs.concat(newDs);
            this.pageIndex++;
            this.lastFetchReturn = true;
            const placeHolder = response.filters || '';
            this.dataCount = response.dataCount;
            const newState = {
                dataSource: newDataSource,
                isLoadingMore: false,
                refreshing: false,
            };
            if (!this.state.searchPlaceholder) {
                newState.searchPlaceholder = placeHolder;
            }
            this.setState(newState);
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

    _toCompletedDetailPage(listData) {
        const flowName = CommonFunc.getValue(listData, 'FLOWNAME');
        this.props.navigator.push({
                id: 'CompletedDetailPage',
                comp: CompletedDetailPage,
                param: {
                    title: '已办',
                    listData: listData,
                    editable: false,
                }
            }
        )
    }

    // 上拉加载
    _onEndReach() {
        if (this.canLoadMore && this.pageIndex !== 1 && this.lastFetchReturn) {
            this.lastFetchReturn = false;
            this.isPullDown = false;
            this.setState({isLoadingMore: true,});
            this._fetchData();
        }
    }

    // 下拉刷新
    _onPullRefresh() {
        if (this.lastFetchReturn) {
            this.canLoadMore = true;
            this.pageIndex = 1;
            this.dataCount = '';
            this.isPullDown = true;
            this.lastFetchReturn = false;
            this._fetchData();
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <ListItem
                data={rowData}
                onPress={()=>this._toCompletedDetailPage(rowData.listData)}
            />
        );
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

    _startSearch() {
        this._onPullRefresh();
    }

    _renderSearchContent() {
        let showSearchBar = this.props.showSearchBar || (this.props.param && this.props.param.showSearchBar);
        showSearchBar = showSearchBar && !!this.state.searchPlaceholder;
        if (showSearchBar) {
            return (
                <SearchBar
                    inputStyle={{
                        borderRadius: 5,
                        height: 50,
                        backgroundColor: '#F1F2F7'
                    }}
                    backgoundColor="white"
                    onSearchChange={(text) => {
                        let searchText = text.nativeEvent ? text.nativeEvent.text : text;
                        this.setState({globalText: searchText})
                    }
                    }
                    startSearch={() => this._startSearch()}
                    height={40}
                    value={this.state.globalText}
                    placeholder={this.state.searchPlaceholder}
                    autoCorrect={false}
                    padding={5}
                    returnKeyType={'search'}
                />
            );
        }
    }

    _renderListContent() {
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
                        paddingBottom: Platform.OS === 'ios' ? 0 : 50,
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

    render() {
        return (
            <View
                style={{flex: 1,}}
            >
                {this._renderSearchContent()}
                {this._renderListContent()}
            </View>
        );
    }

    _setDataOverListView() {
        this.dataOverScreen = this.state.dataSource.length * this.itemHeight > this.listViewContainerHeight;
    }
}