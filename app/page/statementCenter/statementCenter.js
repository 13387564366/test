/**
 * Created by cui on 11/2/16.
 */

import React from 'react';
import {
    View,
    Text,
    ListView,
    Platform,
    Alert,
    Dimensions,
    TouchableOpacity,
    InteractionManager
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import GeneralStatementList from './generalStatementListForYueShengKe';
// import GraphStatementListPage from './graphStatementListNew'

export default class StatementCenter extends React.Component {

    constructor(props) {
        super(props);
        this._getDispalyTypePage = this._getDispalyTypePage.bind(this);
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={this.props.param.page == 0 ? "报表中心" : '图表中心'}
                goBack={this.props.param ? this.props.param.goBack : false}
            >
                {this._getDispalyTypePage(this.props.param.page)}
            </NavigationBar>
        );
    };

    _getDispalyTypePage(page) {
        if (page == 0) {
            return <GeneralStatementList
                tabLabel=""
                navigator={this.props.navigator}
            />
        }
        // else if (page == 1) {
        //     return <GraphStatementListPage
        //         tabLabel=""
        //         navigator={this.props.navigator}
        //     />
        // } else {
        //     return <View/>
        // }
    }
}