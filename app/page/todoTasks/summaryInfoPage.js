import React, {Component} from 'react';
import {
    View,
    Text,
    InteractionManager,
    ScrollView,
    Platform,
    TouchableOpacity,
} from 'react-native';

import SignOpinions from '../todoTasks/signOpinions';
import TodoTaskActions from '../../actions/FlowActions';
import CommonStyle from '../../modules/CommonStyle'
import CommonFunc from '../commonStyle/commonFunc';
import CommonButtons from '../commonStyle/commonButtons';
import CommonList from '../commonStyle/commonList';
import FormInfo from '../commonStyle/formInfo';
import FormInfoPage from '../commonStyle/formInfoPage';
import EmptyData from '../../components/emptyData/emptyData';
import FSManager from '../../modules/fsManager';

export default class SummaryInfoPage extends Component {
    constructor(props) {
        super(props);
        this._fetchSummaryInfo = this._fetchSummaryInfo.bind(this);
        this._toSignOpinionPage = this._toSignOpinionPage.bind(this);
        this._endReadingTask = this._endReadingTask.bind(this);
        this._renderFormAndList = this._renderFormAndList.bind(this);
        this._renderListLineItemFilter = this._renderListLineItemFilter.bind(this);
        this._renderListLineItem = this._renderListLineItem.bind(this);
        this._downloadFile = this._downloadFile.bind(this);
        this._onListItemPress = this._onListItemPress.bind(this);
        this.state = {
            datas: [],
            button: '',
            opinionRequired: true,
        };
        this.flowModelInfo = {};//节点配置信息
        this.fetchSuccessful = false;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._fetchSummaryInfo();
        });
    }

    _getCommonFlowParams() {
        const listData = this.props.param.listData;
        const flowNo = CommonFunc.getValueByKeyArr(listData, ['FLOWNO', 'itemno']);
        const serialNo = CommonFunc.getValueByKeyArr(listData, ['SERIALNO', 'itemno']);
        const objectNo = CommonFunc.getValueByKeyArr(listData, ['OBJECTNO', 'itemno']);
        return {flowNo: flowNo, serialNo: serialNo, objectNo: objectNo};
    }

    _fetchSummaryInfo() {
        const param = this._getCommonFlowParams();
        TodoTaskActions.fetchSummaryInfo(param
            , (response)=> {
                const buttons = response.button || '';
                const opinionsRequired = response.opinionsRequired !== 'N';
                const summaryDatas = this._handleSummaryInfo(response);
                this.fetchSuccessful = true;
                this.setState({datas: summaryDatas, buttons: buttons, opinionsRequired: opinionsRequired});
            }, (error)=> {
                this.fetchSuccessful = false;
                CommonFunc.alert(error);
            });
    }

    _handleSummaryInfo(responseData) {
        const originDatas = responseData.briefDetail || [];
        const handledDs = [];
        originDatas.forEach((item, idx) => {
            const isList = item.isList == 'Y';
            const title = item.title || ('主要信息 - ' + idx);
            let downloadable = item.enableDownload === 'Y';
            let downloadParam = null;
            try {
                downloadParam = JSON.parse(item.downloadParam || {});
            } catch (e) {
                downloadable = false;
            }
            const datas = this._handleSummaryDatas(item.datas2 || [], isList);
            handledDs.push({
                isList: isList,
                title: title,
                datas: datas,
                downloadable: downloadable,
                downloadParam: downloadParam
            });
        });
        return handledDs;
    }

    _handleSummaryDatas(datas, isList) {
        if (!isList) {
            return this._handleFormInfo(datas);
        } else {
            return this._handleListInfo(datas);
        }
    }

    _formatNumber(formatArr) {
        formatArr.forEach(dataItem => {
            dataItem.value = CommonFunc.formatKNumber(dataItem);
        });
    }

    _handleFormInfo(formDatas) {
        let ret = [];
        if (formDatas.length > 0) {
            ret = formDatas[0];
            this._formatNumber(ret);
        }
        return ret;
    }

    _handleListInfo(listDatas) {
        listDatas.forEach(dataArr => {
            this._formatNumber(dataArr);
        });
        return listDatas;
    }

    _toSignOpinionPage() {
        const navigator = this.props.navigator;
        if (navigator) {
            const param = this._getCommonFlowParams();
            //意见必填
            param.opinionRequired = this.state.opinionRequired;
            const buttons = this.state.buttons.toLowerCase();
            //可否退回
            param.allowBack = buttons.indexOf('backstep') > -1;
            navigator.push({
                id: 'SignOpinions',
                comp: SignOpinions,
                param: param,
            });
        }
    };

    _endReadingTask() {
        const listData = this.props.param.listData;
        const readerId = CommonFunc.getValueByKeyArr(listData, ['readerId', 'itemno']);
        const param = {
            id: readerId,
        };
        TodoTaskActions.endReadingTask(param, (response) => {
            CommonFunc.goBack(this);
        }, (error)=> {
            CommonFunc.alert(error);
        });
    }

    _isShowBtn() {
        return !!(this.fetchSuccessful && (this.props.param.editable || this.props.param.isReading));
    }

    _renderNextBtn() {
        const text = this.props.param.isReading ? '结束传阅' : '签署意见';
        const func = this.props.param.isReading ? () => CommonFunc.confirm('确定结束传阅?', this._endReadingTask) : this._toSignOpinionPage;
        const btns = [{text: text, onPress: () => func()}];
        const showBtns = this._isShowBtn();
        const bottom = this._getPaddingBottom();
        return (
            <CommonButtons
                containerStyle={{
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    bottom: bottom,
                }}
                buttons={btns}
                show={showBtns}
            />
        );
    }

    _renderFormInfo(formData, idx,) {
        const datas = formData.datas || [];
        const title = formData.title || '';
        return (
            <FormInfo
                renderFilterFunc={(dataObj) => dataObj.colvisible == '1'}
                key={"form-" + idx}
                keyIndex={"form-" + idx}
                datas={datas}
                title={title}
            />
        );
    }

    _renderGroupTitle(groupTitle, groupKey) {
        return (
            <Text
                key={'group-' + groupKey}
                style={{
                    backgroundColor: '#F1F2F7',
                    padding: 8,
                    color: '#B40000',
                }}>{groupTitle}</Text>
        );
    }

    _renderListLineItemFilter(rowIdx, lineItemData, listItemData, downloadable, downloadParam) {
        let showItem = downloadable;
        if (!downloadable) {
            return false;
        }
        const onClickKey = downloadParam.onClickKey;
        showItem = onClickKey == lineItemData.code;
        return showItem;
    }

    _downloadFile(downloadId, fileSize, fileName) {
        FSManager.downloadOrOpenFile(downloadId, fileSize, fileName);
        // CommonFunc.downloadFile(downloadId, true);
    }

    _renderListLineItem(rowIdx, lineItemData, listItemData, downloadParam) {
        const keyStyle = {
            color: '#000',
        };
        const valueStyle = {
            flex: 1,
            color: '#3877bc',
            textAlign: 'right',
        };
        let downloadId = null, fileSize = null, fileName = '*.*';
        const colname = lineItemData.code;
        const name = lineItemData.display;
        const value = lineItemData.value;
        const fileNameKey = downloadParam.fileNameKey || '';
        const downloadIdKey = downloadParam.downloadIdKey || '';
        const downloadSizeKey = downloadParam.fileSizeKey || '';
        listItemData.forEach(item => {
            if (downloadIdKey == item.code && item.value) {
                downloadId = item.value;
            } else if (downloadSizeKey == item.code && item.value) {
                fileSize = item.value;
            } else if (fileNameKey == item.code && item.value) {
                fileName = item.value;
            }
        });
        return (
            <View
                key={colname}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 5,
                    flex: 1,
                }}>
                <Text
                    style={keyStyle}
                >
                    {name}
                </Text>
                <TouchableOpacity style={{flex: 1}} onPress={()=>this._downloadFile(downloadId, fileSize, fileName)}>
                    <Text
                        style={valueStyle}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                    >
                        {value}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    _onListItemPress(listItemDatas, idx) {
        this.props.navigator.push({
            id: 'FormInfoPage',
            comp: FormInfoPage,
            param: {
                datas: listItemDatas,
            }
        });
    }

    _renderListInfo(listData, idx) {
        const datas = listData.datas || [];
        const listTitle = listData.title || '';
        const downloadable = listData.downloadable;
        const downloadParam = listData.downloadParam;
        const groupKey = 'listGroupTitle-' + idx;
        return (
            <View
                key={"listContainer-" + idx}
            >
                {this._renderGroupTitle(listTitle, groupKey)}
                <CommonList
                    renderFilter={(dataObj) => dataObj.colvisible == '1'}
                    renderLineItemFilter={(a, b, c)=>this._renderListLineItemFilter(a, b, c, downloadable, downloadParam)}
                    renderLineItem={(a, b, c)=>this._renderListLineItem(a, b, c, downloadParam)}
                    visibleFilterFunOnly={true}
                    key={"list-" + idx}
                    needConvert={false}
                    datas={datas}
                    onPress={this._onListItemPress}
                />
            </View>
        );
    }

    _renderFormAndList() {
        const datas = this.state.datas || [];
        if (datas.length <= 0) {
            return (
                <EmptyData
                    style={[{flex: 1, backgroundColor: '#F0F0F0',}, CommonStyle.backgroundColor]}
                    refreshStyle={{
                        borderColor: '#F4F4F4', height: 30, marginTop: 20,
                        borderWidth: 1, borderRadius: 5
                    }}
                    textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                    onPress={() => this._fetchSummaryInfo()}
                />

            );
        }
        const views = [];
        datas.forEach((dataItem, idx) => {
            let child = null;
            if (dataItem.isList) {
                child = this._renderListInfo(dataItem, idx);
            } else {
                child = this._renderFormInfo(dataItem, idx);
            }
            if (child) {
                views.push(child);
            }
        });
        return views;
    }

    _getPaddingBottom() {
        return Platform.OS === 'android' ? 24 : 10;
    }

    render() {
        const paddingBottom = this._getPaddingBottom();
        const contentPaddingBottom = this._getPaddingBottom() + (this._isShowBtn() ? 50 : 0);
        return (
            <View
                style={{flex: 1, paddingBottom: paddingBottom}}
            >
                <ScrollView
                    style={[{flexDirection: 'column', backgroundColor: 'transparent'}, CommonStyle.backgroundColor]}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{flex: 1, justifyContent: 'space-between', paddingBottom: contentPaddingBottom}}>
                        {this._renderFormAndList()}
                    </View>
                </ScrollView>
                {this._renderNextBtn()}
            </View>
        );
    }
}