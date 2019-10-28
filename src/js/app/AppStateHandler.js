// @flow

import {AppState} from 'react-native';
import SessionFactory from '~/app/SessionFactory';

class AppStateHandler {
  static appState: ?string;

  static init() {
    AppStateHandler.appState = AppState.currentState;
    AppState.addEventListener('change', AppStateHandler.handle);
  }

  static destroy() {
    AppState.removeEventListener('change', AppStateHandler.handle);
  }

  static getAppState() {
    return AppStateHandler.appState;
  }

  static handle(nextAppState: string) {
    if (nextAppState === 'active')
      SessionFactory.resumeSession();
    else
      SessionFactory.pauseSession();
  }
}

export default AppStateHandler;
