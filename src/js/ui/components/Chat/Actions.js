// @flow

import React from 'react';
import {Button, Icon} from 'native-base';

import COLORS from '~/ui/colors';

type Props = {
  onDocument: () => void,
  onPhotos: () => void
};

export default (props: Props) => (
  <>
    <Button transparent onPress={props.onDocument}>
      <Icon name='attach' style={{color: COLORS.brandColor}} />
    </Button>
    <Button transparent onPress={props.onPhotos}>
      <Icon name='photos' style={{color: COLORS.brandColor}} />
    </Button>
  </>
);
