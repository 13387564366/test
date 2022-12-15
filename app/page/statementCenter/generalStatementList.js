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
    InteractionManager,
    ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import GeneralStatementPage from './generalStatementPage'
import StatementAction from '../../actions/statementActions';
import AppStore from '../../stores/AppStore';
import EmptyData from '../../components/emptyData/emptyData';
import CommonStyle from '../../modules/CommonStyle'
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const SPACE_BETWEEN_ITEM = 14;
const ITEM_WIDTH = (WINDOW_WIDTH - 14 * 2 - 14 * 2) / 3;
const ITEM_HEIGHT = (WINDOW_WIDTH - 14 * 2 - 14 * 2) / 3;

class GeneralStatementList extends React.Component {

    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this.toPage = this.toPage.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: []
        };

        this.preSearchStatements = [
            '项目统计表',
            '项目信审通过率（部门）',
            '项目信审通过率（项目经理）',
            '项目平均风速',
            '等效利用小时数',
            '项目限电比例',
            '各月损失电量合计',
            '项目实际发电量',
            '各项目年度信用评级变化趋势',
            '各项目资产质量分类结果趋势图',
            '项目付款计划',
            '项目付款计划月度',
            '项目收款计划年度',
            '项目收款计划-月度',
        ];
    }

    componentDidMount() {
        this._fetchData();
    }

    _fetchData() {
        InteractionManager.runAfterInteractions(() => {
            StatementAction.fetchStatementList({
                userid: AppStore.getUserID(),
            }, (response) => {
                this.setState({
                    dataSource: response.body.datas || []
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

    toPage(pageTitle, reportId) {
        let showAlert = false;
        this.preSearchStatements.forEach( (item) => {
            console.log(item + '--' + pageTitle);
            if(item.indexOf(pageTitle) >= 0 || pageTitle.indexOf(item) >= 0){
                showAlert = true;
            }
        });
        if(showAlert){
            Alert.alert(null, '该报表为预查询报表，正在努力解决中');
        }else{
            this.props.navigator.push({
                id: 'GeneralStatementPage',
                comp: GeneralStatementPage,
                param: {
                    title: pageTitle,
                    reportId: reportId,
                }
            });
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.toPage(rowData.name, rowData.id)}>
                <View
                    style={{
                        width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        borderBottomColor: '#e9e9e9',
                        borderBottomWidth: 1,
                    }}>
                    <Image
                        source={require('../../image/statement_icon.png')} style={{width: 40, height: 40,}}/>
                    <Text ellipsizeMode={'tail'} numberOfLines={2}
                          style={{fontSize: 15, color: '#333333', textAlign: 'center', marginLeft: 15,}}>
                        {rowData.name}
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

        // return this._renderContent();

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

export default GeneralStatementList;
