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
import NavigationBar from '../../components/navigator/NavBarView';
import CommonStyle from '../../modules/CommonStyle';
import SearchBar from '../../components/searchBar/searchBar';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';

import EventDic from '../../modules/eventDic';
const {
    REFRESH_DATA,
} = EventDic;

const WINDOW_WIDTH = Dimensions.get('window').width;

export default class TodoTaskListPage extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._toTaskDetailPage = this._toTaskDetailPage.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._startSearch = this._startSearch.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._dataChangeListener = this._dataChangeListener.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: [],
            isLoadingMore: false,
            refreshing: false,
            globalText: '',
            searchPlaceholder: '',
        };
        this.pageIndex = 1;
        this.canLoadMore = true;
        this.isPullDown = null;
        this.dataCount = '';//初始值为空

        this.itemHeight = 0;
        this.listViewContainerHeight = 0;
        this.dataOverScreen = false;
        this.lastFetchReturn = null;
    }

    componentDidMount() {
        this._fetchData();
        AppStore.addChangeListener(this._dataChangeListener, REFRESH_DATA);
    }

    componentWillUnmount() {
        AppStore.removeChangeListener(this._dataChangeListener, REFRESH_DATA);
    }

    _dataChangeListener() {
        this._onPullRefresh();
    }

    _fetchData() {
        const flowNo = (this.props.param && (this.props.param.flowNo || '') || '');
        TodoTaskActions.getTodoTaskListByPage({
            pageIndex: this.pageIndex,
            limit: 10,
            dataCount: this.dataCount,
            globalText: this.state.globalText,
            flowNo: flowNo,
        }, (response) => {
            const currentDs = this.state.dataSource || [];
            const newDs = CommonFunc.handleListDatas(response.datas || []);
            const newDsLength = newDs.length;
            this.canLoadMore = newDsLength !== 0;
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

    _toTaskDetailPage(listObjData) {
        const flowName = CommonFunc.getValue(listObjData, 'FLOWNAME');
        const flowNo = CommonFunc.getValueByKeyArr(listObjData, ['FLOWNO', 'itemno']);
        const phaseNo = CommonFunc.getValueByKeyArr(listObjData, ['PHASENO', 'itemno']);
        const serialNo = CommonFunc.getValueByKeyArr(listObjData, ['SERIALNO', 'itemno']);
        const objectNo = CommonFunc.getValueByKeyArr(listObjData, ['OBJECTNO', 'itemno']);
        const param = {flowNo: flowNo, serialNo: serialNo, objectNo: objectNo,phaseNo:phaseNo};
        TodoTaskActions.getTodoTaskCheck(param, (response) => {
            if (response.STATUS == 'SUCCESS') {
                this.props.navigator.push({
                    id: 'TodoTaskDetailPage',
                    comp: TodoTaskDetailPage,
                    param: {
                        title: flowName,
                        listData: listObjData,
                        editable: true,
                    }
                })
            }else if(response.MSG){
                Alert.alert(
                    '提示',
                    response.MSG,
                    [{text: '确定',onPress: () => AppDispatcher.dispatch({actionType: AppConstants.REFRESH_DATA})}]
                );
            }
        }, (error) => {
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
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
            this.dataCount = '';
            this.isPullDown = true;
            this._fetchData();
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <ListItem
                data={rowData}
                onPress={()=>this._toTaskDetailPage(rowData.listData)}
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

    render() {
        const renderTitleBar = this.props.showTitleBar || (this.props.param ? this.props.param.showTitleBar : false);
        if (renderTitleBar) {
            const title = (this.props.param && this.props.param.title) || '待办列表';
            return (
                <NavigationBar
                    title={title}
                    navigator={this.props.navigator}
                    goBack={true}
                >
                    {this._renderSearchContent()}
                    {this._renderContent()}
                </NavigationBar>
            );
        } else {
            return (
                <View
                    style={{flex: 1}}
                >
                    {this._renderSearchContent()}
                    {this._renderContent()}
                </View>
            );
        }
    }

    _setDataOverListView() {
        this.dataOverScreen = this.state.dataSource.length * this.itemHeight > this.listViewContainerHeight;
    }
}