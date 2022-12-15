/**
 * Created by edz on 2017/5/25.
 */


import React, {Component} from 'react';
import {
    View,
    Text,
    ListView,
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import CommonStyle from '../../modules/CommonStyle';
const WINDOW_WIDTH = Dimensions.get('window').height;
const TEXT_ITEM_PADDING = 14;

export default class OptionListPage extends Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._onItemSelected = this._onItemSelected.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
        this.condition = this.props.param.optionInfo;
        this.state = {
            dataSource: this.props.param.optionInfo.selectList || [],
        }
    }

    _onItemSelected(selectedVal) {
        let callback = this.props.param.callback;
        this.props.navigator.pop();
        if (callback) {
            callback(this.condition, selectedVal);
        }
    }

    _renderRow(rowData, sectionID, rowID) {
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
                        {rowData}
                    </Text>
                </View>
            </TouchableOpacity>

        );
    }

    render() {
        return (
            <NavigationBar
                title={this.props.param.optionInfo.label || '选择列表'}
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