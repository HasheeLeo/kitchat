// @flow
// The code here is taken from https://github.com/prscX/react-native-file-type
// with a few minor modifications

import {Base64} from 'js-base64';
import fileType from 'file-type';

type TypeData = {
  dataWithMime: string,
  ext: string,
  mime: string
};

function convertBase64ToArrayBuffer(data: string) {
  const UTF8Data = Base64.atob(data);
  const UTF8DataLength = UTF8Data.length;

  let bytes = new Uint8Array(UTF8DataLength);
  for (var i = 0; i < UTF8DataLength; i++)
    bytes[i] = UTF8Data.charCodeAt(i);

  return bytes.buffer;
}

function base64ToType(data: string): ?TypeData {
  let convertedData = convertBase64ToArrayBuffer(data);
  convertedData = new Uint8Array(convertedData);

  let type = fileType(convertedData);
  if (type === undefined || type === null) {
    const decodedData = String.fromCharCode.apply(null, convertedData);

    if (decodedData.startsWith('<html>') || decodedData.endsWith('</html>'))
      type = {dataWithMime: '', ext: 'html', mime: 'text/html'};
    else
      // TODO this could be a security issue
      type = {dataWithMime: '', ext: 'txt', mime: 'text/plain'};
  }

  if (type)
    type.dataWithMime = `data:${type.mime};base64,${data}`;
  
  return type;
}

export default base64ToType;
