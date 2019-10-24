// @flow

import Session from '~/app/Session';

class SessionFactory {
  static session: Session|null;

  static createSession() {
    SessionFactory.getSession();
  }

  static destroySession() {
    if (SessionFactory.session) {
      SessionFactory.session.destroy();
      SessionFactory.session = null;
    }
  }

  static getSession() {
    if (!SessionFactory.session)
      SessionFactory.session = new Session();
    
    return SessionFactory.session;
  }
}

export default SessionFactory;
