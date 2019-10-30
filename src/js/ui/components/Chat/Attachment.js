// @flow

import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Text, View} from 'native-base';
import FileViewer from 'react-native-file-viewer';

import {type GCMessageObject} from '~/typedefs';

import COLORS from '../../colors'

type Props = {
  currentMessage: GCMessageObject
};

export default (props: Props) => (
  <View style={styles.documentView}>
    <Button transparent onPress={async () => (
      await FileViewer.open(props.currentMessage.attachmentPath)
    )}>
      <Text>{props.currentMessage.documentName}</Text>
    </Button>
  </View>
);

const styles = StyleSheet.create({
  documentView: {
    backgroundColor: '#C3C4C7',
    borderRadius: 7,
    marginHorizontal: 5,
    marginTop: 4
  }
});
