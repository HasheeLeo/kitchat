// @flow

export const ACCOUNT_PORT = 8762;

export const Event = {
  message: 'message'
};

export const FileType = {
  image: 'image',
  document: 'document'
};

export const MAX_ATTACHMENT_SIZE = 20971520; // 20 MBs
export const MESSAGE_PORT = 8763;

export const Routes = {
  chat: 'ChatRoute',
  messages: 'MessagesRoute',
  people: 'PeopleRoute',
  signUp: 'SignUpRoute'
};

export const SERVER_IP = (
  'ec2-13-58-168-26.us-east-2.compute.amazonaws.com:12002'
);
