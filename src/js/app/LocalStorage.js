// @flow

import {GiftedChat} from 'react-native-gifted-chat';

import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs';

import base64ToType from '~/helpers/base64ToType';
import {type Conversation, type GCMessageObject} from '~/typedefs';

class LocalStorage {
  static isSavingMessage: boolean;

  // Load the images associated with the messages
  static loadMessagesImages(messages: Array<GCMessageObject>) {
    messages.forEach(message => {
      if (message.attachmentPath && !message.documentName)
        message.image = `file://${message.attachmentPath}`;
    });
  }

  static async loadConversations() {
    try {
      const conversations = await AsyncStorage.getItem('conversations');
      if (conversations)
        return JSON.parse(conversations);
      else
        return null;
    }
    catch (e) {
      console.log(e);
    }
  }

  static async loadDeviceToken() {
    try {
      const token = await AsyncStorage.getItem('deviceToken');
      if (token)
        return token;
      else
        return null;
    }
    catch (e) {
      console.log(e);
    }
  }

  static async loadMessages(conversationId: string) {
    try {
      let messages = await AsyncStorage.getItem('messages');
      if (messages) {
        messages = JSON.parse(messages);
        if (messages[conversationId]) {
          messages = messages[conversationId];
          LocalStorage.loadMessagesImages(messages);
          return messages;
        }
      }
      return [];
    }
    catch (e) {
      console.log(e);
    }
  }

  static async loadSession() {
    try {
      let session = await AsyncStorage.getItem('session');
      if (session)
        session = JSON.parse(session);
      
      return session;
    }
    catch (e) {
      console.log(e);
    }
  }

  static async saveConversations(conversations: Array<Conversation>) {
    try {
      await AsyncStorage.setItem('conversations',
        JSON.stringify(conversations)
      );
    }
    catch (e) {
      console.log(e);
    }
  }

  static async saveDeviceToken(token: string) {
    try {
      await AsyncStorage.setItem('deviceToken', token);
    }
    catch (e) {
      console.log(e);
    }
  }

  static async saveFile(id: string, file: string) {
    try {
      const typeData = base64ToType(file);
      if (typeData) {
        let path = `${RNFS.DocumentDirectoryPath}/${id}`;
        if (typeData.ext)
          path = `${path}.${typeData.ext}`;
        
        await RNFS.writeFile(path, file, 'base64');
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  static async saveMessage(conversationId: string,
    message: GCMessageObject)
  {
    try {
      if (LocalStorage.isSavingMessage) {
        setTimeout(() => LocalStorage.saveMessage(conversationId, message), 10);
        return;
      }

      LocalStorage.isSavingMessage = true;
      let savedMessages = await AsyncStorage.getItem('messages');
      if (savedMessages)
        savedMessages = JSON.parse(savedMessages);
      else
        savedMessages = {};

      savedMessages[conversationId] = GiftedChat.append(
        savedMessages[conversationId],
        message
      );
      savedMessages[conversationId].sort((a, b) => {
        const aS = a.createdAt.split(/\D+/);
        const bS = b.createdAt.split(/\D+/);
        const dateA = new Date(
          Date.UTC(aS[0], --aS[1], aS[2], aS[3], aS[4], aS[5], aS[6])
        );
        const dateB = new Date(
          Date.UTC(bS[0], --bS[1], bS[2], bS[3], bS[4], bS[5], bS[6])
        );
        if (dateA < dateB)
          return 1;
        else if (dateA > dateB)
          return -1;
        else
          return 0;
      });
      await AsyncStorage.setItem('messages', JSON.stringify(savedMessages));
      LocalStorage.isSavingMessage = false;
    }
    catch (e) {
      console.log(e);
    }
  }

  static async saveSession(email: string, password: string) {
    try {
      const session = {email, password};
      await AsyncStorage.setItem('session', JSON.stringify(session));
    }
    catch (e) {
      console.log(e);
    }
  }
};

export default LocalStorage;
