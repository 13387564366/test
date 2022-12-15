/**
 * Created by edz on 2017/5/24.
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
    InteractionManager,
    ScrollView,
} from 'react-native';

import GeneralStatementPage from './generalStatementPageForYueShengKe'
import StatementAction from '../../actions/StatementActions';
import AppStore from '../../stores/AppStore';
import EmptyData from '../../components/emptyData/emptyData';
import CommonStyle from '../../modules/CommonStyle'
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const SPACE_BETWEEN_ITEM = 14;
const ITEM_WIDTH = (WINDOW_WIDTH - 14 * 2 - 14 * 2) / 3;
const ITEM_HEIGHT = (WINDOW_WIDTH - 14 * 2 - 14 * 2) / 3;

export default class GeneralStatementList extends React.Component {

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

    _handleData(originData) {
        // let reportList = [];
        let reportDatas = originData.reportlimitname || [];
        return reportDatas;
        // reportDatas.forEach(reportInfo => {
        //     let conditions = [];
        //     let query = reportInfo.query || [];
        //     query.forEach(condition => {
        //         if (condition.filterType == 'SEARCH') {
        //             conditions.push(condition);
        //         }
        //     });
        //
        //     if (conditions.length > 0) {
        //         reportInfo.isPreSearch = true;
        //     } else {
        //         reportInfo.isPreSearch = false;
        //     }
        //     reportList.push(reportInfo);
        // });
        // return reportList;
    }

    _fetchData() {
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchStatementListWithCondition({
                userid: AppStore.getUserID(),
                type: 'report',
            }, (response) => {
                let datas = this._handleData(response);
                this.setState({
                    dataSource: datas,
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

    toPage(reportInfo) {
        this.props.navigator.push({
            id: 'GeneralStatementPage',
            comp: GeneralStatementPage,
            param: {
                reportInfo: reportInfo,
            }
        });

    }

    _renderRow(rowData) {
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
                    <Image
                        source={require('../../image/statement_icon2.png')} style={{width: 30, height: 30,}}/>
                    <Text ellipsizeMode={'tail'} numberOfLines={2}
                          style={{fontSize: 15, color: '#333333', textAlign: 'center', marginLeft: 15,}}>
                        {rowData.name_}
                    </Text>
                </View>
            </TouchableOpacity>
        );
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
                    paddingBottom: Platform.OS === 'ios' ? 0 : 50,
                }}
                style={[{flex: 1, marginBottom: 0, backgroundColor: '#E7E7E7',}, CommonStyle.backgroundColor]}
                dataSource={this.ds.cloneWithRows(this.state.dataSource)}
                renderRow={this._renderRow}
                enableEmptySections={true}
            />
        );
    }

    _renderContent() {
        const ds = this.state.dataSource || [];
        const dsLength = ds.length;
        const modCount = dsLength % 3;
        const rowCount = modCount != 0 ? (dsLength - modCount) / 3 : (dsLength / 3);
        let count = 0;
        const container = [];
        for (let i = 0; i < rowCount; i++) {
            let lineChildren = new Array();
            for (let j = 0; j < 3; j++) {
                child = <View key={'child-' + count}>{this._renderRow(ds[count++])}</View>;
                lineChildren.push(child);
            }
            let lineContainer = <View key={'row-' + i} style={{
                width: WINDOW_WIDTH,
                paddingHorizontal: SPACE_BETWEEN_ITEM,
                backgroundColor: '#E7E7E7',
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 15,
                justifyContent: 'space-between',
            }}>{lineChildren}</View>;
            container.push(lineContainer);
        }

        if (modCount != 0) {
            let lineChildren = new Array();
            for (let j = 0; j < modCount; j++) {
                child = <View key={'child-' + count}>{this._renderRow(ds[count++])}</View>;
                lineChildren.push(child);
            }
            let lineContainer = <View key={'row-' + rowCount} style={{
                width: WINDOW_WIDTH,
                paddingHorizontal: SPACE_BETWEEN_ITEM,
                backgroundColor: '#E7E7E7',
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 15,
                justifyContent: 'space-between',
            }}>{lineChildren}</View>;
            container.push(lineContainer);
        }

        return (
            <ScrollView
                contentContainerStyle={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    backgroundColor: '#E7E7E7',
                    paddingBottom: Platform.OS === 'ios' ? 0 : 50,
                    paddingTop: 15,
                }}
            >
                <View style={{flex: 1,}}>{container}</View>
            </ScrollView>
        );
    }
}