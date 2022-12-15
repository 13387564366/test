/**
 * Created by yhbao on 2015/12/29.
 */

import dateFormat from 'dateformat';
import _ from 'lodash';
export default {
  format(date, fmt) {
    const o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    };
    let tempFmt = fmt;
    if (/(y+)/.test(fmt)) {
      tempFmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    // for (const k in o) {
    //   if (new RegExp('(' + k + ')').test(tempFmt)) {
    //     tempFmt = tempFmt.replace(RegExp.$1, (RegExp.$1.length === 1) ?
    // (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    //   }
    // }
    Object.keys(o).forEach((k) => {
      if (new RegExp('(' + k + ')').test(tempFmt)) {
        tempFmt = tempFmt.replace(RegExp.$1, (RegExp.$1.length === 1) ?
          (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    });
    return tempFmt;
  },

  formatTimeStamp(string) {
    let tempString = string;
    tempString = string.replace(/-/g, '/');
    const date = new Date(tempString);
    return date.getTime();
  },

  df(data, fmt) {
    return dateFormat(new Date(data), fmt);
  },

  dfy(data) {
    if (_.isString(data)) return data;
    return dateFormat(new Date(data), 'yyyy-mm-dd');
  },

  descDate(time) {
    const now = new Date();
    const tag = new Date(time);
    // var t = now - time;
    if(now.getFullYear()!=tag.getFullYear()){
      return dateFormat(new Date(time), 'yyyy-mm-dd HH:MM');
    }
    if (now.getFullYear() === tag.getFullYear() && now.getMonth() === tag.getMonth()
      && now.getDate() === tag.getDate()) {
      return '今天 ' + dateFormat(new Date(time), 'HH:MM');
    }
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();
    const today = now.getTime() - h * 60 * 60 * 1000 - m * 60 * 1000 - s * 1000 - ms;
    const twoD = today - 1 * 24 * 60 * 60 * 1000;

    if (now.getFullYear() === tag.getFullYear() && tag.getTime() >= twoD) {
      return '昨天 ' + dateFormat(new Date(time), 'HH:MM');
    } else if (now.getFullYear() === tag.getFullYear() && tag.getTime() >= twoD - 1 * 24 * 60 * 60 * 1000) {
      return '前天 ' + dateFormat(new Date(time), 'HH:MM');
    }
    return dateFormat(new Date(time), 'mm-dd HH:MM');
  },

  formatBillDetail(data) {
    return dateFormat(new Date(data), 'yyyy年mm月dd日 HH:MM');
  },

  formatBillList(data) {
    return dateFormat(new Date(data), 'yyyy.mm.dd HH:MM');
  },

  formatBillContent(data) {
    return dateFormat(new Date(data), 'yyyy年mm月dd日');
  },

  formatFlow(data) {
    return dateFormat(new Date(data), 'yyyy.mm.dd');
  },

  returnDate() {
    return 'RZ ' + dateFormat(new Date(), 'yyyy mmdd HHMM');
  }
};
