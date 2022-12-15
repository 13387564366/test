
import {
  StyleSheet,
  Dimensions
  } from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const CommonStyle = StyleSheet.create({
  fullscreen: {
    flex: 1,
    // height: deviceHeight,
    // width: deviceWidth
  },

  block: {
    flex: 1
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  paddingLeft: {
    paddingLeft: 10
  },

  paddingHorizontal: {
    paddingHorizontal: 10
  },

  marginVertical: {
    marginVertical: 10
  },

  backgroundColor: {
    backgroundColor: '#F1F2F7'
  },

  borderColor: {
    borderColor: '#D3D3D3'
  },

  fontColor: {
    color: 'grey'
  },

  fontSize: {
    fontSize: 16
  },

  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9'
  },

  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 3,
    color: 'grey'
  },

  plainText: {
    color: 'grey',
    fontSize: 16,
    paddingLeft: 10,
    marginVertical: 10
  },

  subText: {
    color: 'grey',
    fontSize: 14,
    paddingLeft: 10,
    marginVertical: 3
  },

  line: {
    borderBottomWidth: 1,
    marginVertical: 2,
    borderColor: '#D3D3D3'
  },

  row: {
    flexDirection: 'row'
  },

  column: {
    flexDirection: 'column'
  },

  statusBar: {
    backgroundColor: 'transparent',
    height: 20,
  },

  content: {
    backgroundColor: '#F4F4F4',
    height: deviceHeight - 64,
  },

  contentWatermask: {
    backgroundColor: 'rgba(0,0,0,0)',
    height: deviceHeight - 64,
  },

  navContent: {
    backgroundColor: '#F4F4F4',
    height: deviceHeight - 114,
  },

  navContentWatermask: {
    backgroundColor: 'rgba(0,0,0,0)',
    height: deviceHeight - 64,
  },

  navContentTab: {
    marginTop: 60,
    backgroundColor: '#F4F4F4',
    // paddingBottom: 10,
    height: deviceHeight - 104,
  },

  scrollContent: {
    height: deviceHeight - 104,
    backgroundColor: 'rgba(0,0,0,0)',
  },

  scrollContentTab: {
    backgroundColor: '#F4F4F4',
    height: deviceHeight - 104,
  },

  scrollContentTabWatermask: {
    backgroundColor: 'rgba(0,0,0,0)',
    height: deviceHeight - 104,
  },
  scrollContentHeight: {
    backgroundColor: '#F4F4F4',
    height: deviceHeight
  },

  btnContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: '#F4F4F4',
  },

  btnHolder: {
    justifyContent: 'space-around',
    margin: 5,
    alignItems: 'center',
    // borderWidth: 1,
    borderRadius: 3,

    flex: 1,
    height: 40,
    alignSelf: 'stretch',
    backgroundColor: '#E05D13',
    flexDirection: 'row',
    //flexWrap: 'nowrap'
  },

  btnText: {
    color: 'white',
    letterSpacing: 4
  },

  btnIcon: {
    height: 20,
    width: 20,
    marginRight: 5,
  },

  btnLabel: {
    color: 'white',
    // letterSpacing: 2,
    fontSize: 16,
    alignSelf: 'center'
  },
  contentFull: {
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: '#F4F4F4',
  },
});

module.exports = CommonStyle;
