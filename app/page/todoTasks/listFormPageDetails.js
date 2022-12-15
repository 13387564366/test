/**
 * Created by Administrator on 2016/11/15.
 */
import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  InteractionManager,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';

import TodoTaskActions from '../../actions/FlowActions';
import NavigationBar from '../../components/navigator/NavBarView'
import EmptyData from '../../components/emptyData/emptyData';
import Icon from 'react-native-vector-icons/FontAwesome';
import FormDetailPage from './formDetailPage';
import FormDetailPageForSave from './formDetailPageForSave';
import ListFormPage from './listFormPage';
import RentListStylePage from './rentListStylePage';
import CommonStyle from '../../modules/CommonStyle'
import CommonFunc from '../commonStyle/commonFunc';
import AttachmentListPage from './attachmentListPage';
import {
  GROUP_DISPLAY_KEY,
  GROUP_SUB_PAGE_KEY,
  PAGE_IS_LIST_KEY,
  PAGE_ID_KEY,
  PARAMS_ARR_KEY,
  PRODUCT_FLOW_KEY,
  MENU_CHANGE_EVENT,
  MENU_INFO_CHANGE_EVENT,
  handleMenuInfos,
  ATTACHMENT_PAGE_ID,
  PAGE_STYLE_KEY,
} from './menuHandler';
import CommonButtons from "../commonStyle/commonButtons";
import SignOpinions from "./signOpinions";

export default class ListFormPageDetails extends Component {
  constructor(props) {
    super(props);
    this._fetchListPageDetails = this._fetchListPageDetails.bind(this);
    this.state = {
      dataSource: [],
      groupInfo: null,
    };
    this.title = this.props.param.title;//获取流程的标题
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(() => this._fetchListPageDetails());
  }
  _fetchListPageDetails () {
    const groupInfo = this.props.param.groupInfo;
    const detailPageInfo = this.props.param.detailPageInfo;
    if (detailPageInfo.length) {
      this.setState({groupInfo: groupInfo, dataSource: detailPageInfo});
    }
  }
  _handlePostParam (postParam, paramKeys, listData) {
    paramKeys.forEach(paramKey => {
      // 以@@分割需要替换的参数 前面的为查找的参数名 后面的为传递的参数名
      const keysArr = paramKey.split('@@')||[];
      let firstKey,lastKey;
      if (keysArr.length==2) {
        firstKey = keysArr[0];
        lastKey = keysArr[1];
      }else{
        firstKey = lastKey = paramKey;
      }
      let temp = this._getValueByKey(listData, firstKey);
        if (temp) {
          postParam[lastKey] = temp;
        }
    });
  }
  _getValueByKey (listData, key = '') {
    let value = null;
    const lowerKey = key.toLowerCase();
    for (let listKey in listData) {
      const tempKey = listKey.toString().toLowerCase();
      if (lowerKey == tempKey) {
        value = CommonFunc.getValueByKeyArr(listData, [listKey, 'itemno']);
      }
    }
    return value;
  }
  _toFormDetailPage (detailPageInfo) {
    let isList = detailPageInfo[PAGE_IS_LIST_KEY];
    const prevDepth = this.props.param.listDepth || 1;
    const listDepth = isList ? (prevDepth + 1) : '';
    const Comp = isList ? ListFormPage : FormDetailPage;
    const displayName = detailPageInfo[GROUP_DISPLAY_KEY];
    const postParam = Object.assign({}, this.props.param.postParam);
    CommonFunc.handlePostParam(postParam, detailPageInfo[PARAMS_ARR_KEY],this.props.param.listData);
    postParam.pageId = detailPageInfo[PAGE_ID_KEY];
    const param = {
      postParam: postParam,
      title: displayName,
    };
    if (isList) {
      const nextPageInfo = detailPageInfo.detailPageInfo;
      const dowoloadable = detailPageInfo.downloadable;
      const downloadParam = detailPageInfo.downloadParam;
      param.downloadable = dowoloadable;
      param.downloadParam = downloadParam;
      param.listDepth = listDepth;
      param.detailPageInfo = nextPageInfo;
    }
    this.props.navigator.push({
      id: '' + Comp,
      comp: Comp,
      param: param,
    });
  }
  _renderCommonGroup (rowData, isProduct, flowKey) {
    let displayText = rowData[GROUP_DISPLAY_KEY];
    const pageId = rowData[PAGE_ID_KEY];
    const isAttachment = pageId === ATTACHMENT_PAGE_ID;
    return (
      <TouchableOpacity
        onPress={() => this._toFormDetailPage(rowData, isProduct, flowKey)}
      >
        <View style={{
          backgroundColor: 'white', paddingHorizontal: 14, flexDirection: 'row',
          alignItems: 'center', marginTop: 5, justifyContent: 'space-between',
        }}>
          <View style={{flexDirection: 'row', alignItems: 'center', }}>
            {
              isAttachment ?
                <Image source={require('../../image/list_icon_blue.png')} />
                :
                <Image source={require('../../image/list_icon.png')} />
            }
            <Text style={{
              marginLeft: 10,
              color: '#000',
              marginVertical: 12,
            }}>{displayText}</Text>
          </View>
          <Icon name={'angle-right'} size={25} color={'#767A8B'} />
        </View>
      </TouchableOpacity>

    );
  }

  _renderGroups () {
    let length = this.state.dataSource.length;
    let pageArr = [];
    let i = 0;
    for (; i < length; i++) {
      let child = this._renderCommonGroup(this.state.dataSource[i]);
      let itemContainer = (
        <View key={i}>
          {child}
        </View>);
      pageArr.push(itemContainer);
    }
    return pageArr;
  }
  _getPaddingBottom () {
    return Platform.OS === 'android' ? 24 : 10;
  }

  _renderDataAndGroup () {
    if (!this.state.dataSource.length > 0) {
      return (
        <EmptyData
          style={{flex: 1, backgroundColor: '#F0F0F0', }}
          refreshStyle={{
            borderColor: '#F4F4F4', height: 30, marginTop: 20,
            borderWidth: 1, borderRadius: 5
          }}
          textStyle={{fontSize: 14, height: 30, marginTop: 10}}
        />
      );
    }
    return (
      <View>
        {this._renderGroups()}
      </View>
    );
  }

  render () {
    const paddingBottom = this._getPaddingBottom();
    const contentPaddingBottom = this._getPaddingBottom() + 0;
    return (
      <NavigationBar
        navigator={this.props.navigator}
        goBack={true}
        title={this.props.param.title}
        contentMarginBottom={24}
      >
        <View
          style={{flex: 1, paddingBottom: paddingBottom}}
        >
          <ScrollView
            style={[{flexDirection: 'column', backgroundColor: 'transparent'}, CommonStyle.backgroundColor]}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={{flex: 1, justifyContent: 'space-between', paddingBottom: contentPaddingBottom}}>
              {this._renderDataAndGroup()}
            </View>
          </ScrollView>
        </View>
      </NavigationBar>
    );
  }
}