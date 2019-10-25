// @flow

import firebase from 'react-native-firebase';
import axios from 'axios';

import AccountApi from '~/app/AccountApi';
import LocalStorage from '~/app/LocalStorage';
import {SERVER_IP} from '~/constants';

class NotificationApi {
  static initialized: boolean;

  static async init() {
    try {
      const permission = await firebase.messaging().hasPermission();
      if (!permission)
        await firebase.messaging().requestPermission();
      
      NotificationApi.initialized = permission;
      NotificationApi.createMainChannel();
      
      const newToken = await NotificationApi.hasTokenChanged();
      if (newToken)
        NotificationApi.updateToken(newToken);
    }
    catch (e) {
      console.log(e);
    }
  }

  static createMainChannel() {
    if (!NotificationApi.initialized)
      return;
    
    const channel = new firebase.notifications.Android.Channel(
      'main-channel',
      'Main Channel',
      firebase.notifications.Android.Importance.Max
    ).setDescription('Main notification channel');
    firebase.notifications().android.createChannel(channel);
  }

  static async hasTokenChanged() {
    if (!NotificationApi.initialized)
      return;
    
    const remoteTokenPromise = firebase.messaging().getToken();
    const localTokenPromise = LocalStorage.loadDeviceToken();
    const remoteToken = await remoteTokenPromise;
    const localToken = await localTokenPromise;
    if (remoteToken === localToken)
      return false;
    else
      return remoteToken;
  }

  static updateToken(token: string) {
    LocalStorage.saveDeviceToken(token);
    axios.put(`http://${SERVER_IP}/user/${AccountApi.getUserId()}`, {
      deviceToken: token
    });
  }
}

export default NotificationApi;
