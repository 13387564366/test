
const CommonFunc = {

  stringfy(text) {
    if (text === undefined) {
      return '';
    }
    return text;
  },

  /**
   * 过滤单位
   * @param str
   */
  filterFont(str) {
    if (str === '万' || str === '亿' || str === '天' || str === '年' || str === '月' || str === '%'
      || str === '日' || str === '平方米' || str === '人') {
      return str;
    }
    return '';
  },

  /**
   * 处理post特殊字符
   */
  encodeZh(str) {
    return encodeURI(encodeURI(str.replace(/\&/g, '%26') // eslint-disable-line no-useless-escape
        .replace(/\//g, '%2F')
        .replace(/\?/g, '%3F')
        .replace(/\!/g, '%21') // eslint-disable-line no-useless-escape
        .replace(/\#/g, '%23') // eslint-disable-line no-useless-escape
        .replace(/\$/g, '%24')
        .replace(/\'/g, '%27') // eslint-disable-line no-useless-escape
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\+/g, '%2B')
        .replace(/\@/g, '%40') // eslint-disable-line no-useless-escape
        .replace(/\=/g, '%3D') // eslint-disable-line no-useless-escape
    ));
  },

  /*
   * 检测对象是否是空对象(不包含任何可读属性)。
   * 方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使hasOwnProperty)。
   */
  isEmpty(obj) {
    for (let name in obj) { // eslint-disable-line
      return false;
    }
    return true;
  },

  /*
   * 检测对象是否是空对象(不包含任何可读属性)。
   * 方法只既检测对象本身的属性，不检测从原型继承的属性。
   */
  isOwnEmpty(obj) {
    for (let name in obj) { // eslint-disable-line
      if (obj.hasOwnProperty(name)) {
        return false;
      }
    }
    return true;
  },

  navigate(navigator, data) {
    return navigator.push(data);
  },

  goTo(navigator, data) {
    // this.props.navigator.popToRoute(this.props.navigator.getCurrentRoutes()[1]);
    return navigator.popToRoute(data);
  },

  goHome(navigator) {
    return navigator.popToRoute(navigator.getCurrentRoutes()[0]);
  },

  goList(navigator) {
    return navigator.popToRoute(navigator.getCurrentRoutes()[1]);
  },

  goMemberList(navigator) {
    return navigator.popToRoute(navigator.getCurrentRoutes()[2]);
  },

  fomatDate(date, fmt) {
    const o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));// eslint-disable-line
    for (const k in o) // eslint-disable-line
      if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));// eslint-disable-line
    return fmt;
  },

};


module.exports = CommonFunc;
