// @flow

import React, {Component} from 'react';
import {Alert} from 'react-native';
import {
  Button,
  Container,
  Icon,
  Spinner
} from 'native-base';
import {Bubble, GiftedChat} from 'react-native-gifted-chat';
import AudioRecord from 'react-native-audio-record';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import {PERMISSIONS, request} from 'react-native-permissions';
import Sound from 'react-native-sound';

import Actions from '~/ui/components/Chat/Actions';
import AppHeader from '~/ui/components/AppHeader';
import Attachment from '~/ui/components/Chat/Attachment';
import Microphone from '~/ui/components/Chat/Microphone';

import {DocumentPickerResponse} from 'react-native-document-picker';
import {ImagePickerResponse} from 'react-native-image-picker';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

import COLORS from '~/ui/colors';
import {MAX_ATTACHMENT_SIZE} from '~/constants';
import {Chat as ChatStrings} from '~/strings';

type Props = {
  isLoading: boolean,
  messages: Array<any>,
  navigation: NavigationScreenProp<NavigationState>,
  userId: string,
  onDocument: (response: DocumentPickerResponse, text: string) => void,
  onPhotos: (response: ImagePickerResponse, text: string) => void,
  onSend: (text: string) => void,
  onStopRecording: (audioPath: string) => void
};

type State = {
  isRecording: boolean,
  text: string
};

class Chat extends Component<Props, State> {
  attachmentLimitAlert: () => void;
  onDocument: () => void;
  onPhotos: () => void;
  onPlayVoice: () => void;
  onSend: () => void;
  toggleRecording: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      isRecording: false,
      text: ''
    };

    this.attachmentLimitAlert = this.attachmentLimitAlert.bind(this);
    this.onDocument = this.onDocument.bind(this);
    this.onPhotos = this.onPhotos.bind(this);
    this.onPlayVoice = this.onPlayVoice.bind(this);
    this.onSend = this.onSend.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
  }

  async componentDidMount() {
    //await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16
    };
    AudioRecord.init(options);
  }

  attachmentLimitAlert() {
    Alert.alert(ChatStrings.attachmentLimitTitle, ChatStrings.attachmentLimit);
  }

  async onDocument() {
    try {
      const response = await DocumentPicker.pick({
        type: DocumentPicker.types.allFiles
      });
      if (response.size > MAX_ATTACHMENT_SIZE) {
        this.attachmentLimitAlert();
        return;
      }
      this.props.onDocument(response, this.state.text);
      this.setState({text: ''});
    }
    catch (e) {
      if (DocumentPicker.isCancel(e))
        return;
      
      console.log(e);
    }
  }

  onPhotos() {
    const options = {mediaType: 'photo', noData: true};
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel)
        return;
      
      if (response.fileSize > MAX_ATTACHMENT_SIZE) {
        this.attachmentLimitAlert();
        return;
      }
      this.props.onPhotos(response, this.state.text);
    });
    this.setState({text: ''});
  }

  onPlayVoice(audioPath: string) {
    const audio = new Sound(audioPath);
    audio.play();
  }

  onSend() {
    if (!this.state.text)
      return;
    
    this.props.onSend(this.state.text);
    this.setState({text: ''});
  }

  async toggleRecording() {
    if (this.state.isRecording) {
      this.setState({isRecording: false});
      const audioPath = await AudioRecord.stop();
      this.props.onStopRecording(audioPath);
    }
    else {
      AudioRecord.start();
      this.setState({isRecording: true});
    }
  }

  render() {
    let content;
    if (this.props.isLoading) {
      content = <Spinner color='blue' />;
    }
    else {
      content = (
        <GiftedChat
          keyboardShouldPersistTaps='handled'
          messages={this.props.messages}
          renderActions={() => (
            <Actions onDocument={this.onDocument} onPhotos={this.onPhotos} />
          )}
          renderBubble={props => (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                },

                right: {
                  backgroundColor: COLORS.brandColor
                }
              }}
            />
          )}
          //renderChatFooter={() => <Microphone onPress={this.toggleRecording} />}
          renderCustomView={({currentMessage}) => {
            if (currentMessage && currentMessage.documentName)
              return <Attachment currentMessage={currentMessage} />;
            else
              return null;
          }}
          
          renderSend={() => (
            <Button transparent onPress={this.onSend}>
              <Icon name='arrow-forward' style={{color: COLORS.brandColor}} />
            </Button>
          )}

          text={this.state.text}
          user={{_id: this.props.userId}}
          onInputTextChanged={text => this.setState({text: text})}
        />
      );
    }
    
    return (
      <Container>
        <AppHeader
          navigation={this.props.navigation}
          title={this.props.navigation.getParam('name').replace(/@[^@]+$/, "")}
        />

        {content}
        
      </Container>
    );
  }
}

export default Chat;
