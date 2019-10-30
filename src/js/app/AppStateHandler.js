// @flow

import uuidv4 from 'uuid/v4';

import {AppState} from 'react-native';
import SessionFactory from '~/app/SessionFactory';

type callbacks = {|
  onActive?: () => Promise<any>,
  onInActive?: () => Promise<any>
|};

class AppStateHandler {
  static appState: ?string;
  static subscribers: Array<{id: string, ...callbacks}>;

  static init() {
    AppStateHandler.appState = AppState.currentState;
    AppStateHandler.subscribers = [];
    AppState.addEventListener('change', AppStateHandler.handle);
  }

  static destroy() {
    AppState.removeEventListener('change', AppStateHandler.handle);
  }

  static subscribe(callbacks: callbacks): any {
    const id = uuidv4();
    AppStateHandler.subscribers.push({
      id: id,
      ...callbacks
    });

    return () => (
      AppStateHandler.subscribers = AppStateHandler.subscribers.filter(
        subscriber => subscriber.id !== id
      )
    );
  }

  static getAppState() {
    return AppStateHandler.appState;
  }

  static handle(nextAppState: string) {
    if (nextAppState === 'active') {
      SessionFactory.resumeSession();
      AppStateHandler.subscribers.forEach(subscriber => {
        if (subscriber.onActive)
          subscriber.onActive();
      });
    }
    else {
      SessionFactory.pauseSession();
      AppStateHandler.subscribers.forEach(subscriber => {
        if (subscriber.onInActive)
          subscriber.onInActive();
      });
    }
  }
}

export default AppStateHandler;
