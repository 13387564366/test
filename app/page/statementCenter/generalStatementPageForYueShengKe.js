/**
 * Created by edz on 2017/5/24.
 */
/**
 * Created by cui on 11/2/16.
 */

import React from 'react';
import {
    View,
    Text,
    TextInput,
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
import StatementAction from '../../actions/StatementActions';
import SearchBar from '../../components/searchBar/searchBar';
import CommonStyle from '../../modules/CommonStyle';
import CommonFunc from '../commonStyle/commonFunc';

import EmptyData from '../../components/emptyData/emptyData';

import LoadMoreFooter from '../../components/loadMoreFooter/LoadMoreFooter';
import OptionalModalView from '../../components/optionalModal/optionalModalView';
import DatePicker from 'react-native-datepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import DateHelper from '../../modules/dateHelper';
import OptionListPage from './optionListPage';

import Menu, {
    MenuContext,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

const useLandscape = false; // 是否横屏显示
const WINDOW_WIDTH = useLandscape ? Dimensions.get('window').height: Dimensions.get('window').width;
const WINDOW_HEIGHT = useLandscape ? Dimensions.get('window').width : Dimensions.get('window').height;
// 横屏展示
// const WINDOW_WIDTH = Dimensions.get('window').height;
// const WINDOW_HEIGHT = Dimensions.get('window').width;


const TEXT_MAX_WIDTH = WINDOW_WIDTH * 0.3;
const columnCount = 5; // 暂时、全屏幕最多 8 列展示
const useColumnCount = true; // 显示固定列数
let COLUMN_WIDTH = 110; // 显示全部列，每列固定宽度
if (useColumnCount) {
    COLUMN_WIDTH = WINDOW_WIDTH / columnCount; // 固定列，均分
}
// const COLUMN_WIDTH = 110; // 显示全部列，每列固定宽度
// const COLUMN_WIDTH = WINDOW_WIDTH / columnCount; // 固定列，均分

export default class GeneralStatementPage extends React.Component {

    constructor(props) {
        super(props);
        console.log(props.param);
        this._renderRow = this._renderRow.bind(this);
        this._renderSectionHeader = this._renderSectionHeader.bind(this);
        this._fetch = this._fetch.bind(this);
        this._fetchDataWithCondition = this._fetchDataWithCondition.bind(this);
        this._onEndReach = this._onEndReach.bind(this);
        this._pushToRefresh = this._pushToRefresh.bind(this);
        this._renderHeader = this._renderHeader.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._startSearch = this._startSearch.bind(this);
        this.searchByConditions = this.searchByConditions.bind(this);
        this._renderContentComponent = this._renderContentComponent.bind(this);
        this._renderBarRightBtn = this._renderBarRightBtn.bind(this);
        this._onListItemSelected = this._onListItemSelected.bind(this);
        this._toOptionListPage = this._toOptionListPage.bind(this);
        this._closeModal = this._closeModal.bind(this);
        this._openModal = this._openModal.bind(this);
        this._handleFilterConditions = this._handleFilterConditions.bind(this);
        this._getColumns = this._getColumns.bind(this);
        this._getWidth = this._getWidth.bind(this);
        this.ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.pageIndex = 1;
        this.isPreSearch = !!this.props.param.reportInfo.isPreSearch;
        this.preSearchCondition = '';
        this.conditions = this.props.param.reportInfo.query || [];
        this.filterText = '';

        this.state = {
            sectionArr: [],
            rowArr: [],
            refreshing: false,
            searchText: '',
            isLoadingMore: false,
        };
        this.lastFetchReturn = true;
        this.pullDown = true;
        this.canLoadMore = true;
    }

    componentDidMount() {
        if(useLandscape){
            CommonFunc.lockToLandscape();
        }
        this.filterText = this._handleFilterConditions(this.conditions);
        if (this.isPreSearch) {
            console.log('预查询页面');
            this._emptyPreSearchValues();
            this.refs.OptionalModalView.open();
        } else {
            this._fetch();
        }
    }

    componentWillUnmount() {
        CommonFunc.lockToPortrait();
    }

    _handleFilterConditions(conditions){
        let filterText = '';
        let count = 0;
        conditions.forEach( condition => {
            if(condition.filterType == 'FILTER'){
                filterText += condition.label + '、';
                count++;
            }
        });
        if(count > 0){
            filterText = filterText.replace(/(、$)/g, '');
        }
        return filterText;
    }

    _emptyPreSearchValues() {
        const conditions = this.conditions || [];
        conditions.forEach(condition => {
            if (condition.value) {
                delete condition.value;
            }
        })
    }

    _startSearch() {
        console.log('_startSearch');
        if (this.lastFetchReturn) {
            this.lastFetchReturn = false;
            this.pageIndex = 1;
            this.canLoadMore = true;
            this.pullDown = true;
            this.setState({rowArr: []});
            this._fetch();
        }
    }

    _fetch() {
        this._fetchDataWithCondition(this.isPreSearch);
    }

    _fetchDataWithCondition(preSearch) {
        console.log('_fetchDataWithCondition');
        const searchText = this.state.searchText;
        let selectType = '';

        if(preSearch){
            selectType = this.preSearchCondition ? searchText ? 'second' : 'search' : 'filter';
        }else{
            selectType = 'filter';
        }

        console.log('是否预查询：' + preSearch);
        console.log('搜索类型 - selectType :' + selectType);
        console.log('预查询条件 - preSearchCondition :' + this.preSearchCondition);
        console.log('过滤条件 - searchText :' + searchText);
        console.log('查询分页 - pageIndex : ' + this.pageIndex);


        this.setState({refreshing: true, isLoadingMore: true,});
        console.log(this.props.param)
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchGeneralStatementDataWithCondition({
                id: this.props.param.reportInfo.id_,
                globalText: searchText
            }, (response) => {

                console.log('预查询页面返回了。。。。。。。');

                const pageArr = response.reportdata || [];
                // if (pageArr.length == 0) {
                //     this.canLoadMore = false;
                // }
                // const headers = response.header;
                // const currentRowArr = this.state.rowArr;
                // const newRowArr = this.pullDown ? pageArr : currentRowArr.concat(pageArr);

                const headers = this._handleHeaders(response);
                const newRowArr = pageArr;
                this.canLoadMore = false;

                this.setState({
                    sectionArr: headers,
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

    _handleHeaders(res) {
        const cols = res.reporcolumn || [];
        const colNames = (res.reporcolumname || '').split(',');
        const l = Math.max(Math.min(cols.length, colNames.length), 0);
        const headers = [];
        let tipText = '', label = '';
        for(let i = 0; i< l; i++){
            label = colNames[i];
            headers.push({
                name: cols[i],
                label: label,
                isVisible: true
            });
            tipText += `${tipText ? '、' : ''}${label}`;
        }
        this.filterText = tipText;
        return headers;
    }

    _onEndReach() {
        console.log('lastFetchReturn : ' + this.lastFetchReturn);
        if (this.lastFetchReturn && this.canLoadMore) {
            console.log('_onEndReach');
            this.pullDown = false;
            this.lastFetchReturn = false;
            this._fetch();
        }
    }

    _pushToRefresh() {
        console.log('lastFetchReturn : ' + this.lastFetchReturn);
        if (this.lastFetchReturn) {
            console.log('_pushToRefresh');
            this.pullDown = true;
            this.pageIndex = 1;
            this.lastFetchReturn = false;
            this._fetch();
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
        const columns = this._getColumns();
        return (
            <View
                activeOpacity={0.6}
                style={{height: 30, flexDirection: 'row'}}
            >
                {
                    columns.map((item, i)=> {
                        if (item.isVisible) {
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                        Alert.alert(
                                            '',
                                            '' + rowData[item.name],
                                            [{text: '确定'}]
                                        );
                                    }}
                                >
                                    <View
                                        style={{
                                            width: COLUMN_WIDTH,
                                            height: 30,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            borderWidth: 1,
                                            borderColor: 'gray',
                                            borderLeftWidth: 0,
                                            borderTopWidth: 0,
                                        }}
                                    >
                                        <Text style={{fontSize: 14, width: COLUMN_WIDTH, textAlign: 'center',}}
                                              ellipsizeMode={'tail'} numberOfLines={1}>
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

    // 显示的所有列
    _getColumns() {
        const originCols = this.state.sectionArr || [];
        let count = 0;
        // 全屏幕显示固定列数
        return originCols.filter(item => {
            if(item.isVisible) {
                count++;
                if (!useColumnCount) { // 显示全部列
                    return true;
                } else if (count <= columnCount) { // 显示固定列数
                    return true;
                }
                return false;
            }
            return false
        })
    }

    // 显示的所有列的宽度
    _getWidth() {
        if (useColumnCount) {
            return WINDOW_WIDTH;
        }
        const cols = this._getColumns();
        return COLUMN_WIDTH * cols.length;
    }

    _renderSectionHeader() {
        const columns = this._getColumns();
        const width = this._getWidth();
        return (
            <TouchableOpacity
                activeOpacity={0.6}
                style={[{width: width, height: 30, flexDirection: 'row', backgroundColor: 'gray'}, CommonStyle.backgroundColor]}
            >
                {
                    columns.map((item, i)=> {
                        if (item.isVisible) {
                            return (
                                <View
                                    key={i}
                                    style={{
                                        width: COLUMN_WIDTH, height: 30, justifyContent: 'center',
                                        alignItems: 'center', flexDirection: 'row'
                                    }}
                                >
                                    <Text style={{width: COLUMN_WIDTH - 5, textAlign: 'center',}} ellipsizeMode={'tail'}
                                          numberOfLines={1}>{item.label}</Text>
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
        }

        const width = this._getWidth();

        return (
            <View style={{flex: 1,}}>
                {/*{this._renderSectionHeader()}*/}
                {/*<ScrollView*/}
                    {/*horizontal={true}*/}
                    {/*pagingEnabled={false}*/}
                    {/*automaticallyAdjustContentInsets={false}*/}
                    {/*bounces={false}*/}
                    {/*alwaysBounceHorizontal={false}*/}
                {/*>*/}
                    <View style={{flex: 1,}}>
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
                                width: width
                            }}
                            onEndReached={this._onEndReach}
                            onEndReachedThreshold={50}
                            renderFooter={this._renderFooter}
                            renderHeader={this._renderHeader}
                            style={{width: width,}}
                            dataSource={this.ds.cloneWithRows(this.state.rowArr)}
                            renderRow={this._renderRow}
                            enableEmptySections={true}
                        />
                    </View>

                {/*</ScrollView>*/}
                <View style={{height: Platform.OS === 'ios' ? 0 : 50,}}/>
            </View>
        );
    }

    _renderBarRightBtn() {
        return null;
        return (
            <TouchableOpacity
                style={{alignItems: 'flex-end'}}
                onPress={() => this.refs.OptionalModalView.open()}
            >
                <Icon
                    name="ios-search"
                    size={25}
                    color="#F5F5F5"
                    style={{
                        height: 30,
                        width: 30,
                    }}
                />
            </TouchableOpacity>
        );
    }

    _onValueChanged(conditon, value) {
        conditon['value'] = value;
        // console.log('conditions: ----------------------->');
        // console.log(this.conditions);
        this.setState({});
    }

    isFiledNameNull(filedName) {
        filedName = filedName.replace(/(^\s*)|(\s*$)/g, '');
        return !filedName;
    }

    _renderMenuOption(name, value, i) {
        return (
            <MenuOption value={value} key={i}>
                <View
                    style={{
                        flexDirection: 'row', borderColor: '#2F86D5',
                        borderBottomWidth: 0.5, alignItems: 'center', padding: 10
                    }}
                >
                    <Text>{name}</Text>
                </View>
            </MenuOption>
        );
    }

    _closeModal() {
        this.refs.OptionalModalView.close();
    }

    _openModal() {
        this.refs.OptionalModalView.open();
    }

    _onListItemSelected(condition, value) {
        this._onValueChanged(condition, value);
        this._openModal();
    }

    _toOptionListPage(condition) {
        this._closeModal();
        this.props.navigator.push({
            id: 'OptionListPage',
            comp: OptionListPage,
            param: {
                optionInfo: condition,
                callback: this._onListItemSelected,
            }
        })
    }

    _renderText(condition) {
        let filedName = condition.name || '';
        if (this.isFiledNameNull(filedName)) {
            return null;
        } else {
            return (
                <View style={{
                    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
                    paddingHorizontal: 14, borderBottomColor: 'gray', borderBottomWidth: 1,
                }}>
                    <Text style={{fontSize: 15, width: TEXT_MAX_WIDTH, textAlign: 'right', }} ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.label}</Text>
                    <Text>{' : '}</Text>
                    <TextInput
                        style={{
                            width: 200,
                            height: 60,
                            backgroundColor: 'white',
                        }}
                        underlineColorAndroid={'transparent'}
                        numberOfLines={1}
                        value={condition.value}
                        placeholder='请输入...'
                        onChangeText={ (text) => this._onValueChanged(condition, text)}
                    />
                </View>
            );
        }
    }

    _renderOptionList(condition) {
        let filedName = condition.name || '';
        if (this.isFiledNameNull(filedName)) {
            return null;
        } else {
            // Alert.alert(null, '列表条件。。。。');
            // return null;

            return (
                <View
                    style={{
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 15,
                        paddingHorizontal: 14,
                        borderBottomColor: 'gray', borderBottomWidth: 1,
                    }}>
                    <Text style={{fontSize: 15, width: TEXT_MAX_WIDTH, textAlign: 'right', }} ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.label}</Text>
                    <Text>{' : '}</Text>
                    <Text style={{width: TEXT_MAX_WIDTH,}} ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.value ? condition.value : ''}</Text>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={ () => this._toOptionListPage(condition)}>
                        <View style={{padding: 5, backgroundColor: '#3877bc', borderRadius: 5,}}>
                            <Text style={{fontSize: 15, color: 'white', }}>选择</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );


            return (
                <View style={{
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    paddingVertical: 15,
                    paddingHorizontal: 14,
                    borderBottomColor: 'gray', borderBottomWidth: 1,
                }}>
                    <Text style={{fontSize: 18,}}>{condition.label + ' : '}</Text>
                    <Menu onSelect={(obj) => this._onValueChanged(condition, obj)}>
                        <MenuTrigger customStyles={{backgroundColor: 'red', borderColor: 'red', borderWidth: 1,}}>
                            <View
                                style={{
                                    height: 30, flexDirection: 'row', borderColor: '#2F86D5',
                                    borderWidth: 0.5, borderRadius: 5, alignItems: 'center', paddingHorizontal: 5
                                }}
                            >
                                <Text style={{fontSize: 14, color: '#222'}}>{condition.value}</Text>
                            </View>
                        </MenuTrigger>
                        <MenuOptions
                            optionsContainerStyle={{width: 300, marginTop: 32,}}
                        >
                            {
                                condition.selectList.map((item, i) =>
                                    this._renderMenuOption(item, item, i))
                            }
                        </MenuOptions>
                    </Menu>
                </View>
            );
        }
    }

    _renderDatePicker(condition) {
        let filedName = condition.name || '';
        if (this.isFiledNameNull(filedName)) {
            return null;
        } else {
            value = condition.value;
            value = value ? DateHelper.dfy(value, 'yyyy-mm-dd') : '请选择日期...';
            return (
                <View style={{
                    flexDirection: 'row',
                    paddingVertical: 15,
                    paddingHorizontal: 14,
                    borderBottomColor: 'gray',
                    backgroundColor: 'white',
                    borderBottomWidth: 0.5,
                    alignItems: 'center',
                    borderWidth: 0,
                    borderColor: 'red',
                }}>
                    <Text style={{fontSize: 15, width: TEXT_MAX_WIDTH, textAlign: 'right',}} ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.label}</Text>
                    <Text>{' : '}</Text>
                    <Text style={{
                        marginRight: 10, color: '#126aff', width: TEXT_MAX_WIDTH,
                    }} ellipsizeMode={'tail'}
                          numberOfLines={1}>{value}</Text>
                    <TouchableOpacity style={{borderWidth: 0, borderColor: 'green', }}>
                        <DatePicker
                            style={{flexWrap: 'wrap', borderColor: 'red', borderWidth: 0, width: 30, }}
                            date={condition.value}
                            mode="date"
                            showIcon={true}
                            format="YYYY-MM-DD"
                            minDate="2000-01-01"
                            maxDate="2100-01-01"
                            confirmBtnText="确定"
                            cancelBtnText="取消"
                            customStyles={{
                                dateInput: {
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    height: 40,
                                    borderWidth: 0,
                                    borderColor: 'yellow',
                                },
                                dateText: {
                                    fontSize: 0,
                                    color: 'transparent',
                                },
                                dateTouchBody: {
                                    height: 30,
                                    width: 30,
                                    borderColor: 'blue',
                                    borderWidth: 0,
                                },
                                dateIcon: {
                                    width: 25,
                                    height: 25,
                                    marginLeft: 0,
                                    marginRight: 0
                                },
                            }}
                            onDateChange={(dateStr, date) => this._onValueChanged(condition, date)}
                        />
                    </TouchableOpacity>
                </View>
            );
        }
    }

    _renderCondition(condition) {
        const type = condition.htmlType.toUpperCase();
        switch (type) {
            case 'TEXT':
                return this._renderText(condition);
            case 'COMBOBOX':
                return this._renderOptionList(condition);
            case 'DATE':
            case 'DATERANGE':
                return this._renderDatePicker(condition);
            default:
                return null;
        }
    }

    _renderConditions() {
        const conditions = this.conditions || [];
        const children = [];
        let child = null;
        for (let i = 0; i < conditions.length; i++) {
            let condition = conditions[i];
            if (condition.filterType == 'SEARCH') {
                child = this._renderCondition(condition);
                if (child) {
                    children.push(<View key={i}>{child}</View>);
                }
            }
        }
        return (
            <View style={{}}>

                {children}

            </View>
        );
    }

    searchByConditions() {
        const conditions = this.conditions || [];
        let preSearchCondition = '';
        let jsonForm = {};
        let count = 0;
        let type = '';
        let conditionValue = '';
        let isDate = false;
        conditions.forEach(condition => {
            if (condition.filterType == 'SEARCH') {
                conditionValue = condition.value || '';
                type = condition.htmlType.toUpperCase();
                isDate = condition.htmlType == 'DATE' || condition.htmlType == 'DATERANGE';
                conditionValue = isDate ? conditionValue : conditionValue.replace(/(^\s*)|(\s*$)/g, '');
                if (conditionValue) {
                    let value = '';
                    if (isDate) {
                        value = DateHelper.df(condition.value, 'yyyy-mm-dd');
                    } else {
                        value = condition.value || '';
                    }
                    // preSearchCondition += condition.name + '=' + value;
                    // preSearchCondition += condition.name + '=' + value;
                    jsonForm[condition.name] = value;
                    count++;
                }
            }
        });

        if(count > 0){
            preSearchCondition = JSON.stringify(jsonForm);
        }

        this.refs.OptionalModalView.close();
        console.log('选择条件：' + preSearchCondition);
        this.preSearchCondition = preSearchCondition;
        if (this.lastFetchReturn) {//重新搜索，条件初始化
            this.lastFetchReturn = false;
            this.pullDown = true;
            this.pageIndex = 1;
            this._fetch();
        }
    }

    _renderModalView() {
        return (
            <View
                style={{
                    paddingTop: 100,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: WINDOW_WIDTH,
                    height: WINDOW_HEIGHT,
                    backgroundColor: 'rgba(0.5,0.5,0.5,0.5)',
                }}
            >
                <MenuContext style={{}}>
                    <View style={{
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        paddingVertical: 15,
                        justifyContent: 'center',
                        borderTopRightRadius: 10,
                        borderTopLeftRadius: 10,
                        borderBottomColor: 'gray',
                        borderBottomWidth: 1,

                    }}
                    >
                        <Text style={{fontSize: 18, flex: 1, textAlign: 'center', borderColor: 'red',
                            borderWidth: 0,}}>预查询条件</Text>
                    </View>
                    {this._renderConditions()}
                    <View style={{
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        borderBottomRightRadius: 10,
                        borderBottomLeftRadius: 10,
                    }}>
                        <TouchableOpacity style={{flex: 1, borderBottomLeftRadius: 10,}}
                                          activeOpacity={0.6} onPress={() => this.searchByConditions()}>
                            <View style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 15,
                                borderBottomLeftRadius: 10,
                            }}>
                                <Text style={{fontSize: 18, color: '#126aff',}}>确定</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{width: 0.5, backgroundColor: 'gray',}}/>
                        <TouchableOpacity style={{flex: 1, borderBottomRightRadius: 10,}} activeOpacity={0.6}
                                          onPress={() => this.refs.OptionalModalView.close()}>
                            <View style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 15,
                            }}>
                                <Text style={{fontSize: 18, color: '#126aff',}}>取消</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </MenuContext>
            </View>
        );
    }

    _renderOptionalModalView() {
        return (
            <OptionalModalView
                ref="OptionalModalView"
                dataSource={[]}
                clickOnPress={ () => {
                }}
                onRequestClose={
                    () => {
                    }
                }
                renderContentView={
                    () => this._renderModalView()
                }
                backgroundColor='#3d3361'
            />
        );
    }

    render() {
        const title = this.props.param.reportInfo.name_
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={title}
                goBack={true}
                rightAction={this._renderBarRightBtn}
                isLandscape={useLandscape}
            >
                <SearchBar
                    inputStyle={{borderRadius: 5, height: 50, backgroundColor: '#F1F2F7'}}
                    backgoundColor="#F1F2F7"
                    onSearchChange={(text) => {
                        let searchText = text.nativeEvent ? text.nativeEvent.text : text;
                        this.setState({searchText: searchText})
                    }
                    }
                    startSearch={() => this._startSearch()}
                    height={40}
                    value={this.state.searchText}
                    onFocus={() => console.log('On Focus')}
                    onBlur={() => console.log('On Blur')}
                    placeholder={this.filterText}
                    autoCorrect={false}
                    padding={5}
                    returnKeyType={'search'}
                />
                {this._renderContentComponent()}
                {this._renderOptionalModalView()}
            </NavigationBar>
        );
    }
}

