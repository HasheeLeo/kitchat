// @flow

import uuid from 'uuid/v4';

import AccountApi from '~/app/api/AccountApi';
import {Event, MESSAGE_PORT, SERVER_IP} from '~/constants';

type callback = (data: string) => Promise<any>;
type event = $Keys<typeof Event>;

class Session {
  // Messages sent while the socket was still opening
  pendingMessages: Array<string>;

  socketOpen: boolean;
  ws: WebSocket;
  subscribers: {[eventType: event]: Array<{id: string, callback: callback}>};

  openConnection: () => void;
  closeConnection: () => void;
  isSocketOpen: () => boolean;
  onReceiveData: (data: mixed) => void;
  sendData: (data: string) => void;
  subscribe: (event: event, callback: callback) => (() => void);

  constructor() {
    this.openConnection = this.openConnection.bind(this);
    this.closeConnection = this.closeConnection.bind(this);
    this.isSocketOpen = this.isSocketOpen.bind(this);
    this.onReceiveData = this.onReceiveData.bind(this);
    this.sendData = this.sendData.bind(this);
    this.subscribe = this.subscribe.bind(this);

    this.pendingMessages = [];
    this.subscribers = {};
    this.openConnection();
  }

  openConnection() {
    const userId = AccountApi.getUserId();
    this.ws = new WebSocket(
      `ws://${SERVER_IP}:${MESSAGE_PORT}/message?${userId}`
    );
    this.ws.onopen = (e) => {
      this.socketOpen = true;
      this.pendingMessages.forEach(message => this.sendData(message));
      this.pendingMessages = [];
    };
    this.ws.onerror = (e) => console.log(e);
    this.ws.onmessage = (e) => this.onReceiveData(e.data);
  }

  closeConnection() {
    this.ws.close();
    this.socketOpen = false;
  }

  isSocketOpen() {
    return this.socketOpen;
  }

  onReceiveData(data: mixed) {
    if (typeof data !== 'string')
      throw 'non-string data from server';
    
    if (this.subscribers[Event.message]) {
      const eventSubscribers = this.subscribers[Event.message];
      eventSubscribers.forEach(callbackObject => callbackObject.callback(data));
    }
  }

  sendData(data: string) {
    if (!this.socketOpen) {
      this.pendingMessages.push(data);
      return;
    }
    this.ws.send(data);
  }

  // "any" because flow is being a bitch
  subscribe(event: event, callback: callback): any {
    const id = uuid();
    if (!this.subscribers[event])
      this.subscribers[event] = [{id: id, callback: callback}];
    else
      this.subscribers[event].push({id: id, callback: callback});
    
    return () => {
      this.subscribers[event] = (
        this.subscribers[event].filter(callback => callback.id !== id)
      );
    }
  }
}

export default Session;
