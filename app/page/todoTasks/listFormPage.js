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
import ListFormPageDetails from './listFormPageDetails';
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
import ListFormPage2 from './listFormPage';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const TEXT_ITEM_PADDING = 14;
import {
    GROUP_DISPLAY_KEY,
    PAGE_IS_LIST_KEY,
    PAGE_ID_KEY,
    PARAMS_ARR_KEY,
} from './menuHandler';

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
});

export default class ListFormPage extends React.Component {
    constructor(props) {
        super(props);
        this._renderContent = this._renderContent.bind(this);
        this._renderListRow = this._renderListRow.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
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

    componentDidMount () {
        InteractionManager.runAfterInteractions(() => {
            this._fetchData();
        });
    }

    _getFiled (datas, filedName) {
        let filedVal = '';
        datas.forEach(filed => {
            if (filed.code == filedName) {
                filedVal = filed.value;
            }
        });
        return filedVal;
    }

    _fetchGroupDetail () {
        this._fetchData();
    }

    _getFormPageParams () {
        const pageParam = this.props.param;
        const ret = {
            pageType: pageParam.pageType,
            postParam: pageParam.postParam,
        };
        return ret;
    }

    _fetchData () {
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
    _onEndReach () {
        if (!this.dataOverScreen) {
            return;
        }
        if (this.canLoadMore && this.pageIndex !== 1 && this.lastFetchReturn == true) {
            this.lastFetchReturn = false;
            this.isPullDown = false;
            this.setState({isLoadingMore: true, })
            this._fetchGroupDetail();
        }
    }

    // 下拉刷新
    _onPullRefresh () {
        if (this.lastFetchReturn) {
            this.canLoadMore = true;
            this.currentDataSource = new Array();
            this.pageIndex = 1;
            this.isPullDown = true;
            this.lastFetchReturn = false;
            this._fetchGroupDetail();
        }
    }

    _renderFooter () {
        if (this.state.isLoadingMore) {
            return <LoadMoreFooter style={{width: WINDOW_WIDTH, }} />
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

    _getValueByKey (listData, key = '') {
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

    _onListItemPress (rowData, rowId) {
        const detailPageInfoList = this.props.param.detailPageInfo;
        if (detailPageInfoList == undefined) {return }
        const prevDepth = this.props.param.listDepth || 1;
        const isFromList = this.props.param.isFromList;
        if (detailPageInfoList.length > 1) {
            this.props.navigator.push({
                id: 'ListFormPageDetails',
                comp: ListFormPageDetails,
                param: {
                    ...this.props.param,
                    listData:rowData.listData,
                    title: this.props.param.title + '详情',
                }
            })
        } else if (detailPageInfoList.length == 1) {
            const detailPageInfo = detailPageInfoList[0];
            let isList = detailPageInfo[PAGE_IS_LIST_KEY];
            const listDepth = isList ? (prevDepth + 1) : '';
            const Comp = isList ? ListFormPage2 : FormDetailPage;
            const displayName = detailPageInfo[GROUP_DISPLAY_KEY];
            const postParam = Object.assign({}, this.props.param.postParam);
            const paramKeys = detailPageInfo[PARAMS_ARR_KEY];
            const listData = rowData.listData;
            CommonFunc.handlePostParam(postParam, paramKeys,listData);
            postParam.pageId = detailPageInfo[PAGE_ID_KEY];
            const param = {
                postParam: postParam,
                title: displayName,
            };
            if (isList) {
                const nextPageInfo = detailPageInfo.detailPageInfo;
                const dowoloadable = detailPageInfo.downloadable;
                const downloadParam = detailPageInfo.downloadParam;
                param.downloadable = dowoloadable;
                param.downloadParam = downloadParam;
                param.listDepth = listDepth;
                param.detailPageInfo = nextPageInfo;
            }
            this.props.navigator.push({
                id: '' + Comp,
                comp: Comp,
                param: param,
            });
        }
    }

    _filterDownloadField (colname, widgetInfo, listData) {
        const downloadable = this.props.param.downloadable;
        if (!downloadable) {
            return false;
        } else {
            const downloadParam = this.props.param.downloadParam;
            const onClickKey = downloadParam.onClickKey || '';
            return colname.toString().toLowerCase() == onClickKey.toString().toLowerCase();
        }
    }

    _downloadFile (downloadId, fileName, fileSize) {
        // CommonFunc.downloadFile(downloadId, true);
        FSManager.downloadOrOpenFile(downloadId, fileSize, fileName);
    }

    _renderDownloadFileNameLine (name, value, key, downloadId, fileName, fileSize) {
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
                <TouchableOpacity style={{flex: 1}} onPress={() => this._downloadFile(downloadId, fileName, fileSize)}>
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

    _renderDownloadItem (colname, widgetInfo, listData) {
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
    _renderContent () {
        if (this.state.dataSource.length <= 0) {
            return (
                <EmptyData
                    style={[{flex: 1, backgroundColor: '#F0F0F0', }, CommonStyle.backgroundColor]}
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
            <CommonList
                datas={this.state.datas}
                onPress={this._onListItemPress}
                renderLineItemFilter={this._filterDownloadField}
                renderLineItem={this._renderDownloadItem}
            />
        );
    }

    _setDataOverListView () {
        this.dataOverScreen = this.state.dataSource.length * this.itemHeight > this.listViewContainerHeight;
    }

    render () {
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