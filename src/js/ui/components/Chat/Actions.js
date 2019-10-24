// @flow

import React from 'react';
import {Button, Icon} from 'native-base';

type Props = {
  onDocument: () => void,
  onPhotos: () => void
};

export default (props: Props) => (
  <>
    <Button transparent onPress={props.onDocument}>
      <Icon name='attach' />
    </Button>
    <Button transparent onPress={props.onPhotos}>
      <Icon name='photos' />
    </Button>
  </>
);
