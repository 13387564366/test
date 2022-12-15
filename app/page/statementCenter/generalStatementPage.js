/**
 * Created by cui on 11/2/16.
 */

import React from 'react';
import {
    View,
    Text,
    Alert,
    ListView,
    Image,
    ScrollView,
    RefreshControl,
    Dimensions,
    TouchableOpacity,
    InteractionManager,
    Platform,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import StatementAction from '../../actions/statementActions';
import SearchBar from '../../components/searchBar/searchBar';
import CommonStyle from '../../modules/CommonStyle';

import EmptyData from '../../components/emptyData/emptyData';

import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const ITEM_WIDTH = 110;

export default class GeneralStatementPage extends React.Component {

    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._renderSectionHeader = this._renderSectionHeader.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._pushToRefresh = this._pushToRefresh.bind(this);
        this._renderHeader = this._renderHeader.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._startSearch = this._startSearch.bind(this);
        this._renderContentComponent = this._renderContentComponent.bind(this);
        this.ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.pageIndex = 1;
        this.state = {
            sectionArr: [],
            rowArr: [],
            refreshing: false,
            searchText: '',
            isLoadingMore: false,
        };
        this.lastFetchReturn = null;
        this.pullDown = true;
        this.canLoadMore = true;
    }

    componentDidMount() {
        this._fetchData();
    }

    _startSearch(){
        if(this.lastFetchReturn){
            this.lastFetchReturn = false;
            this.pageIndex = 1;
            this.canLoadMore = true;
            this.pullDown = true;
            this.setState({rowArr: []});
            this._fetchData(this.state.searchText);
        }
    }

    _fetchData() {
        const searchText = this.state.searchText;
        this.setState({refreshing: true, isLoadingMore: true,});
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchGeneralStatementData({
                start: this.pageIndex,
                globalText: searchText,
                reportId: this.props.param.reportId
            }, (response) => {

                const pageArr = response.body.datas || [];
                if (pageArr.length == 0) {
                    this.canLoadMore = false;
                }
                const currentRowArr = this.state.rowArr;
                const newRowArr = this.pullDown ? pageArr : currentRowArr.concat(pageArr);

                console.log('pageIndex: ' + this.pageIndex);
                console.log('pullDown: ' + this.pullDown);
                console.log('rowCounts: ' + currentRowArr.length + '---->' + newRowArr.length);

                this.setState({
                    sectionArr: response.body.header,
                    rowArr: newRowArr,
                    refreshing: false,
                    isLoadingMore: false,
                });
                this.lastFetchReturn = true;
                this.pageIndex++;
            }, (error) => {
                this.lastFetchReturn = true;
                this.setState({refreshing: false, isLoadingMore: false,});
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        });
    }

    _onEndReach() {
        console.log('lastFetchReturn : ' + this.lastFetchReturn);
        if (this.lastFetchReturn && this.canLoadMore) {
            console.log('_onEndReach');
            this.pullDown = false;
            this.lastFetchReturn = false;
            this._fetchData();
        }
    }

    _pushToRefresh() {
        console.log('lastFetchReturn : ' + this.lastFetchReturn);
        if (this.lastFetchReturn) {
            console.log('_pushToRefresh');
            this.pullDown = true;
            this.pageIndex = 1;
            this.lastFetchReturn = false;
            this._fetchData();
        }
    }

    _renderFooter() {
        return null;
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

    _renderHeader() {
        return null;
        if (this.state.isLoadingMore) {
            return <LoadMoreFooter style={{width: WINDOW_WIDTH,}}/>
        } else {
            return <View />
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <View
                activeOpacity={0.6}
                style={{height: 30, flexDirection: 'row'}}
            >
                {
                    this.state.sectionArr.map((item, i)=> {
                        if (item.isVisible) {
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                        Alert.alert(
                                            '查看',
                                            '' + rowData[item.name],
                                            [{text: '确定'}]
                                        );
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 110,
                                            height: 30,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            borderWidth: 0.5,
                                            borderColor: 'gray'
                                        }}
                                    >
                                        <Text style={{fontSize: 14, width: 100, textAlign: 'center'}} ellipsizeMode={'tail'} numberOfLines={1}>
                                            {rowData[item.name]}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        } else {
                            <View />
                        }
                    })
                }
            </View>
        );
    }

    _renderSectionHeader() {
        return (
            <TouchableOpacity
                activeOpacity={0.6}
                style={[{height: 30, flexDirection: 'row', backgroundColor: 'gray'}, CommonStyle.backgroundColor]}
            >
                {
                    this.state.sectionArr.map((item, i)=> {
                        if (item.isVisible) {
                            return (
                                <View
                                    key={i}
                                    style={{
                                        width: 110, height: 30, justifyContent: 'center',
                                        alignItems: 'center', flexDirection: 'row'
                                    }}
                                >
                                    <Text style={{width: 100,}} ellipsizeMode={'tail'} numberOfLines={1}>{item.label}</Text>
                                </View>
                            );
                        } else {
                            return <View />;
                        }
                    })
                }
            </TouchableOpacity>
        )
    }

    _renderContentComponent() {
        if (this.state.rowArr.length <= 0) {
            return (
                <EmptyData
                    style={{flex: 1, backgroundColor: '#F0F0F0',}}
                    refreshStyle={{
                        borderColor: '#F4F4F4', height: 30, marginTop: 20,
                        borderWidth: 1, borderRadius: 5
                    }}
                    textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                    onPress={() => this._pushToRefresh()}
                />
            );
            return (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'flex-start'
                    }}
                >
                    <Image
                        style={{
                            width: WINDOW_WIDTH,
                            resizeMode: 'contain',
                            marginTop: WINDOW_HEIGHT * 0.1,
                        }}
                        version="1"
                        source={require('../../image/empty.png')}
                    />
                </View>
            );
        }

        const headerCounts = this.state.sectionArr.length;
        const allHeaderWidth = headerCounts * ITEM_WIDTH;
        const width = WINDOW_WIDTH > allHeaderWidth ? WINDOW_WIDTH : allHeaderWidth;

        return (
            <View style={{flex: 1,}}>
                {/*{this._renderSectionHeader()}*/}
                <ScrollView
                    horizontal={true}
                    pagingEnabled={false}
                    automaticallyAdjustContentInsets={false}
                    bounces={false}
                    alwaysBounceHorizontal={false}
                >
                    <View style={{width: width,}}>
                        {this._renderSectionHeader()}
                        <ListView
                            refreshControl={
                                <RefreshControl
                                    enabled={true}
                                    refreshing={this.state.refreshing}
                                    onRefresh={ this._pushToRefresh }
                                    tintColor="#cc0"
                                    title="正在加载中……"
                                    color="#ccc"
                                />}
                            contentContainerStyle={{
                                width: width,
                            }}
                            onEndReached={this._onEndReach}
                            onEndReachedThreshold={500}
                            renderFooter={this._renderFooter}
                            renderHeader={this._renderHeader}
                            style={{width: width,}}
                            dataSource={this.ds.cloneWithRows(this.state.rowArr)}
                            renderRow={this._renderRow}
                            enableEmptySections={true}
                        />
                    </View>

                </ScrollView>
                <View style={{height: Platform.OS === 'ios' ? 0 : 50,}}/>
            </View>
        );
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={this.props.param.title}
                goBack={true}
            >
                <SearchBar
                    inputStyle={{borderRadius: 5, height: 50, backgroundColor: '#e7e7e7'}}
                    backgoundColor="#c4c4c4"
                    onSearchChange={(text) => this.setState({searchText: text})}
                    startSearch={() => this._startSearch()}
                    height={40}
                    value={this.state.searchText}
                    onFocus={() => console.log('On Focus')}
                    onBlur={() => console.log('On Blur')}
                    placeholder={'搜索...'}
                    autoCorrect={false}
                    padding={5}
                    returnKeyType={'search'}
                />
                {this._renderContentComponent()}
                {/*<ScrollView*/}
                {/*refreshControl={*/}
                {/*<RefreshControl*/}
                {/*enabled={true}*/}
                {/*refreshing={this.state.refreshing}*/}
                {/*onRefresh={ this._fetchData }*/}
                {/*tintColor="#cc0"*/}
                {/*title="正在加载中……"*/}
                {/*color="#ccc"*/}
                {/*/>*/}
                {/*}*/}
                {/*>*/}
                {/*<ScrollView*/}
                {/*horizontal={true}*/}
                {/*pagingEnabled={false}*/}
                {/*automaticallyAdjustContentInsets={false}*/}
                {/*bounces={false}*/}
                {/*alwaysBounceHorizontal={false}*/}
                {/*>*/}
                {/*{this._renderContentComponent()}*/}
                {/*</ScrollView>*/}
                {/*</ScrollView>*/}
            </NavigationBar>
        );
    }
}

