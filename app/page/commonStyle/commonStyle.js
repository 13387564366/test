/**
 * Created by edz on 2017/11/16.
 */
import {
    StyleSheet,
    Platform,
} from 'react-native';
const paddingBottom = Platform.OS == 'android' ? 20 : 0;
const styles = StyleSheet.create({
    backgroundColor: {
        backgroundColor: '#F1F2F7',
    },
    containerStyle: {
        flex: 1,
        backgroundColor: '#F1F2F7',
        justifyContent: 'space-between',
    },
    paddingBottom: {
        paddingBottom: paddingBottom,
    },
});

module.exports = styles;