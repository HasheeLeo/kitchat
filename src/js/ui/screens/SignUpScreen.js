// @flow

import React, {Component} from 'react';
import {Image, StyleSheet, TextInput} from 'react-native';
import {
  Button,
  Container,
  Content,
  Form,
  Spinner,
  Text
} from 'native-base';

import AccountApi from '~/app/api/AccountApi';
import {Routes} from '~/constants';
import {SignUp} from '~/strings';
import imageLogo from '~/ui/assets/logo.png';
import COLORS from '~/ui/colors';

import {NavigationScreenProp, NavigationState} from 'react-navigation';

const BLUE = COLORS.brandColor;
const LIGHT_GRAY = COLORS.lightGray;

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

type State = {
  email: string,
  isFormSubmitting: boolean,
  isFocusedEmail: boolean,
  isFocusedPassword: boolean,
  isSessionSaved: boolean,
  isSignUp: boolean,
  password: string
};

class SignUpScreen extends Component<Props, State> {
  signIn: () => void;
  signUp: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      email: '',
      isFocusedEmail: false,
      isFocusedPassword: false,
      isFormSubmitting: true,
      isSessionSaved: true,
      isSignUp: true,
      password: ''
    };

    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
  }

  async componentDidMount() {
    const credentials = await AccountApi.getSavedSession();
    if (credentials) {
      const {email, password} = credentials;
      this.setState({
        email: email,
        password: password
      });
      await this.signIn();
    }
    else {
      this.setState({isFormSubmitting: false, isSessionSaved: false});
    }
  }

  async signIn() {
    if (!this.state.email || !this.state.password)
      return;
    
    this.setState({isFormSubmitting: true});
    const success = await AccountApi.signIn(
      this.state.email,
      this.state.password
    );
    if (success)
      this.props.navigation.navigate(Routes.messages);
    else
      this.setState({isFormSubmitting: false});
  }

  async signUp() {
    if (!this.state.email || !this.state.password)
      return;
    
    this.setState({isFormSubmitting: true});
    const success = await AccountApi.signUp(
      this.state.email,
      this.state.password
    );
    if (success)
      await this.signIn();
    else
      this.setState({isFormSubmitting: false});
  }

  render() {
    if (this.state.isFormSubmitting && this.state.isSessionSaved)
      return null;

    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <Image source={imageLogo} style={styles.logo} />
          <Form style={styles.form}>
            <TextInput
              autoCapitalize='none'
              editable={!this.state.isFormSubmitting}
              placeholder='Email'
              selectionColor={BLUE}
              style={styles.inputTextStyle}
              textContentType='emailAddress'
              underlineColorAndroid={
                this.state.isFocusedEmail ? BLUE : LIGHT_GRAY
              }
              value={this.state.email}
              onBlur={() => this.setState({isFocusedEmail: false})}
              onChangeText={text => this.setState({email: text.trim()})}
              onFocus={() => this.setState({isFocusedEmail: true})}
            />

            <TextInput
              autoCapitalize='none'
              editable={!this.state.isFormSubmitting}
              placeholder='Password'
              secureTextEntry
              selectionColor={BLUE}
              style={styles.inputTextStyle}
              underlineColorAndroid={
                this.state.isFocusedPassword ? BLUE : LIGHT_GRAY
              }
              value={this.state.password}
              onBlur={() => this.setState({isFocusedPassword: false})}
              onChangeText={text => this.setState({password: text})}
              onFocus={() => this.setState({isFocusedPassword: true})}
            />

            <Button
              block
              disabled={this.state.isFormSubmitting}
              primary={!this.state.isFormSubmitting}
              style={styles.signUp}
              onPress={this.state.isSignUp ? this.signUp : this.signIn}>
              {this.state.isFormSubmitting && <Spinner color={COLORS.brandColor} />}
              {!this.state.isFormSubmitting && (
                <Text>
                  {this.state.isSignUp ? SignUp.signUp : SignUp.signIn}
                </Text>
              )}
            </Button>

            <Button
              transparent
              style={{alignSelf: 'center', marginTop: 10}}
              onPress={() =>
                this.setState(prevState => ({
                  isSignUp: !prevState.isSignUp,
                }))
              }>
              <Text style={{color: '#50A8E8'}}>
                {this.state.isSignUp ? SignUp.signIn : SignUp.signUp}
              </Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center'
  },

  form: {
    flex: 2,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 0
  },

  inputTextStyle: {
    fontSize: 16,
    height: 50,
    marginBottom: 10,
    paddingLeft: 6
  },

  logo: {
    alignSelf: 'center',
    flex: 1,
    height: 200,
    marginBottom: 10,
    marginTop: 20,
    resizeMode: 'contain',
    width: 200
  },

  signUp: {
    color: '#161616',
    backgroundColor: COLORS.brandColor,
    marginTop: 50
  },
});

export default SignUpScreen;
