// @flow

import axios from 'axios';

import SessionFactory from '~/app/SessionFactory';
import {Event, FileType, SERVER_IP} from '~/constants';
import {
  type Attachment,
  type GCMessageObject,
  type MessageObject
} from '~/typedefs';

type listenCallback = (
  message: GCMessageObject,
  attachment?: Attachment
) => void;

class MessageApi {
  // Used to ensure only one global listener is active at a time
  static globallyRegistered: boolean;

  // Used to detect which conversation thread client is listening to
  // actively
  static conversationId: string|null;

  static GCMessageToMessage(receiverId: string, gcMessage: GCMessageObject,
    attachment?: Attachment)
  {
    return {
      id: gcMessage._id,
      isVoice: false,
      text: gcMessage.text,
      isFile: attachment ? true : false,
      fileName: attachment ? attachment.fileName : "null",
      fileType: attachment ? attachment.fileType : "null",
      createdAt: gcMessage.createdAt,
      senderId: gcMessage.user._id,
      receiverId: receiverId,
      groupId: "null"
    };
  }

  static MessageToGCMessage(message: MessageObject) {
    return {
      _id: message.id,
      voice: message.isVoice,
      text: message.text ? message.text : '',
      createdAt: message.createdAt,
      user: {_id: message.senderId}
    };
  }

  static listen(callback: listenCallback) {
    if (MessageApi.globallyRegistered)
      return;
    
    MessageApi.globallyRegistered = true;
    const session = SessionFactory.getSession();
    const unsubscribe = session.subscribe(Event.message, async data => {
      const message: MessageObject = JSON.parse(data);
      // Prevent calling the global callback if a specific callback exists
      // for given id
      if (MessageApi.conversationId
          && message.senderId === MessageApi.conversationId)
        return;
      
      MessageApi.subscribeCallback(callback, message);
    });

    return () => {
      MessageApi.globallyRegistered = false;
      unsubscribe();
    };
  }

  static listenToId(callback: listenCallback, senderId: string) {
    MessageApi.conversationId = senderId;
    const session = SessionFactory.getSession();
    const unsubscribe = session.subscribe(Event.message, async data => {
      const message: MessageObject = JSON.parse(data);
      if (MessageApi.conversationId
          && MessageApi.conversationId !== message.senderId)
        return;
      
      MessageApi.subscribeCallback(callback, message);
    });

    return () => {
      MessageApi.conversationId = null;
      unsubscribe();
    };
  }

  static async requestAttachment(id: string) {
    try {
      const response = await axios.get(`http://${SERVER_IP}/files/${id}`);
      return response.data.chatMessageAttachedFile;
    }
    catch (e) {
      console.log(e);
    }
  }

  static sendAttachment(id: string, attachment: Attachment) {
    try {
      axios.post(`http://${SERVER_IP}/files`, {
        chatMessageAttachmentId: id,
        chatMessageAttachedFile: attachment.file
      });
    }
    catch (e) {
      console.log(e);
    }
  }

  static sendMessage(receiverId: string, gcMessage: GCMessageObject,
    attachment?: Attachment)
  {
    const message = MessageApi.GCMessageToMessage(receiverId, gcMessage,
      attachment);
    const session = SessionFactory.getSession();
    session.sendData(JSON.stringify(message));

    if (attachment)
      MessageApi.sendAttachment(message.id, attachment);
  }

  static async subscribeCallback(callback: listenCallback,
    message: MessageObject)
  {
    const gcMessage = MessageApi.MessageToGCMessage(message);
    if (message.isFile && message.fileName) {
      const file = await MessageApi.requestAttachment(message.id);
      if (file) {
        const attachment = {
          file: file,
          fileName: message.fileName,
          fileType: message.fileType
        };
        callback(gcMessage, attachment);
      }
    }
    else {
      callback(gcMessage);
    }
  }
}

export default MessageApi;
