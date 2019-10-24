// @flow

import React, {Component} from 'react';
import {FlatList, StyleSheet} from 'react-native';
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

import attachWithMessage from '~/helpers/attachWithMessage';
import AppHeader from '~/ui/components/AppHeader';

import LocalStorage from '~/app/LocalStorage';
import MessageApi from '~/app/MessageApi';
import SessionFactory from '~/app/SessionFactory';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

import {Routes} from '~/constants';
import {Messages} from '~/strings';
import {
  type Attachment,
  type Conversation,
  type GCMessageObject
} from '~/typedefs';

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

type State = {
  conversations: Array<Conversation>
};

class MessagesScreen extends Component<Props, State> {
  conversationExists: (id: string) => void;
  onReceiveMessage: (
    gcMessage: GCMessageObject,
    attachment?: Attachment
  ) => void;
  navigateToChat: (userId: string, name: string) => void;
  newConversation: (userId: string) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      conversations: []
    };

    this.conversationExists = this.conversationExists.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    this.navigateToChat = this.navigateToChat.bind(this);
    this.newConversation = this.newConversation.bind(this);
  }

  async componentDidMount() {
    SessionFactory.createSession();
    const conversations = await LocalStorage.loadConversations();
    if (conversations)
      this.setState({conversations: conversations});
    
    MessageApi.listen(this.onReceiveMessage);
  }

  componentWillUnmount() {
    SessionFactory.destroySession();
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

  async onReceiveMessage(message: GCMessageObject, attachment?: Attachment) {
    if (attachment) {
      attachWithMessage(message, attachment);
      await LocalStorage.saveFile(message._id, attachment.file);
    }
    let withoutImageBlob = Object.assign({}, message);
    withoutImageBlob.image = undefined;
    await LocalStorage.saveMessage(message.user._id, withoutImageBlob);

    if (!this.conversationExists(message.user._id))
      this.setState(prevState => ({
        conversations: [...prevState.conversations, {
          id: message.user._id,
          name: message.user._id
        }]
      }));
  }

  navigateToChat(userId: string, name: string)
  {
    this.props.navigation.navigate(Routes.chat, {
      id: userId,
      name: name
    });
  }

  newConversation(userId: string) {
    if (!this.conversationExists(userId))
      this.setState(prevState => ({
        conversations: [...prevState.conversations, {
          id: userId,
          name: userId
        }]}),
        () => LocalStorage.saveConversations(this.state.conversations)
      );
    
    this.navigateToChat(userId, userId);
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
              <Body>
                <Text>{item.name}</Text>
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

        <Footer>
          <Fab onPress={() => this.props.navigation.navigate(Routes.people, {
            newConversation: this.newConversation
          })}>
            <Icon name='add' />
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
  }
});

export default MessagesScreen;
