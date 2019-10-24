// @flow

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Icon, Text, View} from 'native-base';
import Slider from 'react-native-slider';

type Props = {
  timeLength: number
};

type State = {
  isPlaying: boolean,
  value: number
};

class VoiceMessage extends Component<Props, State> {
  play: () => void;
  stop: () => void;
  togglePlay: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      isPlaying: false,
      value: 0
    };

    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
  }

  play() {
    this.setState(prevState => ({
      isPlaying: !prevState.isPlaying
    }));
  }

  stop() {
    this.setState(prevState => ({
      isPlaying: !prevState.isPlaying
    }));
  }

  togglePlay() {
    if (this.state.isPlaying)
      this.stop();
    else
      this.play();
  }

  render() {
    return (
      <View>
        <Button
          transparent
          onPress={this.togglePlay}
        >
          <Icon name={this.state.isPlaying ? 'pause' : 'play'} />
        </Button>
      </View>
    );
  }
}

export default VoiceMessage;
