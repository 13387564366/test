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
import SearchBar from '../../components/searchBar/searchBar';
import StepNumber from '../../components/stepNumber/stepNumber';
import EmptyData from '../../components/emptyData/emptyData';
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import NavigationBar from '../../components/navigator/NavBarView';
import Icon from 'react-native-vector-icons/Ionicons';
import AppStore from '../../stores/AppStore';
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';

import CommonActions from '../../actions/BaseActions';
import CommonSelectList from './commonSelectList';//待新增变更的通用合同列表
import ListItemStyle from './listItem';
import CommonFunc from './commonFunc';

const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 14;

export default class BaseCommonList extends React.Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._renderRight = this._renderRight.bind(this);
        this._rightAction = this._rightAction.bind(this);
        this._newApplyFromContractList = this._newApplyFromContractList.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._handleDatasExt = this._handleDatasExt.bind(this);
        this._onPress = this._onPress.bind(this);
        this._onListContentChangeListener = this._onListContentChangeListener.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
        this._toSearchCustomerPage = this._toSearchCustomerPage.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this._renderNextBtns = this._renderNextBtns.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
        this.state = {
            isLoadingMore: false,
            refreshing: true,
            dataSource: [],
            globalText: '',
            searchPlaceholder: '',
        };
        this.pageIndex = 1;
        this.isPullDown = null;
        this.itemHeight = 0;
        this.listViewContainerHeight = 0;
        this.dataOverScreen = false;
        this.lastFetchReturn = null;
        this.canLoadMore = true;
        this.pageType = this.props.param.pageType;//页面类型
    }

    static propTypes = {
        showSearchBar: React.PropTypes.bool,
    };

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._fetchData();
        });
        CommonFunc.addListenerAndType(this._onListContentChangeListener, this.pageType);
    }

    componentWillUnmount() {
        CommonFunc.removeListenerAndType(this._onListContentChangeListener, this.pageType);
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
        CommonActions.getCommonList({
            pageType: this.pageType,
            pageIndex: this.pageIndex,
            limit: 10,
            ...this.props.param,
            globalText: this.state.globalText,
        }, (responseData) => {
            const curDs = this.state.dataSource;
            const placeholder = responseData.filters;
            let newDatas = responseData.datas;
            this.canLoadMore = newDatas.length != 0;
            newDatas = this._handleListDatas(newDatas);
            this._handleDatasExt(newDatas);
            const newDataSource = this.isPullDown ? newDatas : curDs.concat(newDatas);
            this.pageIndex++;
            this.lastFetchReturn = true;
            const newState = {
                dataSource: newDataSource,
                isLoadingMore: false,
                refreshing: false
            };
            if (!this.state.searchPlaceholder) {
                newState.searchPlaceholder = placeholder;
            }
            this.setState(newState);
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

    _handleDatasExt(datas) {
        const handleDatasExt = this.props.handleDatasExt;
        if (handleDatasExt) {
            handleDatasExt(datas);
        }
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

    _onRefresh() {
        if (this.props.refresh === true) {
            this._onPullRefresh();
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

    _newApplyFromContractList() {
        this.props.navigator.push({
            id: 'CommonChangeList',
            comp: CommonSelectList,
            param: {
                selectParam: {
                    orgid: AppStore.getOrgId(),
                },
                onPress: this.props.onRightListItemPress,
                selectType: this.pageType,
                title: '合同列表',
            }
        });
    }

    _rightAction() {
        dismissKeyboard();
        if (this.props.rightAction) {
            this.props.rightAction();
        } else {
            this._newApplyFromContractList();
        }
    }

    _renderRight() {
        if (!this.props.renderRightFlag) {
            return null;
        }
        if (this.props.renderRight) {
            return this.props.renderRight();
        }
        return (
            <TouchableOpacity
                onPress={this._rightAction}
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
            // const listItemObj = this._handleArr2Obj(itemObj.list_data, 'code');
            // const detailItemData = this._handleArr2Obj(itemObj.detail_data, 'code');
            const listItemObj = CommonFunc.handlePageData(itemObj.list_data, 'code', false);
            const detailItemData = CommonFunc.handlePageData(itemObj.detail_data, 'code', false);
            handledDataArr.push({listData: listItemObj, detailData: detailItemData});
        }
        return handledDataArr;
    }

    _toChangeCustomerInfoPage(itemInfo, editable) {
        this.props.navigator.push({
            id: '',
            comp: '',
            param: {
                title: '转账授权详情',
                id: itemInfo.ID.value,
                contractId: itemInfo.CONTRACT_ID.value,
            }
        });
    }

    _onPress(rowData) {
        if (this.props.onPress) {
            this.props.onPress(rowData);
        } else {
            Alert.alert(this.props.title, '列表条目点击事件、请添加!!!');
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        if (this.props.renderRow) {
            return this.props.renderRow(rowData);
        }
        return (
            <ListItemStyle
                data={rowData}
                renderRow={this.props.renderRow}
                renderRowExt={this.props.renderRowExt}
                visibleFilterFun={this.props.renderFilter}
                onPress={() => this._onPress(rowData)}
            />
        );
    }

    _renderListContent() {
        const renderEmpty = this.state.dataSource.length <= 0 && this.state.refreshing == false;
        if (renderEmpty) {
            return (
                <View style={{flex: 1, justifyContent: 'space-between',}}>
                    <EmptyData
                        style={{flex: 1, backgroundColor: '#F1F2F7',}}
                        refreshStyle={{
                            borderColor: '#F4F4F4', height: 30, marginTop: 20,
                            borderWidth: 1, borderRadius: 5
                        }}
                        textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                        onPress={this._onPullRefresh}
                    />
                    {this._renderNextBtns()}
                </View>
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
                    style={{flex: 1, backgroundColor: '#F1F2F7',}}
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
                    removeClippedSubviews={false}
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
                {this._renderNextBtns()}
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

    _startSearch() {
        this._onPullRefresh();
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

    _renderNextBtns() {
        if (this.props.renderNextBtns) {
            return this.props.renderNextBtns();
        } else {
            return null;
        }
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                goBack={true}
                title={this.props.title}
                rightAction={this._renderRight}
            >
                <StepNumber
                    stepNumber={this.props.param.stepNumber}
                    show={this.props.param.showStepNumber}
                />
                {this._renderSearchContent()}
                {this._renderListContent()}
                {/*{this._renderNextBtns()}*/}
            </NavigationBar>
        );
    }
}