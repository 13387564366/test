import React from 'react';
import {
    View,
    Text,
    Alert,
    Dimensions,
    ScrollView,
    ListView,
    Image,
    InteractionManager,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import CountTextInputNew from '../../components/counTextInput/countTextInputNew';
import RNButton from '../../components/rnButton/rnButton';
import TodoTaskActions from '../../actions/FlowActions';
import CommonStyle from '../../modules/CommonStyle';
import CommitDirector from './FlowCommitPage';
import BackStepDirector from './FlowBackStepPage';
import CommonFunc from '../commonStyle/commonFunc';
import CommonButtons from '../commonStyle/commonButtons';
import AppStore from '../../stores/AppStore';
import CommonWidgets from '../commonStyle/commonWidgets';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const REG_EMPTY = /^\s*$/;

export default class SignOpinions extends React.Component {

    constructor(props) {
        super(props);
        this._renderContent = this._renderContent.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._pushOpinionAndToNext = this._pushOpinionAndToNext.bind(this);
        this._toNext = this._toNext.bind(this);
        this._toNextPage = this._toNextPage.bind(this);
        this._onSetState = this._onSetState.bind(this);
        this.state = {
            processedResult: '',
            processedAdvise: '',
            currentAdvice: {},
            submit: '',
            choiceInfo: null,
        };
        this.opinionRequired = !!this.props.param.opinionRequired;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this._fetchData();
        })
    }

    _fetchData(argument) {
        TodoTaskActions.getOpinion({
            serialNo: this.props.param.serialNo,
        }, (response) => {
            const advices = response.datas || [];
            if (advices.length > 0) {
                let currentAdvice = advices[0];
                const curOpinionInfo = CommonFunc.handleArr2Obj(currentAdvice.detail_data);
                let processedAdvise = CommonFunc.getValueByKeyArr(curOpinionInfo, ['PhaseOpinion', 'value']);
                const opinionInfo = CommonFunc.handlePageData(currentAdvice.detail_data);
                let choiceInfo = CommonFunc.getValueByKeyArr(opinionInfo, ['PhaseChoice']);
                choiceInfo = {
                    [choiceInfo.colname]: choiceInfo,
                };
                this.setState({processedAdvise: processedAdvise, choiceInfo: choiceInfo});
            }
        }, (error) => {
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _onSetState(newWidgetInfo) {
        const prevChoiceInfo = this.state.choiceInfo;
        const colName = newWidgetInfo.colname;
        //先前的选择意见
        const prevWidgetInfo = prevChoiceInfo[colName];
        const prevChoice = prevWidgetInfo.value;

        const prevAdvice = this.state.processedAdvise || '';
        //是之前选择的意见
        const isOldChoice = prevAdvice.replace(/(^\s*|\s*$)/g, '') == prevChoice;
        //当前的意见
        const curAdvice = newWidgetInfo.value;
        const emptyAdvice = this._isEmptyStr(prevAdvice);
        const needSet = emptyAdvice || isOldChoice;
        const newAdvice = needSet ? curAdvice : prevAdvice;

        const newChoiceInfo = {
            ...prevChoiceInfo,
            [colName]: newWidgetInfo,
        };
        const newState = {
            choiceInfo: newChoiceInfo,
            processedAdvise: newAdvice,
        };

        this.setState(newState);
    }

    _isEmptyStr(str) {
        return REG_EMPTY.test(str);
    }

    _renderChoice() {
        if (!this.state.choiceInfo) {
            return null;
        }
        return (
            <CommonWidgets
                editable={true}
                widgets={this.state.choiceInfo}
                navigator={this.props.navigator}
                onSetState={this._onSetState}
            />
        );
    }

    _renderContent() {
        return (
            <View style={[{backgroundColor: '#EDECF2', flex: 1,}, CommonStyle.backgroundColor]}>
                <View style={{backgroundColor: '#EDECF2'}}>
                    {this._renderChoice()}
                    {this._renderSubTitle('审批意见',)}
                    <View style={{backgroundColor: 'white', paddingHorizontal: 14,}}>
                        <CountTextInputNew
                            maxLength={1000}
                            value={this.state.processedAdvise || ''}
                            callback={(text) => this.setState({processedAdvise: text,})}
                            stateCallback={() => {
                            }}
                            placeholder="请在此描述您的备注..."
                        />
                    </View>
                </View>
            </View>
        );
    }

    _renderSubTitle(subTitle, renderFn) {
        const showTips = !!this.opinionRequired;
        return (
            <View style={{
                backgroundColor: '#3388d21f', paddingHorizontal: 14, flexDirection: 'row',
                alignItems: 'center', marginTop: 0,
            }}>
                {/*<View style={{height: 16, width: 2, backgroundColor: '#3388d2', marginRight: 5,}}/>*/}
                <Text style={{fontSize: 16, color: '#3388d2', marginTop: 14, marginBottom: 14,}}>{subTitle}</Text>
                {showTips ? <Text style={{color: 'red'}}>*</Text> : null}
            </View>
        );
    }

    _pushOpinionAndToNext(Comp, submitModel) {
        const isSubmit = submitModel == 'submit';
        const advice = this.state.processedAdvise || '';
        const phaseChoice = CommonFunc.getValue(this.state.choiceInfo, 'phaseChoice');
        const emptyChoice = this._isEmptyStr(phaseChoice);
        const emptyAdvice = this._isEmptyStr(advice);
        const hasOpinion = !emptyChoice || !emptyAdvice;
        const param = {
            serialNo: this.props.param.serialNo,
            opinionNo: AppStore.getUserID(),
            phaseOpinion: this.state.processedAdvise,
            phaseChoice: phaseChoice,
        };
        const opinionRequired = this.props.param.opinionRequired;
        if (!opinionRequired || hasOpinion) {//意见非必填、或者填写意见了
            if (hasOpinion) {//意见非空
                TodoTaskActions.pushOpinion(param, (response) => {
                    this._toNext(isSubmit, Comp, submitModel);
                }, (error) => {
                    CommonFunc.alert(error);
                });
            } else {
                this._toNext(isSubmit, Comp, submitModel);
            }
        } else {//意见必填、且未填写
            CommonFunc.alert('意见必填,请填写审批意见！');
        }
    }

    _toNext(isSubmit, Comp, submitModel) {
        if (isSubmit) {
            TodoTaskActions.submitDetectRisk({
                    objectNo: this.props.param.objectNo,
                    serialNo: this.props.param.serialNo,
                },
                (responseData) => {
                    if (responseData.autoResult !== true) {
                        const msg = CommonFunc.getCheckResultMsg(responseData.autoDetail || []);
                        CommonFunc.alert(msg);
                    } else {
                        this._toNextPage(Comp, submitModel);
                    }
                }, (error) => {
                    CommonFunc.alert(error);
                });
        } else {
            this._toNextPage(Comp, submitModel);
        }
    }

    _toNextPage(Comp, submitType) {
        this.props.navigator.push({
            id: '' + Comp,
            comp: Comp,
            param: {
                submitMode: submitType,
                ...this.props.param,
            }
        })
    }

    _renderRNButton() {
        const allowBack = this.props.param.allowBack;
        const btns = [{text: '提交', onPress: () => this._pushOpinionAndToNext(CommitDirector, 'submit')}];
        if (allowBack) {
            const backBtnInfo = {text: '退回', onPress: () => this._pushOpinionAndToNext(BackStepDirector, 'backStep')};
            btns.unshift(backBtnInfo);
        }
        return (
            <CommonButtons
                buttons={btns}
            />
        );
    }

    _renderFlowInfo () {
        const text = (this.props.param && this.props.param.flowInfoText) || '';
        if (!text) {
            return null;
        }
        return (
            <View
                style={{paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F4F4F4',}}
            >
                <Text>{text}</Text>
            </View>
        );
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="签署意见"
                goBack={true}
                contentMarginBottom={24}
            >
                {this._renderFlowInfo()}
                <ScrollView
                    contentContainerStyle={{flex: 1,}}
                >
                    <View
                        style={{backgroundColor: '#F5F5F5', flex: 1,}}
                    >
                        {this._renderContent()}
                        {this._renderRNButton()}
                    </View>
                </ScrollView>
            </NavigationBar>
        );
    }
}

