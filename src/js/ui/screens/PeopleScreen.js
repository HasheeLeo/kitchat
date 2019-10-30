// @flow

import React, {Component} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {Container, Body, H2, ListItem, Right, Text, View} from 'native-base';

import axios from 'axios';
import AppHeader from '~/ui/components/AppHeader';

import AccountApi from '~/app/api/AccountApi';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

import {Routes, SERVER_IP} from '~/constants';
import {People} from '~/strings';

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

type State = {
  people: Array<string>
};

class PeopleScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      people: []
    };
  }

  async componentDidMount() {
    // Writing without abstraction because this will change anyway
    try {
      const response = await axios.get(`http://${SERVER_IP}/all-users`);
      const userId = AccountApi.getUserId();
      if (response.data) {
        const users = response.data.filter(user => user !== userId);
        this.setState({people: users});
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  render() {
    let content;
    if (this.state.people.length == 0) {
      content = (
        <View style={styles.noPeopleContainer}>
          <H2 style={styles.noPeopleText}>{People.noPeople}</H2>
        </View>
      );
    }
    else {
      content = (
        <FlatList
          data={this.state.people}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <ListItem
              onPress={() => {
                this.props.navigation.goBack();
                this.props.navigation.getParam('onNewConversation')(item);
              }}
            >
              <Body>
                <Text>{item}</Text>
              </Body>
              <Right />
            </ListItem>
          )}
        />
      );
    }
    return (
      <Container>
        <AppHeader navigation={this.props.navigation} title={People.header} />
        {content}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  noPeopleContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },

  noPeopleText: {
    textAlign: 'center'
  }
});

export default PeopleScreen;
