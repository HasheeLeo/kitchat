// @flow

import Session from '~/app/Session';

class SessionFactory {
  static session: Session;

  static createSession() {
    SessionFactory.getSession();
  }

  static resumeSession() {
    SessionFactory.getSession();
  }

  // Closes the underlying socket, but keeps the reference of the Session
  static pauseSession() {
    if (SessionFactory.session)
      SessionFactory.session.closeConnection();
  }

  // Creates the session if it does not exist and resumes it if it is paused
  static getSession() {
    if (!SessionFactory.session)
      SessionFactory.session = new Session();
    
    if (!SessionFactory.session.isSocketOpen())
      SessionFactory.session.openConnection();
    
    return SessionFactory.session;
  }
}

export default SessionFactory;
