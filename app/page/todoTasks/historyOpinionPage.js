/**
 * Created by Administrator on 2016/11/15.
 */
import React, {Component} from 'react';
import {
    ListView,
    View,
    Text,
    Dimensions,
    Alert,
    Image,
    ScrollView,
    RefreshControl,
    InteractionManager,
    Platform,
} from 'react-native';

import TodoTaskActions from '../../actions/FlowActions';
import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import EmptyData from '../../components/emptyData/emptyData';
import NavigationBar from '../../components/navigator/NavBarView';
import CommonStyle from '../../modules/CommonStyle';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const ITEM_WIDTH = (WINDOW_WIDTH - 14 * 2);
const ITEM_HEIGHT = (WINDOW_WIDTH - 14 * 2);
const TEXT_ITEM_PADDING = 14;

export default class ApproveOpinion extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: [],
            isLoadingMore: false,
            refreshing: false,
        };
        this.pageIndex = 1;
        this.canLoadMore = true;
        this.isPullDown = true;
        this.lastFetchReturn = null;
        this.isCreditInfo = !!this.props.param.isCreditInfo;
    }

    _handleData(originalDatas) {
        let handledDatas = [];
        originalDatas.forEach(item => {
            let oneOpinion = {};
            let detail = item.dataElements || [];
            detail.forEach(field => {
                let code = field.code.toLowerCase();
                oneOpinion[code] = field;
            });
            handledDatas.push(oneOpinion);
        });
        return handledDatas;
    }

    _fetchData() {
        TodoTaskActions.getHistoryOpinion({
            serialNo: this.props.param.serialNo,
            // objectNo: this.props.param.objectNo,
            pageIndex: this.pageIndex,
            limit: 20,
        }, (response) => {
            let datas = response.historyOpinion || [];
            const curDs = this.state.dataSource || [];
            if (datas.length === 0) this.canLoadMore = false;
            let handledDatas = this._handleData(datas);
            let newDataSource = this.isPullDown ? handledDatas : curDs.concat(handledDatas);
            this.pageIndex++;
            this.lastFetchReturn = true;
            this.setState({
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

    componentDidMount() {
        this._fetchData();
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
            this.isPullDown = true;
            this.lastFetchReturn = false;
            this._fetchData();
        }
    }

    _renderFooter() {
        if (this.state.isLoadingMore) {
            return <LoadMoreFooter style={{flex: 1,}}/>
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
        let title = rowData.phasename.display + ': ' + rowData.phasename.value;
        let name = rowData.username.display + ': ' + rowData.username.value;
        let time = rowData.endtime.display + ': ' + rowData.endtime.value;
        return (
            <View
                style={{
                    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'white',
                    flexDirection: 'column', borderBottomColor: '#e9e9e9',
                    borderBottomWidth: 1,
                }}
            >
                <View>
                    <Text numberOfLines={1} ellipsizeMode={'tail'}
                          style={{
                              width: WINDOW_WIDTH - 14 * 2,
                              color: '#222',
                          }}>{title}</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',}}>
                    <Text style={{backgroundColor: 'transparent', fontSize: 12,}}>{name}</Text>
                </View>
                <View style={{flexDirection: 'column',}}>
                    <Text style={{fontSize: 12,}}>{time}</Text>
                </View>
                <View style={{flexDirection: 'row', width: WINDOW_WIDTH - 14 * 2,}}>
                    <Text style={{fontSize: 12,}}>{'意见: '}</Text>
                    {this._getProcessedAdvise(rowData.phaseopinion.value)}
                </View>
            </View>
        );
    }

    _getProcessedAdvise(processedAdvise) {
        if (processedAdvise === '') {
            return null;
        } else {
            return (
                <Text
                    style={{fontSize: 12, color: '#999999', flex: 1}}
                >
                    {processedAdvise}
                </Text>
            );
        }
    }

    _renderEmpty() {
        return (
            <EmptyData
                style={[{flex: 1, backgroundColor: '#F0F0F0',}, CommonStyle.backgroundColor]}
                refreshStyle={{
                    borderColor: '#F4F4F4', height: 30, marginTop: 20,
                    borderWidth: 1, borderRadius: 5
                }}
                textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                onPress={() => this._fetchData()}
            />
        );
    }

    _renderContent() {
        if (this.state.dataSource.length <= 0) {
            return this._renderEmpty();
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
                    style={[{flex: 1, backgroundColor: '#E7E7E7',}, CommonStyle.backgroundColor]}
                    dataSource={this.ds.cloneWithRows(this.state.dataSource)}
                    renderRow={this._renderRow}
                    automaticallyAdjustContentInsets={false}
                    enableEmptySections={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    initialListSize={20}
                    pageSize={20}
                    onEndReachedThreshold={100}
                    scrollRenderAheadDistance={1000}
                />
            </View>
        );
    }

    render() {
        if (this.props.fromCompleted) {
            return this._renderContent();
        } else {
            return (
                <NavigationBar
                    title={'历史意见'}
                    goBack={true}
                    navigator={this.props.navigator}
                >
                    {this._renderContent()}
                </NavigationBar>
            );
        }
    }
}