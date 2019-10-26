// @flow

import RNFS from 'react-native-fs';
import LocalStorage from '~/app/LocalStorage';
import base64ToType from '~/helpers/base64ToType';

import {FileType} from '~/constants';
import type {Attachment, GCMessageObject} from '~/typedefs';

async function onMessageCreated(receiverId: string, message: GCMessageObject,
  attachment?: Attachment)
{
  let saveAttachmentPromise;
  if (attachment) {
    attachWithMessage(message, attachment);
    saveAttachmentPromise = LocalStorage.saveFile(message._id, attachment.file);
  }
  let withoutImageBlob = Object.assign({}, message);
  withoutImageBlob.image = undefined;
  await LocalStorage.saveMessage(receiverId, withoutImageBlob);

  if (saveAttachmentPromise)
    await saveAttachmentPromise;
}

function attachWithMessage(message: GCMessageObject, attachment: Attachment) {
  const typeData = base64ToType(attachment.file);
  if (typeData) {
    let path = `${RNFS.DocumentDirectoryPath}/${message._id}`;
    if (typeData.ext)
      path = `${path}.${typeData.ext}`;
    
    if (attachment.fileType === FileType.image)
      message.image = typeData.dataWithMime;
    else
      message.documentName = `${attachment.fileName}`;
    
    message.attachmentPath = path;
  }
}

export default onMessageCreated;
