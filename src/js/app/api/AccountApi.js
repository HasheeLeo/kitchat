// @flow

import axios from 'axios';

import LocalStorage from '~/app/LocalStorage';
import {ACCOUNT_PORT, SERVER_IP} from '~/constants';

class AccountApi {
  static userId: string;

  static async getSavedSession() {
    return await LocalStorage.loadSession();
  }

  static getUserId() {
    return AccountApi.userId;
  }

  static async signIn(email: string, password: string) {
    try {
      const response = await axios.post(
        `http://${SERVER_IP}:${ACCOUNT_PORT}/user/login/${email}`, {
          userEmailAddress: email,
          userPassword: password
        }
      );
      if (response.status === 200) {
        await LocalStorage.saveSession(email, password);
        AccountApi.userId = email;
        return true;
      }
      else
        return false;
    }
    catch (e) {
      console.log(e);
      return false;
    }
  }

  static async signUp(email: string, password: string) {
    try {
      const response = await axios.post(
        `http://${SERVER_IP}:${ACCOUNT_PORT}/user/register`, {
          userEmailAddress: email,
          userPassword: password
        });
      if (response.status === 201)
        return true;
      else
        return false;
    }
    catch (e) {
      console.log(e);
      return false;
    }
  }
}

export default AccountApi;
