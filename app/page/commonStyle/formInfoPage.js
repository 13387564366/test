/**
 * Created by admin on 2018/8/21.
 */
import React from 'react';
import {
    ScrollView,
}from 'react-native';

import FormInfo from './formInfo';
import NavigationBar from '../../components/navigator/NavBarView';

export default class FormInfoPage extends React.Component {
    render() {
        const datas = this.props.param.datas || [];
        const title = this.props.param.title || '详情';
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={title}
                goBack={true}
                contentMarginBottom={24}
            >
                <ScrollView>
                    <FormInfo
                        datas={datas}
                        keyIndex={title}
                        renderFilterFunc={(dataObj) => dataObj.colvisible == '1'}
                    />
                </ScrollView>
            </NavigationBar>
        );
    }
}
