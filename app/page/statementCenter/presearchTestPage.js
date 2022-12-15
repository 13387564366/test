/**
 * Created by edz on 2017/5/22.
 */

import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Alert,
    Dimensions,
    TextInput,
} from 'react-native';
import NavigationBar from '../../components/navigator/NavBarView';
import OptionalModalView from '../../components/optionalModal/optionalModalView';
import DatePicker from 'react-native-datepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import DateHelper from '../../modules/dateHelper';

import Menu, {
    MenuContext,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

export default class PresearchTestPage extends Component {

    constructor(props) {
        console.log('constructor----before');
        console.log('constructor----after');
        super(props);
        this._renderModalView = this._renderModalView.bind(this);
        this._renderBarRightBtn = this._renderBarRightBtn.bind(this);
        this.state = {};

        this.conditions = [
            {
                label: '文本条件',
                format: 'text',
                filedName: 'text',
                value: '',
            },
            {
                label: '列表条件',
                format: 'list',
                values: ['列表条件-----值1', '列表条件-----值2', '列表条件-----值3'],
                filedName: 'list',
                value: '列表条件-----值1',
            },
            {
                label: '开始日期',
                format: 'date',
                filedName: 'date',
            },
            {
                label: '结束日期',
                format: 'date',
                filedName: 'date',
            },
            {
                label: '列表条件',
                format: 'list',
                values: ['列表条件值1', '列表条件值2', '列表条件值3'],
                filedName: 'list',
            },
        ];
    }

    componentDidMount() {
        console.log('componentDidMount----before');
        this.refs.OptionalModalView.open();
        console.log('componentDidMount----after');
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

    _renderText(condition) {
        let filedName = condition.filedName || '';
        if (this.isFiledNameNull(filedName)) {
            return null;
        } else {
            const filedName = condition.filedName;
            return (
                <View style={{
                    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingVertical: 15,
                    paddingHorizontal: 14, borderBottomColor: 'gray', borderBottomWidth: 1,
                }}>
                    <Text style={{fontSize: 18,}}>{condition.label + ' : '}</Text>
                    <TextInput
                        style={{
                            width: 200,
                            height: 30,
                            backgroundColor: 'white',
                        }}
                        value={condition.value}
                        placeholder='请输入...'
                        onChangeText={ (text) => this._onValueChanged(condition, text)}
                    />
                </View>
            );
        }
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

    _renderOptionList(condition) {
        let filedName = condition.filedName || '';
        if (this.isFiledNameNull(filedName)) {
            return null;
        } else {
            // Alert.alert(null, '列表条件。。。。');
            // return null;

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
                                condition.values.map((item, i) =>
                                    this._renderMenuOption(item, item, i))
                            }
                        </MenuOptions>
                    </Menu>
                </View>
            );
        }
    }

    _renderDatePicker(condition) {
        let filedName = condition.filedName || '';
        if (this.isFiledNameNull(filedName)) {
            return null;
        } else {
            value = condition.value;
            value = value ? DateHelper.dfy(value, 'yyyy/mm/dd') : '请选择...';
            return (
                <View style={{
                    flexDirection: 'row',
                    paddingVertical: 15,
                    paddingHorizontal: 14,
                    borderBottomColor: 'gray',
                    backgroundColor: 'white',
                    borderBottomWidth: 0.5,
                    alignItems: 'center'
                }}>
                    <Text style={{fontSize: 18,}}>{condition.label + ' : '}</Text>
                    <Text style={{
                        width: 100,
                        borderWidth: 0,
                        borderColor: 'red',
                        marginRight: 10,
                        color: '#126aff',
                    }}>{value}</Text>
                    <TouchableOpacity style={{}}>
                        <DatePicker
                            style={{flexWrap: 'wrap', borderColor: 'red', borderWidth: 1, width: 0,}}
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
                                    height: 17,
                                    borderWidth: 0,
                                },
                                dateText: {
                                    fontSize: 0,
                                    color: '#126aff',
                                },
                                dateTouchBody: {
                                    height: 17,
                                    width: 0,
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
        const type = condition.format;
        switch (type) {
            case 'text':
                return this._renderText(condition);
            case 'list':
                return this._renderOptionList(condition);
            case 'date':
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
            child = this._renderCondition(conditions[i]);
            if (child) {
                children.push(<View key={i}>{child}</View>);
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
        let str = '';
        conditions.forEach(condition => {
            let value = '';
            if (condition.format == 'date') {
                if (condition.value) {
                    value = DateHelper.df(condition.value, 'yyyy/mm/dd');
                } else {
                    value = '';
                }
            } else {
                value = condition.value || '';
            }
            str += '&' + condition.filedName + '=' + value;
        })
        console.log('选择条件：' + str);
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

    render() {
        console.log('render----before');
        return (
            <NavigationBar
                title='PresearchTestPage'
                goBack={true}
                navigator={this.props.navigator}
                rightAction={this._renderBarRightBtn}
            >
                {/*{this._renderContent()}*/}
                {this._renderOptionalModalView()}
            </NavigationBar>
        );
        console.log('render----after');
    }
}
