// @flow

import React from 'react';
import {Button, Icon} from 'native-base';

import COLORS from '../../colors'

type Props = {
  onDocument: () => void,
  onPhotos: () => void
};

export default (props: Props) => (
  <>
    <Button transparent onPress={props.onDocument}>
      <Icon style={{color: COLORS.brandColor}} name='attach' />
    </Button>
    <Button transparent onPress={props.onPhotos}>
      <Icon style={{color: COLORS.brandColor}} name='photos' />
    </Button>
  </>
);
