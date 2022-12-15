/**
 * Created by cui on 11/4/16.
 */

import React from 'react';
import {
    View,
    Text,
    ListView,
    Platform,
    Image,
    Alert,
    Dimensions,
    TouchableOpacity,
    InteractionManager
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import GraphStatementPage from './graphStatementPageNew';
import EmptyData from '../../components/emptyData/emptyData';
import StatementAction from '../../actions/statementActions';
import AppStore from '../../stores/AppStore';

const WINDOW_WIDTH = Dimensions.get('window').width;

const ITEM_WIDTH = (WINDOW_WIDTH - 15) / 2;

class GraphStatementList extends React.Component {

    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this.toPage = this.toPage.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: []
        };
    }

    componentDidMount() {
        this._fetchData();
    }

    _fetchData() {
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchStatementListWithCondition({
                userid: AppStore.getUserID(),
                type: 'chart',
            }, (response) => {
                if (response.body.outline.code == 'SUCCESS') {
                    let datas = this._handleData(response.body.content);
                    this.setState({
                        dataSource: datas,
                    });
                } else {
                    Alert.alert(null, response.body.outline.message);
                }
            }, (error) => {
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        });
    }

    _handleData(originData) {
        let reportList = [];
        let reportDatas = originData.datas || [];

        reportDatas.forEach(reportInfo => {
            let conditions = [];
            let query = reportInfo.query || [];
            query.forEach(condition => {
                if (condition.filterType == 'SEARCH') {
                    conditions.push(condition);
                }
            });

            if (conditions.length > 0) {
                reportInfo.isPreSearch = true;
            } else {
                reportInfo.isPreSearch = false;
            }
            reportList.push(reportInfo);
        });
        return reportList;
    }

    toPage(graphInfo) {
        this.props.navigator.push({
            id: 'GraphStatementPage',
            comp: GraphStatementPage,
            param: {
                graphInfo: graphInfo,
            }
        });
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.toPage(rowData)}>
                <View
                    style={{
                        width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderBottomColor: '#e9e9e9',
                        borderBottomWidth: 1,
                    }}>
                    {/*<Text style={{marginRight: 10,}}>{rowData.chartType}</Text>*/}
                    {/*<Image source={require('../../image/statement_icon.png')} style={{width: 40, height: 40,}}/>*/}
                    {this._renderImage(rowData.desc.chartType)}
                    <Text ellipsizeMode={'tail'} numberOfLines={2}
                          style={{fontSize: 15, color: '#333333', textAlign: 'center', marginLeft: 15,}}>
                        {rowData.name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    _renderImage(chartType) {
        let type = chartType.toLowerCase() || '';
        type = type != 'line' && type != 'pie' ? 'bar' : type;
        switch (type) {
            case 'line':
                return <Image style={{width: 30, height: 30,}} source={require('../../image/chart_line.png')}/>;
            case 'bar':
                return <Image style={{width: 30, height: 30,}} source={require('../../image/chart_bar.png')}/>;
            case 'pie':
                return <Image style={{width: 30, height: 30,}} source={require('../../image/chart_pie.png')}/>;
        }
    }

    render() {
        if (this.state.dataSource.length <= 0) {
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
                contentContainerStyle={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                }}
                style={{flex: 1, marginBottom: Platform.OS === 'ios' ? 0 : 50}}
                dataSource={this.ds.cloneWithRows(this.state.dataSource)}
                renderRow={this._renderRow}
                enableEmptySections={true}
            />
        );
    }
}

export default GraphStatementList;

