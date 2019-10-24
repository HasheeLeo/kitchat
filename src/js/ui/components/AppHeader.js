// @flow

import React from 'react';
import {Body, Button, Header, Icon, Left, Right, Title} from 'native-base';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

type Props = {
  renderLeft?: () => React$Element<any>,
  navigation: NavigationScreenProp<NavigationState>,
  title: string
};

export default (props: Props) => (
  <Header>
    <Left>
      {props.renderLeft && props.renderLeft()}
      {!props.renderLeft && (
        <Button transparent onPress={() => props.navigation.goBack()}>
          <Icon name='arrow-back' />
        </Button>
      )}
    </Left>
    <Body>
      <Title>{props.title}</Title>
    </Body>
    <Right />
  </Header>
);
