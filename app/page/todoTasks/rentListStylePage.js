/**
 * Created by edz on 2017/2/15.
 */

import React from 'react';

import {
    ListView,
    View,
    Text,
    Image,
    Dimensions,
    Alert,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    InteractionManager,
    Platform,
    ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome'
import TodoTaskActions from '../../actions/FlowActions';
import EmptyData from '../../components/emptyData/emptyData'
import NavigationBar from '../../components/navigator/NavBarView'
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import FormDetailPage from './formDetailPage';
import CommonFunc from '../commonStyle/commonFunc';
import FSManager from '../../modules/fsManager';
import CommonList from '../commonStyle/commonList';
import CommonStyle from '../../modules/CommonStyle';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const TEXT_ITEM_PADDING = 14;
const GROUP_DISPLAY_KEY = 'menuName';
const PAGE_ID_KEY = 'pageId';
const PARAMS_ARR_KEY = 'pageParams';

const styles = StyleSheet.create({
    keyStyle: {
        color: '#000',
        fontSize: 14,
    },
    valueStyle: {
        flex: 1,
        color: '#3877bc',
        textAlign: 'right',
        fontSize: 15,
    },
    tableLine: {
        flexDirection: 'row',
        width: WINDOW_WIDTH,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7F0',
    },
    tableItem: {
        flex: 1, textAlign: 'center',
    }
});

export default class TableListStylePage extends React.Component {
    constructor(props) {
        super(props);
        this._renderContent = this._renderContent.bind(this);
        this._renderListRow = this._renderListRow.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._toListDetailPage = this._toListDetailPage.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._fetchGroupDetail = this._fetchGroupDetail.bind(this);
        this._setDataOverListView = this._setDataOverListView.bind(this);
        this._onListItemPress = this._onListItemPress.bind(this);
        this._filterDownloadField = this._filterDownloadField.bind(this);
        this._renderDownloadItem = this._renderDownloadItem.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.pageIndex = 1;
        this.pageArray = new Array();
        this.canLoadMore = true;
        this.currentDataSource = new Array;
        this.isPullDown = null;

        this.itemHeight = 0;
        this.listViewContainerHeight = 0;
        this.dataOverScreen = false;

        this.lastFetchReturn = null;

        this.state = {
            datas: [],
            dataSource: [],
            isLoadingMore: false,
            refreshing: false,
            title: this.props.param.title || '详情',
        };
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._fetchData();
        });
    }

    _getFiled(datas, filedName) {
        let filedVal = '';
        datas.forEach(filed => {
            if (filed.code == filedName) {
                filedVal = filed.value;
            }
        });
        return filedVal;
    }

    _fetchGroupDetail() {
        this._fetchData();
    }

    _getFormPageParams() {
        const pageParam = this.props.param;
        const ret = {
            pageType: pageParam.pageType,
            postParam: pageParam.postParam,
        };
        return ret;
    }

    _fetchData() {
        const postParam = this.props.param.postParam || {};
        const params = {
            ...postParam,
            pageIndex: this.pageIndex,
            limit: 1000,
        };
        TodoTaskActions.getCommonFormInfo(params, (response) => {
            let datas = response.datas || [];
            this.pageArray = datas.length > 0 ? datas : [];
            this.currentDataSource = this.state.dataSource || [];
            if (this.pageArray.length === 0) this.canLoadMore = false;
            let newDataSource = this.isPullDown ? this.pageArray : this.currentDataSource.concat(this.pageArray);
            this.pageArray = [];
            this.pageIndex++;
            this.lastFetchReturn = true;
            this.setState({
                datas: datas,
                dataSource: newDataSource,
                isLoadingMore: false,
                refreshing: false,
            });
        }, (error) => {
            this.lastFetchReturn = true;
            this.setState({
                isLoadingMore: false,
                refreshing: false,
            });
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    // 上拉加载
    _onEndReach() {
        if (!this.dataOverScreen) {
            return;
        }
        if (this.canLoadMore && this.pageIndex !== 1 && this.lastFetchReturn == true) {
            this.lastFetchReturn = false;
            this.isPullDown = false;
            this.setState({isLoadingMore: true,})
            this._fetchGroupDetail();
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
            this._fetchGroupDetail();
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

    _renderRow(rowData, sectionID, rowID) {
        let list = rowData.list_data || [];
        let length = list.length;
        let pageArr = [];
        const itemWidth = WINDOW_WIDTH - 2 * TEXT_ITEM_PADDING - 25;
        for (let i = 0; i < length; i++) {
            let child = this._renderListRow(list[i], i);
            let itemContainer = (
                <View key={i}>
                    {child}
                </View>);
            pageArr.push(itemContainer);
        }
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={ () => {
                this._toListDetailPage(rowData, rowID)
            }}>
                <View
                    style={{
                        margin: 2,
                        backgroundColor: 'white',
                        width: WINDOW_WIDTH,
                        paddingHorizontal: TEXT_ITEM_PADDING,
                        paddingVertical: 5,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: '#cccccc'
                    }}
                    onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        this.itemHeight = layout.height;
                        this._setDataOverListView();
                    }}
                >
                    <View style={{width: itemWidth,}}>
                        {pageArr}
                    </View>
                    <Icon name={'angle-right'} size={25} color={'#666666'}/>
                </View>
            </TouchableOpacity>);
    }

    _renderListRow(itemListData, i) {
        if (i == 0) {
            return (<Text ellipsizeMode={'tail'} numberOfLines={1} style={{
                fontSize: 16,
                color: '#333333'
            }}>{itemListData.display + ' : ' + itemListData.value}</Text>);
        } else {
            return (<Text ellipsizeMode={'tail'} numberOfLines={1} style={{
                fontSize: 14,
                color: '#666666',
                marginTop: 2,
            }}>{itemListData.display + ' : ' + itemListData.value}</Text>);
        }
    }

    _handlePostParam(postParam, paramKeys, listData) {
        paramKeys.forEach(paramKey => {
            const temp = this._getValueByKey(listData, paramKey);
            if (temp) {
                postParam[paramKey] = temp;
            }
        });
    }

    _getValueByKey(listData, key = '') {
        let value = null;
        const lowerKey = key.toLowerCase();
        for (let listKey in listData) {
            const tempKey = listKey.toString().toLowerCase();
            if (lowerKey == tempKey) {
                value = CommonFunc.getValueByKeyArr(listData, [listKey, 'itemno']);
            }
        }
        return value;
    }

    _toListDetailPage(itemData, rowId) {
        const detailPageInfo = this.props.param.detailPageInfo;
        if (detailPageInfo) {
            const displayName = detailPageInfo[GROUP_DISPLAY_KEY];
            const prevPostParam = this.props.param.postParam || {};
            const postParam = {
                ...prevPostParam,
            };
            const listData = CommonFunc.handleArr2Obj(itemData.list_data);
            CommonFunc.handlePostParam(postParam, detailPageInfo[PARAMS_ARR_KEY], listData);
            postParam.pageId = detailPageInfo[PAGE_ID_KEY];
            this.props.navigator.push({
                id: 'FormDetailPage',
                comp: FormDetailPage,
                param: {
                    postParam: postParam,
                    title: displayName,
                }
            });
        }
    }

    _onListItemPress(rowData, rowId) {
        return;
        const detailPageInfo = this.props.param.detailPageInfo;
        if (detailPageInfo) {
            const displayName = detailPageInfo[GROUP_DISPLAY_KEY];
            const postParam = {};
            const listData = rowData.listData;
            this._handlePostParam(postParam, detailPageInfo[PARAMS_ARR_KEY], listData);
            postParam.pageId = detailPageInfo[PAGE_ID_KEY];
            this.props.navigator.push({
                id: 'FormDetailPage',
                comp: FormDetailPage,
                param: {
                    postParam: postParam,
                    title: displayName,
                }
            });
        }
    }

    _filterDownloadField(colname, widgetInfo, listData) {
        const downloadable = this.props.param.downloadable;
        if (!downloadable) {
            return false;
        } else {
            const downloadParam = this.props.param.downloadParam;
            const onClickKey = downloadParam.onClickKey || '';
            return colname.toString().toLowerCase() == onClickKey.toString().toLowerCase();
        }
    }

    _downloadFile(downloadId, fileName, fileSize) {
        // CommonFunc.downloadFile(downloadId, true);
        FSManager.downloadOrOpenFile(downloadId, fileSize, fileName);
    }

    _renderDownloadFileNameLine(name, value, key, downloadId, fileName, fileSize) {
        return (
            <View
                key={key}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 5,
                    flex: 1,
                }}>
                <Text
                    style={styles.keyStyle}
                >
                    {name}
                </Text>
                <TouchableOpacity style={{flex: 1}} onPress={()=>this._downloadFile(downloadId, fileName, fileSize)}>
                    <Text
                        style={styles.valueStyle}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                    >
                        {value}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    _renderDownloadItem(colname, widgetInfo, listData) {
        const downloadParam = this.props.param.downloadParam;
        const downloadIdKey = downloadParam.downloadIdKey;
        const fileNameKey = downloadParam.fileNameKey;
        const fileSizeKey = downloadParam.fileSizeKey;
        const display = widgetInfo.display;
        const value = widgetInfo.value;
        const downloadId = CommonFunc.getValueByKeyArr(listData, [downloadIdKey, 'itemno']);
        const fileName = CommonFunc.getValueByKeyArr(listData, [fileNameKey, 'itemno']);
        const fileSize = CommonFunc.getValueByKeyArr(listData, [fileSizeKey, 'itemno']);
        return this._renderDownloadFileNameLine(display, value, colname, downloadId, fileName, fileSize);
    }

    _getHeaders(datas = []) {
        const ids = [], displays = [], length = 0;
        if (datas.length > 0) {
            const list_data = datas[0].list_data;
            list_data.forEach(item => {
                const isVisible = CommonFunc.isItemVisible(item);
                if (isVisible) {
                    ids.push(CommonFunc.getValueByKeyArr(item, ['colname']));
                    displays.push(CommonFunc.getValueByKeyArr(item, ['display']));
                }
            });
        }
        const ret = {ids: ids, displays: displays, length: ids.length};
        return ret;
    }

    _renderTabRow(ids, rowData, sectionID, rowID) {
        let listData = rowData.listData;
        const itemWidth = WINDOW_WIDTH - 2 * TEXT_ITEM_PADDING - 25;
        const content = ids.map((id, i)=> {
            const val = CommonFunc.getValue(listData, id);
            return (<Text key={'item-' + rowID + '-' + i} style={styles.tableItem}>{val}</Text>);
        });

        return (
            <View
                key={'line-' + rowID}
                style={styles.tableLine}
            >
                {content}
            </View>
        );
    }

    _renderTableTitle(headers) {
        const content = headers.map((item, i)=> {
            return (
                <Text
                    key={i}
                    style={styles.tableItem}
                >
                    {item}
                </Text>
            );
        });
        return (
            <View
                style={styles.tableLine}
            >
                {content}
            </View>
        );
    }

    _renderContent() {
        const dataCount = this.state.datas.length;
        if (dataCount <= 0) {
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
        const {ids, displays, length} = this._getHeaders(this.state.datas);
        return (
            <ScrollView>
                <View>
                    {this._renderTableTitle(displays)}
                    <CommonList
                        inInnerList={false}
                        style={{backgroundColor: 'white',}}
                        datas={this.state.datas}
                        onPress={this._onListItemPress}
                        renderLineItemFilter={this._filterDownloadField}
                        renderLineItem={this._renderDownloadItem}
                        renderRow={(a, b, c)=>this._renderTabRow(ids, a, b, c)}
                    />
                </View>
            </ScrollView>
        );
    }

    _setDataOverListView() {
        this.dataOverScreen = this.state.dataSource.length * this.itemHeight > this.listViewContainerHeight;
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                goBack={true}
                title={this.state.title}
                contentMarginBottom={24}
            >
                {this._renderContent()}
            </NavigationBar>
        );
    }
}