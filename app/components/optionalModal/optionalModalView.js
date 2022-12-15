/**
 * Created by cui on 11/8/16.
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    ListView,
    Image,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const ITEM_WIDTH = (WINDOW_WIDTH - 40) / 3;

import Icon from 'react-native-vector-icons/Ionicons';

class OptionalModalView extends Component {
    constructor(props) {
        super(props);
        this.close = this._close.bind(this);
        this.open = this._open.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this._renderContentView = this._renderContentView.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            modalVisible: false,
        };
    }

    static propTypes = {
        transparent: React.PropTypes.bool,
        viewBGColor: React.PropTypes.string,
        animationType: React.PropTypes.string,
        renderContentView: React.PropTypes.func,
        dataSource: React.PropTypes.array,
        clickOnPress: React.PropTypes.func,
        displayKey: React.PropTypes.string,
    };

    static defaultProps = {
        displayKey: 'displayKey',
        transparent: false,
        viewBGColor: '#f8f8f8',
        animationType: 'fade'
    };

    _open() {
        this.setState({modalVisible: true});
    }

    _close() {
        this.setState({modalVisible: false});
    }

    _menuListIcon(rowData) {
        let src = null;
        switch (rowData[this.props.displayKey]) {
            case '附件信息':
                src = require('../../image/attachment.png');
                break;
            default:
                src = require('../../image/basic.png');
                break;
        }
        return src;
    }

    _renderRow(rowData, sectionID, rowID) {
        const src = this._menuListIcon(rowData);
        return (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => {
                    if (this.props.clickOnPress) this.props.clickOnPress(rowData, rowID);
                    this._close();
                }}
            >
                <View
                    style={{
                        backgroundColor: '#2F86D5',
                        flexDirection: 'row',
                        width: 200,
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: '#999',
                        alignItems: 'center',
                    }}
                >
                    {/*<Icon name={'ios-albums-outline'} size={35} color="white" />*/}
                    <Image source={src} style={{width: 20, height: 20,}} resizeMode={'stretch'}/>
                    <Text style={{
                        marginLeft: 10,
                        fontSize: 18,
                        color: 'white',
                        textAlign: 'center',
                    }}>{rowData[this.props.displayKey]}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    _renderContentView() {
        if (this.props.renderContentView) {
            return this.props.renderContentView();
        }

        const ds = this.props.dataSource;
        if (ds.length <= 0) {
            return null;
        }

        const modalBackgroundStyle = {
            backgroundColor: this.props.transparent ? 'transparent' : 'rgba(0, 0, 0, 0)',
        };

        return (
            <TouchableWithoutFeedback onPress={this.close}>
                <View
                    style={[modalBackgroundStyle, {flexDirection: 'row', justifyContent: 'flex-end', flex: 1,}]}
                >
                    <View style={{
                        marginTop: Platform.OS === 'ios' ? 64 : 48,
                        marginRight: 10,
                        borderWidth: 0.5,
                        borderColor: 'transparent'
                    }}>
                        <View>
                            {
                                ds.map((item, i) => {
                                    return (
                                        <View
                                            key={i}
                                        >
                                            {this._renderRow(item, i, i)}
                                        </View>
                                    );
                                })
                            }
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    _onRequestClose() {
        if (this.props.onRequestClose) {
            this.props.onRequestClose();
        }
    }

    render() {
        const modalBackgroundStyle = {
            backgroundColor: this.props.transparent ? 'transparent' : 'rgba(0, 0, 0, 0)',
        };

        return (
            <Modal
                style={{}}
                animationType={this.props.animationType}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this._onRequestClose()}
            >
                {/*<TouchableWithoutFeedback onPress={this.close}>*/}
                {/*<View*/}
                {/*style={[modalBackgroundStyle, {flexDirection: 'row', justifyContent: 'flex-end',flex: 1,}]}*/}
                {/*>*/}
                {/*<View style={{marginTop: Platform.OS === 'ios' ? 64 : 48, marginRight: 10,borderWidth: 0.5,borderColor: 'white'}}>*/}
                {/*{this._renderContentView()}*/}
                {/*</View>*/}
                {/*</View>*/}
                {/*</TouchableWithoutFeedback>*/}
                {this._renderContentView()}
            </Modal>
        );
    }
}

export default OptionalModalView;

