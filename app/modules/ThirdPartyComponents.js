/**
 * 第三方组件，方便管理 By Tenwa
 */

import  CommonStyle from './CommonStyle';
import  CommonLink from './CommonLink';
import  _ from 'lodash';
import AppStore from '../stores/AppStore';
import AppActions from '../actions/AppActions';
import NavBarView from '../components/navigator/NavBarView';
import CommonFunc from './CommonFunc';

const ThirdPartyComponents = {
    CommonStyle,
    CommonLink,
    _,
    AppStore,
    AppActions,
    NavBarView,
    CommonFunc,
};
module.exports = ThirdPartyComponents;