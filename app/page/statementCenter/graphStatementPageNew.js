/**
 * Created by cui on 11/3/16.
 */

import React, {Component} from 'react'
import {
    StyleSheet,
    View,
    Text,
    Alert,
    ScrollView,
    ListView,
    Platform,
    Dimensions,
    InteractionManager,
    processColor,
    TouchableOpacity,
} from 'react-native';

// import Chart from 'react-native-chart';
import Chart from '../../components/chart/Chart';
import NavigationBar from '../../components/navigator/NavBarView';
import StatementAction from '../../actions/statementActions';
import EmptyData from '../../components/emptyData/emptyData';
import AppStore from '../../stores/AppStore';

// import {LineChart, BarChart, PieChart} from 'react-native-charts-wrapper';
import LineChart from '../../components/charts/lineChart';
import BarChart from '../../components/charts/barChart';
import PieChart from '../../components/charts/pieChart';

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

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const chartHeight = WINDOW_HEIGHT * 0.7;
const TEXT_MAX_WIDTH = WINDOW_WIDTH * 0.3 ;
const borderWidth = 0;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    chart: {
        width: WINDOW_WIDTH - 50,
        height: 200,
    }
});

// const data = [ [2016, 1], [2017, 3], ['中文', '7'], ['日期', 9], ['日期', 9], ['日期', 9], ['日期', 9] ];
const CHART_WIDTH = WINDOW_WIDTH - 50;

class GraphStatementPage extends Component {

    constructor(props) {
        console.log('屏幕宽度：' + WINDOW_WIDTH);
        console.log('屏幕宽度：' + WINDOW_HEIGHT);
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._emptyData = this._emptyData.bind(this);
        this.searchByConditions = this.searchByConditions.bind(this);
        this._renderBarRightBtn = this._renderBarRightBtn.bind(this);
        this._onValueChanged = this._onValueChanged.bind(this);
        this._onListItemSelected = this._onListItemSelected.bind(this);
        this._toOptionListPage = this._toOptionListPage.bind(this);
        this._closeModal = this._closeModal.bind(this);
        this._openModal = this._openModal.bind(this);
        this.ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.isPreSearch = !!this.props.param.graphInfo.isPreSearch;
        this.preSearchCondition = '';
        this.conditions = this.isPreSearch ? this.props.param.graphInfo.query : [];
        this.lastFetchReturn = true;
        this.keyIndex = 1;
        this.state = {
            graphData: null,
        };
    }

    componentDidMount() {
        if (this.isPreSearch) {
            console.log('预查询页面');
            this._emptyPreSearchValues();
            this.refs.OptionalModalView.open();
        } else {
            this._fetchData();
        }
    }

    _emptyPreSearchValues() {
        const conditions = this.conditions || [];
        conditions.forEach(condition => {
            if (condition.value) {
                delete condition.value;
            }
        })
    }

    _fetchData() {
        let selectType = this.isPreSearch ? 'search' : 'filter';
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchGeneralStatementDataWithCondition({
                id: this.props.param.graphInfo.id,
                dataType: 'chart',
                selectType: selectType,
                pageIndex: 1,
                limit: 5000,
                // preSearchCondition: this.preSearchCondition,
                searchJsonStr: this.preSearchCondition,
                globalText: '',
            }, (response) => {
                const handledGraphData = this.modalGraphStatementData(response);
                if (handledGraphData.length > 0) {
                    this.setState({graphData: handledGraphData[0]});
                }
                this.lastFetchReturn = true;
                this.keyIndex++;
                this.setState({refreshing: false, isLoadingMore: false,});
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

    modalGraphStatementData = (json) => {
        // console.log('数据转换前：-------');
        // console.log(json);
        const datas = json.body.datas || '';
        for (let item in datas) {
            const columns = datas[item].columns;
            const graphData = datas[item].datas;
            let xAixsName = columns[0].name || '';
            let yAixsName = columns[1].name || 0;
            if (columns[0].usagetype === 'DATA') {
                xAixsName = columns[1].name || '';
                yAixsName = columns[0].name || 0;
            }
            const pointArr = new Array();
            for (let pointObj of graphData) {

                let xVal = pointObj[xAixsName] || '';

                let number = parseFloat(pointObj[yAixsName]);
                number = isNaN(number) ? 0 : number;
                pointArr.push([xVal, number]);
            }
            datas[item].pointArr = pointArr;
        }
        const graphDesc = json.body.desc || '';
        for (let item of graphDesc) {
            item.graphData = datas[item.id].pointArr;
        }
        // console.log('数据转换后:+++++++++');
        // console.log(graphDesc);
        return graphDesc;
    };

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

        if (count > 0) {
            preSearchCondition = JSON.stringify(jsonForm);
        }


        this.refs.OptionalModalView.close();
        console.log('选择条件：' + preSearchCondition);
        this.preSearchCondition = preSearchCondition;
        if (this.lastFetchReturn) {//重新搜索，条件初始化
            this.lastFetchReturn = false;
            this.pullDown = true;
            this.pageIndex = 1;
            this._fetchData();
        }
    }

    /**
     * 点击数据的回调函数
     * @param e 点击的未知
     * @param dataPoint 数据
     * @param index 索引位置
     * @private
     */
    _onDataPointPress(e, dataPoint, index) {
        let msg = dataPoint + '';
        Alert.alert(null, msg);
    }

    _renderRow(rowData, sectionID, rowID) {
        const borderWidth = 0;
        let chartType = rowData.chartType.toLowerCase();
        if (chartType !== 'line' && chartType !== 'pie') {
            chartType = 'bar'
        }
        if (chartType === 'pie' && Platform.OS === 'android') {
            chartType = 'bar'
        }
        let width = 50 * rowData.graphData.length;
        // width = chartType === 'pie' ? CHART_WIDTH : (CHART_WIDTH > width ? CHART_WIDTH : width);
        width = chartType === 'pie' ? CHART_WIDTH : CHART_WIDTH > width ? CHART_WIDTH : width;
        let height = chartType === 'pie' ? width > chartHeight ? width : chartHeight : chartHeight;

        if (chartType == 'pie') {

            const sliceColors = [
                'rgb(217, 80, 138)',
                'rgb(254, 149, 7)',
                'rgb(254, 247, 120)',
                'rgb(106, 167, 134)',
                'rgb(53, 194, 209)',

                'rgb(64, 89, 128)',
                'rgb(149, 165, 124)',
                'rgb(217, 184, 162)',
                'rgb(191, 134, 134)',
                'rgb(179, 48, 80)',

                'rgb(193, 37, 82)',
                'rgb(255, 102, 0)',
                'rgb(245, 199, 0)',
                'rgb(106, 150, 31)',
                'rgb(179, 100, 53)',

                'rgb(192, 255, 140)',
                'rgb(255, 247, 140)',
                'rgb(255, 208, 140)',
                'rgb(140, 234, 255)',
                'rgb(255, 140, 157)',
            ];

            width = WINDOW_WIDTH - 20;
            height = WINDOW_HEIGHT - 50;
            const w = Math.min(width, height);
            return (
                <View style={{flex: 1, alignItems: 'center', paddingTop: 20,}}>
                    <Chart
                        key={this.keyIndex}
                        showAxis={false}
                        style={{width: w, height: w,}}
                        data={rowData.graphData}
                        onDataPointPress={this._onDataPointPress}
                        verticalGridStep={4}
                        type={chartType}
                        showDataPoint={true}
                        sliceColors={sliceColors}
                    />
                </View>
            );
        }

        return (
            <View
                style={{
                    width: WINDOW_WIDTH, paddingVertical: 10, alignItems: 'center',
                    backgroundColor: parseInt(rowID) % 2 === 0 ? 'white' : '#e7e7e7',
                    backgroundColor: 'white',
                }}
            >
                {/*<Text style={{fontSize: 14, margin: 10}}>{rowData.caption}</Text>*/}
                <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,}}>
                    {chartType != 'pie' ? <Text style={{
                        fontSize: 11,
                        width: 15,
                        borderWidth: borderWidth,
                        borderColor: 'red',
                    }}>{rowData.yAxisName}</Text> : null}
                    <View style={{flex: 1,}}>
                        <ScrollView
                            style={{borderWidth: borderWidth, borderColor: 'green',}}
                            horizontal={true}
                            pagingEnabled={false}
                            automaticallyAdjustContentInsets={false}
                            bounces={false}
                            alwaysBounceHorizontal={false}
                        >
                            <Chart
                                style={[styles.chart, {
                                    width: width,
                                    height: height,
                                    borderWidth: borderWidth,
                                    borderColor: 'blue',
                                }, this.props.style]}
                                data={rowData.graphData}
                                onDataPointPress={this._onDataPointPress}
                                verticalGridStep={4}
                                type={chartType}
                                showDataPoint={true}
                            />
                        </ScrollView>
                    </View>
                </View>
                <Text style={{fontSize: 11, margin: 5}}>{rowData.xAxisName}</Text>
            </View>
        );
    }

    _emptyData() {
        if (this.state.dataSource.length > 0) {
            return this._renderRowNew(this.state.dataSource[0]);
        } else {
            return null;
        }


        if (this.state.dataSource <= 0) {
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
            <ListView
                style={{flex: 1}}
                dataSource={this.ds.cloneWithRows(this.state.dataSource)}
                renderRow={this._renderRowNew}
                enableEmptySections={true}
            />
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
                    name="md-add"
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
                    <Text style={{
                        fontSize: 15,
                        width: TEXT_MAX_WIDTH,
                        textAlign: 'right',
                        borderWidth: borderWidth,
                        borderColor: 'red',
                    }} ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.label}</Text>
                    <Text style={{borderWidth: borderWidth, borderColor: 'green',}}>{' : '}</Text>
                    <TextInput
                        style={{
                            width: 200,
                            height: 60,
                            backgroundColor: 'white',
                            borderWidth: borderWidth,
                            borderColor: 'blue',
                        }}
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
                    <Text style={{
                        fontSize: 15,
                        width: TEXT_MAX_WIDTH,
                        textAlign: 'right',
                        borderWidth: borderWidth,
                        borderColor: 'red',
                    }} ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.label}</Text>
                    <Text style={{borderWidth: borderWidth, borderColor: 'green',}}>{' : '}</Text>
                    <Text style={{width: TEXT_MAX_WIDTH, borderWidth: borderWidth, borderColor: 'blue',}}
                          ellipsizeMode={'tail'}
                          numberOfLines={1}>{condition.value ? condition.value : ''}</Text>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={ () => this._toOptionListPage(condition)}>
                        <View style={{padding: 5, backgroundColor: '#3877bc', borderRadius: 5,}}>
                            <Text style={{fontSize: 15, color: 'white',}}>选择</Text>
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
                        borderBottomWidth: 0.5,
                    }}
                    >
                        <Text style={{fontSize: 18,}}>预查询条件</Text>
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

    _renderGraph() {
        if (!this.state.graphData) {
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
        } else {
            if (Platform.OS === 'ios') {
                return this._renderRow(this.state.graphData);
            } else {
                const charts = {'line': LineChart, 'bar': BarChart, 'pie': PieChart};
                const chartType = this.state.graphData.chartType.toLowerCase();
                const ChartType = charts[chartType] || BarChart;

                return <ChartType key={this.keyIndex} style={{flex: 1,}} graphData={this.state.graphData}/>
            }
        }

    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={this.props.param.graphInfo.name || '图表详情'}
                goBack={true}
                rightAction={this._renderBarRightBtn}
            >
                <View style={{flex: 1,}}>
                    {/*{this._emptyData()}*/}
                    {this._renderGraph()}
                    {this._renderOptionalModalView()}
                    {/*{this._renderRow(this.state.dataSource, 0 , 0)}*/}
                </View>
            </NavigationBar>
        );
    }

}

export default GraphStatementPage;
