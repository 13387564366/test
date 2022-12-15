/**
 * Created by edz on 2017/10/23.
 * desc: 待新增变更信息的通用列表选择页面
 */

import React from 'react';
import {
    View,
    Text,
    ListView,
    RefreshControl,
    ScrollView,
    Platform,
    Alert,
    Dimensions,
    TouchableOpacity,
    InteractionManager,
    Image,
} from 'react-native';

import EmptyData from '../../components/emptyData/emptyData';
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import NavigationBar from '../../components/navigator/NavBarView';
import CommonFunc from './commonFunc';
import ListItemStyle from './listItem';
import BusinessOperationActions from '../../actions/businessOperationAction';
import SearchBar from '../../components/searchBar/searchBar';

const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 14;

export default class CommonSelectList extends React.Component {
    constructor(props) {
        super(props);
        this._onListItemPress = this._onListItemPress.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._onListContentChangeListener = this._onListContentChangeListener.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._toSearchCustomerPage = this._toSearchCustomerPage.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this._startSearch = this._startSearch.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
        this.state = {
            globalText: '',//搜索
            searchPlaceholder: '',//搜索字段
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

    static defaultProps = {
        styleNum: 2,
        showSearchBar: true,
    };

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._fetchData();
        });
    }

    _startSearch() {
        this._onPullRefresh();
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
        BusinessOperationActions.getCommonSelectListByPage({
            ...this.props.param.selectParam,
            selectType: this.props.param.selectType,
            globalText: this.state.globalText,
            pageIndex: this.pageIndex,
            limit: 100,
        }, (responseData) => {
            const curDs = this.state.dataSource;
            let newDatas = responseData.datas;
            this.canLoadMore = newDatas.length != 0;
            newDatas = this._handleListDatas(newDatas);
            const newDataSource = this.isPullDown ? newDatas : curDs.concat(newDatas);
            const placeholder = responseData.selFilterField;
            const newState = {
                dataSource: newDataSource,
                isLoadingMore: false,
                refreshing: false
            };
            if (!this.state.searchPlaceholder) {
                newState.searchPlaceholder = placeholder;
            }
            this.setState(newState);
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
        // if (!this.dataOverScreen) {
        //     return;
        // }

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

    _getNextParam(pageType, postParam) {
        let nextParam = null;
        switch (pageType) {
            case 'refundApply':
                nextParam = {
                    editable: true,
                    title: '退款申请详情',
                    contractSelect: postParam,
                    opType: 'add',
                };
                break;
        }
        return nextParam;
    }

    _onListItemPress(rowData) {
        const postParam = {};
        for (let key in rowData) {
            let item = rowData[key];
            if (item.isReturn) {
                postParam[key] = item.itemno;
                // postParam[key] = item.value;
            }
        }
        const onPress = this.props.param.onPress;//列表条目点击处理
        const popPage = this.props.param.popPage;//弹出页面
        if (onPress) {
            if (popPage) {
                this.props.navigator.pop();
            }
            onPress(postParam);
        }
    }

    _handleListDatas(originDataArr) {
        const handledDataArr = [];
        for (let idx in originDataArr) {
            const itemObj = originDataArr[idx];
            const listItemObj = CommonFunc.handleArr2Obj(itemObj.row, 'code');
            CommonFunc.handlePageFormat(listItemObj);
            handledDataArr.push({listData: listItemObj});
        }
        return handledDataArr;
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <ListItemStyle
                data={rowData}
                visibleFilterFunOnly={true}
                visibleFilterFun={ (fieldInfo) => fieldInfo.isHidden != true}
                onPress={() =>this._onListItemPress(rowData.listData)}/>
        );
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
                    onPress={() => this._fetchData()}
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
        if (this.props.showSearchBar && this.state.searchPlaceholder) {
            return (
                <SearchBar
                    inputStyle={{borderRadius: 5, height: 50, backgroundColor: '#F1F2F7'}}
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
        return (
            <NavigationBar
                navigator={this.props.navigator}
                goBack={true}
                title={this.props.param.title}
            >
                {this._renderSearchContent()}
                {this._renderListContent()}
            </NavigationBar>
        );
    }
}
