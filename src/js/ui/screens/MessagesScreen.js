// @flow

import React, {Component} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, TouchableHighlight} from 'react-native';
import {
  Body,
  Button,
  Container,
  Content,
  Fab,
  Footer,
  Header,
  H2,
  Icon,
  Left,
  ListItem,
  Right,
  Text,
  Title,
  View
} from 'native-base';

import AppHeader from '~/ui/components/AppHeader';

import AppStateHandler from '~/app/AppStateHandler';
import LocalStorage from '~/app/LocalStorage';
import MessageApi from '~/app/api/MessageApi';
import NotificationApi from '~/app/api/NotificationApi';
import SessionFactory from '~/app/SessionFactory';

import onMessageCreated from '~/helpers/onMessageCreated';

import COLORS from '../colors';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

import {Image} from 'react-native'

import {Routes} from '~/constants';
import {Messages} from '~/strings';
import {
  type Attachment,
  type Conversation,
  type GCMessageObject
} from '~/typedefs';

var profilePicture = require ('../assets/profile.png');

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

type State = {
  conversations: Array<Conversation>
};

class MessagesScreen extends Component<Props, State> {
  conversationExists: (id: string) => void;
  createConversation: (id: string) => void;
  onReceiveMessage: (
    gcMessage: GCMessageObject,
    attachment?: Attachment
  ) => void;
  onNewConversation: (userId: string) => void;
  navigateToChat: (userId: string, name: string) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      conversations: []
    };

    this.createConversation = this.createConversation.bind(this);
    this.conversationExists = this.conversationExists.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    this.onNewConversation = this.onNewConversation.bind(this);
    this.navigateToChat = this.navigateToChat.bind(this);
  }

  async componentDidMount() {
    SessionFactory.createSession();
    AppStateHandler.init();
    const conversations = await LocalStorage.loadConversations();
    if (conversations)
      this.setState({conversations: conversations});
    
    MessageApi.listen(this.onReceiveMessage);
    await NotificationApi.init();
    const conversationId = await NotificationApi.wasOpenedByNotification();
    if (conversationId)
      this.navigateToChat(conversationId, conversationId);
  }

  componentWillUnmount() {
    AppStateHandler.destroy();
  }

  conversationExists(id: string) {
    let found = false;
    this.state.conversations.forEach(conv => {
      if (conv.id === id)
        found = true;
        return;
    });
    return found;
  }

  createConversation(id: string) {
    if (!this.conversationExists(id))
      this.setState(prevState => ({
        conversations: [...prevState.conversations, {
          id: id,
          name: id
        }]}),
        () => LocalStorage.saveConversations(this.state.conversations)
      );
  }

  async onReceiveMessage(message: GCMessageObject, attachment?: Attachment) {
    await onMessageCreated(message.user._id, message, attachment);
    this.createConversation(message.user._id);
  }

  onNewConversation(userId: string) {
    this.createConversation(userId);
    this.navigateToChat(userId, userId);
  }

  navigateToChat(id: string, name: string)
  {
    this.props.navigation.navigate(Routes.chat, {
      id: id,
      name: name
    });
  }

  render() {
    let content;
    if (this.state.conversations.length == 0) {
      content = (
        <View style={styles.noMessagesContainer}>
          <H2 style={styles.noMessagesText}>{Messages.noMessages}</H2>
        </View>
      );
    }
    else {
      content = (
        <FlatList
          data={this.state.conversations}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ListItem
              onPress={() => this.navigateToChat(
                item.id,
                item.name
              )}
            >
            
            <Body style={styles.threadbody}>
              <TouchableHighlight>
                  <Image source={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' }} style={styles.image} />
              </TouchableHighlight>
              <Text style={styles.threadName}>{item.name.replace(/@[^@]+$/, "")}</Text>
            </Body>
              <Right>
                <Icon name='arrow-forward' />
              </Right>
            </ListItem>
          )}
        />
      );
    }

    return (
      <Container>
        <AppHeader
          renderLeft={() => (
            <Button transparent>
              <Icon name='menu' />
            </Button>
          )}
          navigation={this.props.navigation}
          title={Messages.header}
        />

        {content}

        <Footer style={styles.footer}>
          <Fab style={styles.fab} onPress={() => this.props.navigation.navigate(Routes.people, {
            onNewConversation: this.onNewConversation
          })}>
            <Icon name='mail' />
          </Fab>
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  noMessagesContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },

  noMessagesText: {
    textAlign: 'center'
  },
  fab:{
    backgroundColor: '#68bb59'
  },
  footer: {
    backgroundColor: COLORS.brandColor
  },

  threadbody:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 150 / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "green",
  },

  threadName: {
    paddingLeft: 10,
    paddingTop: 10,
    fontSize: 20,
  }

});

export default MessagesScreen;
