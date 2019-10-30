// @flow

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Icon, Text, View} from 'native-base';
import COLORS from '../../colors'

type Props = {
  onPress: () => void
};

type State = {
  isRecording: boolean
};

class Microphone extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isRecording: false
    };
  }

  render() {
    let micStyles = [styles.mic];
    if (this.state.isRecording)
      micStyles.push({color: 'red'});
    
    return (
      <View style={styles.micContainer}>
        <Button transparent onPress={() => {
          this.setState(prevState => ({
            isRecording: !prevState.isRecording
          }));
          this.props.onPress();
        }}>
          <Icon name='mic' style={micStyles} />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  micContainer: {
    alignItems: 'center',
    marginVertical: 8
  },

  mic: {
    fontSize: 40,
    color: COLORS.brandColor
  }
});

export default Microphone;
