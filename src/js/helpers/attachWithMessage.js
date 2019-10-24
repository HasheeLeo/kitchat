// @flow

import RNFS from 'react-native-fs';
import base64ToType from '~/helpers/base64ToType';

import {FileType} from '~/constants';
import {type Attachment, type GCMessageObject} from '~/typedefs';

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

export default attachWithMessage;
