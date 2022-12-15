
const keyMirror = require('keymirror');

const AppConstants = keyMirror({
  INIT_PROFILE: null,
  INIT_LOGIN: null,

  LOADING_SHOW: null,
  LOADING_HIDE: null,

  REFRESH_DARA: null,//通用数据刷新通知ID

  REFRESH_DATA_READ: null,//刷新传阅数据通知ID
  
  LOGIN: null,
  LOGOUT: null,
  FORCE_LOGOUT: null,
  
  FETCH_GENERAL_STATEMENT: null,
  FETCH_GRAPHA_STATEMENT: null,
    PWD_CHANGED:null,
});

module.exports = AppConstants;
