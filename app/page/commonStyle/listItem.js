/**
 * Created by edz on 2018/2/6.
 */

import ListItemStyle from './listItemStyle';
import ListItemStyle2 from './listItemStyle2';

const styleNum = 1;

const ItemStyle = styleNum == 1 ? ListItemStyle : ListItemStyle2;
module.exports = ItemStyle;