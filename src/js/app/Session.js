// @flow

import uuid from 'uuid/v4';

import AccountApi from '~/app/AccountApi';
import {Event, SERVER_IP} from '~/constants';

type callback = (data: string) => Promise<any>;
type event = $Keys<typeof Event>;

class Session {
  ws: WebSocket;
  subscribers: {[eventType: event]: Array<{id: string, callback: callback}>};

  onReceiveData: (data: mixed) => void;
  sendData: (data: string) => void;
  subscribe: (event: event, callback: callback) => (() => void);

  constructor() {
    const userId = AccountApi.getUserId();
    this.ws = new WebSocket(`ws://${SERVER_IP}/private-message?${userId}`);
    this.ws.onopen = (e) => console.log('yay');
    this.ws.onerror = (e) => console.log(e);
    this.ws.onmessage = (e) => this.onReceiveData(e.data);
    this.subscribers = {};

    this.onReceiveData = this.onReceiveData.bind(this);
    this.sendData = this.sendData.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  destroy() {
    this.ws.close();
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
    this.ws.send(data);
  }

  // "any" because flow is being a bitch
  subscribe(event: event, callback: callback): any {
    const id = uuid();
    if (!this.subscribers[event])
      this.subscribers[event] = [{id: id, callback: callback}];
    else
      this.subscribers[event].push({id: id, callback: callback});
    
    return () => this.subscribers[event].filter(callback => callback.id !== id);
  }
}

export default Session;
