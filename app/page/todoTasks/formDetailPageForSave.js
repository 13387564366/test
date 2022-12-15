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

import FlowActions from '../../actions/FlowActions';
import NavigationBar from '../../components/navigator/NavBarView';
import CommonFunc from '../commonStyle/commonFunc';
import CommonWidgets from '../commonStyle/commonWidgets';
import CommonButtons from '../commonStyle/commonButtons';

export default class FormDetailPage extends React.Component {
    constructor(props) {
        super(props);
        this._fetchData = this._fetchData.bind(this);
        this._onSetState = this._onSetState.bind(this);
        this._savePageInfo = this._savePageInfo.bind(this);
        this.state = {
            pageInfo: {},
            groups: [],
        };
        this.fetchSuccessful = null;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => this._fetchData());
    }

    _fetchData() {
        const params = {...this.props.param.postParam};
        FlowActions.getCommonFormInfo(params, (response) => {
            const datas = response.datas || [];
            let data = datas.length > 0 ? datas[0] : [];
            let pageArr = data.detail_data || [];
            const pageInfo = CommonFunc.handlePageData(pageArr);
            const doGroup = response.doGroup || [];
            this.fetchSuccessful = true;
            this.setState({
                groups: doGroup,
                pageInfo: pageInfo,
            });
        }, (error) => {
            this.fetchSuccessful = false;
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _savePageInfo() {
        const checkObj = CommonFunc.getDynamicValuesAndCheck(this.state.pageInfo);
        const {showAlert, alertMsg, returnObj} = checkObj;
        const param = {
            ...returnObj,
            ...this.props.param.postParam,
        };
        if (!showAlert) {
            FlowActions.saveCommonInfo(param,
                (responseData) => {
                    CommonFunc.alert('保存成功', ()=>CommonFunc.goBack(this));
                }, (error) => {
                    CommonFunc.alert(error);
                });
        } else {
            CommonFunc.alert(alertMsg);
        }
    }

    _renderBtns() {
        const show = this.fetchSuccessful;
        const btns = [
            {text: '保存', onPress: this._savePageInfo},
        ];
        return (
            <CommonButtons
                buttons={btns}
                show={show}
            />
        );
    }

    _onSetState(newWidgetInfo) {
        const prevPageInfo = this.state.pageInfo;
        const colname = newWidgetInfo.colname;
        const prevWidgetInfo = prevPageInfo[colname];
        const nextPageInfo = {
            ...prevPageInfo,
            [colname]: newWidgetInfo,
        };
        const onChange = prevWidgetInfo.onChange;
        if (onChange && newWidgetInfo.itemno != prevWidgetInfo.itemno) {
            onChange(nextPageInfo, newWidgetInfo.itemno);
        }
        this.setState({
            pageInfo: nextPageInfo,
        })
    }

    _renderContent() {
        const pageInfo = this.state.pageInfo;
        const groups = this.state.groups;
        return (
            <ScrollView>
                <CommonWidgets
                    navigator={this.props.navigator}
                    widgets={pageInfo}
                    groups={groups}
                    onSetState={this._onSetState}
                    editable={this.props.param.editable}
                />
                {this._renderBtns()}
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