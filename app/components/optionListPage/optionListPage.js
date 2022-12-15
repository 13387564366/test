/**
 * Created by edz on 2017/5/25.
 */


import React, {Component} from 'react';
import {
    View,
    Text,
    Alert,
    ListView,
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';

import NavigationBar from '../navigator/NavBarView';
import CommonStyle from '../../modules/CommonStyle';
import CommonActions from '../../actions/AttachmentActions';

const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 14;

export default class OptionListPage extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._onItemSelected = this._onItemSelected.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
        this.condition = this.props.param.optionInfo;
        this.state = {
            dataSource: this.props.param.options || [],
        }
    }

    // propTypes = {};
    // _toOptionListPage(widgetInfo) {
    //     this.props.navigator.push({
    //         id: 'OptionListPage',
    //         comp: OptionListPage,
    //         param: {
    //             optionInfo: widgetInfo,
    //             callback: this._onListItemSelected,
    //             needRequest: true,
    //             sourceType: 'col_source_type',
    //             source: 'col_source',
    //             key: 'item_no',
    //             value: 'item_name',
    //         }
    //     });
    // }

    componentDidMount() {
        if (this.props.param.needRequest) {
            this._fetchData();
        }
    }

    _fetchData() {
        const param = this.props.param;
        const type = param.optionInfo[param.sourceType];
        const source = param.optionInfo[param.source];
        CommonActions.getCodeDicts({
            type: type,
            source: source,
        }, (response) => {
            let radioArr = response.selectData || [];
            radioArr = this._handleRenderFilter(radioArr);
            this.setState({dataSource: radioArr});
        }, (error) => {
            Alert.alert(
                '提示',
                '选择框数据获取失败',
                [{text: '确定'}]
            );
        });
    }

    //处理过滤数据
    _handleRenderFilter(originArr) {
        const optionInfo = this.props.param.optionInfo;
        const renderFilter = optionInfo ? optionInfo.renderFilter : null;
        let handledArr = [];
        if (renderFilter) {
            originArr.forEach(item => {
                if (renderFilter(item)) {
                    handledArr.push(item);
                }
            });
        } else {
            handledArr = originArr;
        }
        return handledArr;
    }

    _onItemSelected(selectedVal) {
        let callback = this.props.param.callback;
        this.props.navigator.pop();
        if (callback) {
            callback(this.condition, selectedVal);
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        const displayKey = this.props.param.value;
        return (
            <TouchableOpacity
                onPress={() => this._onItemSelected(rowData)}
            >
                <View
                    style={{
                        width: WINDOW_WIDTH,
                        paddingHorizontal: TEXT_ITEM_PADDING,
                        backgroundColor: 'white',
                        paddingVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        borderBottomColor: '#e9e9e9',
                        borderBottomWidth: 1,
                    }}
                >
                    <Text style={{fontSize: 15, color: '#222',}}>
                        {rowData[displayKey]}
                    </Text>
                </View>
            </TouchableOpacity>

        );
    }

    render() {
        return (
            <NavigationBar
                title={this.props.param.title || '选择列表'}
                goBack={true}
                navigator={this.props.navigator}
            >
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
                    enableEmptySections={true}
                />
            </NavigationBar>
        );
    }
}