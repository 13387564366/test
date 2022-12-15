/**
 * Created by amarsoft on 2016/11/3.
 */
import React, {Component} from 'react'
import {
    View,
    Platform,
} from 'react-native';
import ScrollableTabView from '../../components/ScrollableTabView/ScrollableTabView';
import DefaultTabBar from '../../components/ScrollableTabView/DefaultTabBar';
import NavigationBar from '../../components/navigator/NavBarView';
import CommpletedView from './completedListPage';
import TodoTaskListPage from './todoTaskListPage';
import ReadingViewPage from './readingTaskListPage';
import ReadedViewPage from './readedTaskListPage';

export default class TodoTask extends Component {
    // 构造
    constructor(props) {
        super(props);
    }

    render() {
        return (

            <NavigationBar
                navigator={this.props.navigator}
                isEmptBottom={true}
                title="流程待办"
                goBack={this.props.param ? this.props.param.goBack : false}
            >
                <View style={{flex: 1, backgroundColor: '#F4F4F4'}}>
                    <ScrollableTabView
                        style={{backgroundColor: 'transparent'}}
                        bounces={true}
                        scrollWithoutAnimation={true}
                        tabBarBackgroundColor="white"
                        tabBarUnderlineColor="white"
                        tabBarActiveTextColor="red"
                        tabBarInactiveTextColor="#000"
                        renderTabBar={()=>
                            <DefaultTabBar
                                style={{height: 45, borderColor: 'white',}}
                                underlineStyle={{height: 2, backgroundColor: 'red',}}
                                backgroundColor='rgba(255, 255, 255, 0.7)'
                                textStyle={{fontSize: 15,}}
                                tabStyle={{paddingBottom: 0,}}
                            />
                        }
                    >
                        <TodoTaskListPage
                            tabLabel="待办"
                            navigator={this.props.navigator}
                            showSearchBar={true}
                        >
                        </TodoTaskListPage>
                        <CommpletedView
                            tabLabel="已办"
                            navigator={this.props.navigator}
                            showSearchBar={true}
                        >
                        </CommpletedView>
                        <ReadingViewPage
                            tabLabel="待阅"
                            navigator={this.props.navigator}
                        />
                        <ReadedViewPage
                            tabLabel="已阅"
                            navigator={this.props.navigator}
                        />
                    </ScrollableTabView>
                </View>
            </NavigationBar>
        )
    }
}