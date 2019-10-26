// @flow

import React, {Component} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import RNFS from 'react-native-fs';

import uuidv4 from 'uuid/v4';

import Chat from '~/ui/components/Chat/Chat';

import AccountApi from '~/app/AccountApi';
import LocalStorage from '~/app/LocalStorage';
import MessageApi from '~/app/MessageApi';

import onMessageCreated from '~/helpers/onMessageCreated';

import {DocumentPickerResponse} from 'react-native-document-picker';
import {ImagePickerResponse} from 'react-native-image-picker';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

import {FileType} from '~/constants';
import {type Attachment, type GCMessageObject} from '~/typedefs';

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

type State = {
  isLoading: boolean,
  messages: Array<GCMessageObject>
};

class ChatScreen extends Component<Props, State> {
  id: string;

  createGCMessage: (text?: string) => GCMessageObject;
  onDocument: (response: DocumentPickerResponse, text: string) => void;
  onPhotos: (response: ImagePickerResponse, text: string) => void;
  onReceiveMessage: (message: GCMessageObject, attachment?: Attachment) => void;
  onSend: (text: string) => void;
  onStopRecording: (audioPath: string) => void;
  sendMessage: (message: GCMessageObject, attachment?: Attachment) => void;
  stopListening: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      messages: []
    };

    this.id = this.props.navigation.getParam('id');

    this.createGCMessage = this.createGCMessage.bind(this);
    this.onDocument = this.onDocument.bind(this);
    this.onPhotos = this.onPhotos.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    this.onSend = this.onSend.bind(this);
    this.onStopRecording = this.onStopRecording.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  async componentDidMount() {
    const messages = await LocalStorage.loadMessages(this.id);
    this.setState({isLoading: false, messages: messages});

    if (!this.stopListening)
      this.stopListening = MessageApi.listenToId(this.onReceiveMessage, this.id);
  }

  componentWillUnmount() {
    this.stopListening();
  }

  createGCMessage(text?: string) {
    return {
      _id: uuidv4(),
      text: text,
      createdAt: new Date().toISOString(),
      user: {_id: AccountApi.getUserId()},
    };
  }

  async onDocument(response: DocumentPickerResponse, text: string) {
    const file = await RNFS.readFile(response.uri, 'base64');
    const attachment = {
      file: file,
      fileName: response.name,
      fileType: FileType.document
    };
    const message = this.createGCMessage(text);
    this.sendMessage(message, attachment);
  }

  async onPhotos(response: ImagePickerResponse, text: string) {
    const file = await RNFS.readFile(response.uri, 'base64');
    const attachment = {
      file: file,
      fileName: response.fileName,
      fileType: FileType.image
    };
    const message = this.createGCMessage(text);
    this.sendMessage(message, attachment);
  }

  async onReceiveMessage(message: GCMessageObject, attachment?: Attachment) {
    await onMessageCreated(message.user._id, message, attachment);
    this.setState(prevState => ({
      messages: GiftedChat.append(prevState.messages, message)
    }));
  }

  onSend(text: string) {
    let message = this.createGCMessage(text);
    this.sendMessage(message);
  }

  async onStopRecording(audioPath: string) {
    let voiceMessage = this.createGCMessage();
    voiceMessage.voice = true;
    voiceMessage.voicePath = audioPath;
    this.setState(prevState => ({
      messages: GiftedChat.append(prevState.messages, voiceMessage)
    }));
  }

  async sendMessage(message: GCMessageObject, attachment?: Attachment) {
    await onMessageCreated(this.id, message, attachment);
    this.setState(prevState => ({
      messages: GiftedChat.append(prevState.messages, message)
    }));
    MessageApi.sendMessage(this.id, message, attachment);
  }

  render() {
    return (
      <Chat
        isLoading={this.state.isLoading}
        messages={this.state.messages}
        navigation={this.props.navigation}
        userId={AccountApi.getUserId()}
        onDocument={this.onDocument}
        onPhotos={this.onPhotos}
        onSend={this.onSend}
        onStopRecording={this.onStopRecording}
      />
    );
  }
};

export default ChatScreen;
