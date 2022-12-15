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

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const chartHeight = WINDOW_HEIGHT * 0.7;

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
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._emptyData = this._emptyData.bind(this);
        this.ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state = {
            dataSource: []
        };
    }

    componentDidMount() {
        // this._fetchData();
    }

    _fetchData() {
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchGraphStatementData({
                // reportId: '402882964ac209cc014ac261d8980022'
                userid: AppStore.getUserID(),
            }, (response) => {
                // const datas = response || [];
                const datas = [response[8]] || [];
                const chartDatas = this._handleChartData(datas);
                this.setState({
                    dataSource: chartDatas,
                });
            }, (error) => {
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        });
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
        if(this.state.dataSource.length > 0){
            return this._renderRowNew(this.state.dataSource[0]);
        }else{
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

    _renderGraph() {
        if(Platform.OS === 'ios'){
            return this._renderRow(this.props.param.graphData);
        }

        const charts = {'line': LineChart, 'bar': BarChart, 'pie': PieChart};
        const chartType = this.props.param.graphData.chartType.toLowerCase();
        const ChartType = charts[chartType] || BarChart;

        return <ChartType style={{flex: 1,}} graphData={this.props.param.graphData}/>
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={this.props.param.graphData.caption || '图表详情'}
                goBack={true}
            >
                <View style={{flex: 1,}}>
                    {/*{this._emptyData()}*/}
                    {this._renderGraph()}
                    {/*{this._renderRow(this.state.dataSource, 0 , 0)}*/}
                </View>
            </NavigationBar>
        );
    }

}

export default GraphStatementPage;
