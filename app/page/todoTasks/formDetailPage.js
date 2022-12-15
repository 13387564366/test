/**
 * Created by tenwa on 16/12/15.
 */


import React from 'react';

import {
    ListView,
    InteractionManager,
    View,
    Text,
    Alert,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import TodoTaskActions from '../../actions/FlowActions';
import EmptyData from '../../components/emptyData/emptyData';
import NavigationBar from '../../components/navigator/NavBarView';
import AppStore from '../../stores/AppStore';
import CommonFunc from '../commonStyle/commonFunc';
import CommonWidgets from '../commonStyle/commonWidgets';

const TEXT_ITEM_PADDING = 14;

export default class FormDetailPage extends React.Component {

    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this._renderRow = this._renderRow.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._getFiled = this._getFiled.bind(this);
        this._alert = this._alert.bind(this);
        this.state = {
            pageInfo: {},
            groups: [],
        };
        this.needRequest = !this.props.param.detailData;//是否需要请求数据
    }

    componentDidMount() {
        if (this.needRequest) {
            InteractionManager.runAfterInteractions(() => this._fetchData());
        }
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

    _fetchData() {
        const params = {
            ...this.props.param.postParam,
        };
        TodoTaskActions.getCommonFormInfo(params, (response) => {
            const datas = response.datas || [];
            let data = datas.length > 0 ? datas[0] : [];
            let pageArr = data.detail_data || [];
            const pageInfo = CommonFunc.handlePageData(pageArr);
            const doGroup = response.doGroup || [];
            this.setState({
                groups: doGroup,
                pageInfo: pageInfo,
            });
        }, (error) => {
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _alert(title, msg) {
        Alert.alert(title, msg, [{text: '确定'}]);
    }

    _renderRow(rowData, sectionID, rowID) {
        const display = rowData.display;
        const value = rowData.value;
        let child = null;
        const hasVisibleFlag = !(typeof(rowData.colvisible) == 'undefined');
        if (!hasVisibleFlag) {
            child = (<View
                style={{
                    height: 40,
                    paddingHorizontal: TEXT_ITEM_PADDING,
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomColor: '#e9e9e9',
                    borderBottomWidth: 0.5,
                }}
            >
                <View style={{flexDirection: 'row', width: 110, alignItems: 'center',}}>
                    <Text
                        style={{width: 100, fontSize: 15, textAlign: 'right',}}
                    >
                        {rowData.display}
                    </Text>
                    <Text style={{marginHorizontal: 2.5,}}>{':'}</Text>
                </View>

                <Text
                    ellipsizeMode={'tail'}
                    numberOfLines={1}
                    style={{flex: 1, fontSize: 13, color: '#666666',}}
                >
                    {rowData.value}
                </Text>
            </View>);
        } else {
            if (rowData.colvisible != '1') {
                return null;
            } else {
                if ('textarea' == rowData.coleditstyle.toString().toLowerCase()) {
                    child = (
                        <View
                            style={{
                                paddingHorizontal: TEXT_ITEM_PADDING,
                                backgroundColor: 'white',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomColor: '#e9e9e9',
                                borderBottomWidth: 0.5,
                                paddingVertical: 10,
                            }}
                        >
                            <View style={{flexDirection: 'row', width: 110, alignItems: 'center',}}>
                                <Text
                                    style={{width: 100, fontSize: 15, textAlign: 'right',}}
                                >
                                    {rowData.display}
                                </Text>
                                <Text style={{marginHorizontal: 2.5,}}>{':'}</Text>
                            </View>

                            <Text
                                style={{flex: 1, fontSize: 13, color: '#666666',}}
                            >
                                {rowData.value}
                            </Text>
                        </View>
                    );
                } else {
                    child = (
                        <View
                            style={{
                                height: 40,
                                paddingHorizontal: TEXT_ITEM_PADDING,
                                backgroundColor: 'white',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomColor: '#e9e9e9',
                                borderBottomWidth: 0.5,
                            }}
                        >
                            <View style={{flexDirection: 'row', width: 110, alignItems: 'center',}}>
                                <Text
                                    style={{width: 100, fontSize: 15, textAlign: 'right',}}
                                >
                                    {rowData.display}
                                </Text>
                                <Text style={{marginHorizontal: 2.5,}}>{':'}</Text>
                            </View>

                            <Text
                                ellipsizeMode={'tail'}
                                numberOfLines={1}
                                style={{flex: 1, fontSize: 13, color: '#666666',}}
                            >
                                {rowData.value}
                            </Text>
                        </View>
                    );
                }
            }
        }
        if (child) {
            return (
                <TouchableOpacity
                    onPress={() => this._alert(display, value)}
                >
                    {child}
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    }

    _renderContent() {
        const pageInfo = this.state.pageInfo;
        const groups = this.state.groups;
        return (
            <ScrollView>
                <CommonWidgets
                    widgets={pageInfo}
                    groups={groups}
                />
            </ScrollView>
        );
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                goBack={true}
                title={this.props.param.title || '详情'}
                contentMarginBottom={24}
            >
                {this._renderContent()}
            </NavigationBar>
        );
    }

}