// @flow

import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import ChatScreen from '~/ui/screens/ChatScreen';
import SignUpScreen from '~/ui/screens/SignUpScreen';
import MessagesScreen from '~/ui/screens/MessagesScreen';
import PeopleScreen from '~/ui/screens/PeopleScreen';

import {Routes} from '~/constants';

const AppNavigator = createStackNavigator(
  {
    [Routes.messages]: MessagesScreen,
    [Routes.chat]: ChatScreen,
    [Routes.people]: PeopleScreen
  },
  {
    headerMode: 'none'
  }
);

const RootNavigator = createSwitchNavigator(
  {
    Auth: SignUpScreen,
    App: AppNavigator
  }
);

export default createAppContainer(RootNavigator);
