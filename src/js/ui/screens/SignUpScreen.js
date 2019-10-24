// @flow

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {
  Button,
  Container,
  Content,
  Form,
  Item,
  Input,
  Label,
  Spinner,
  Text,
  View
} from 'native-base';

import AccountApi from '~/app/AccountApi';
import {Routes} from '~/constants';
import {SignUp} from '~/strings';

import {
  NavigationScreenProp,
  NavigationState
} from 'react-navigation';

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

type State = {
  email: string,
  isFormSubmitting: boolean,
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
      isFormSubmitting: false,
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
      this.setState({isSessionSaved: false});
    }
  }

  async signIn() {
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
    if(this.state.isFormSubmitting && this.state.isSessionSaved)
      return null;
    
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <Form>
            <Item stackedLabel>
              <Label>{SignUp.emailLabel}</Label>
              <Input
                autoCapitalize='none'
                editable={!this.state.isFormSubmitting}
                textContentType='emailAddress'
                value={this.state.email}
                onChangeText={text => this.setState({email: text})}
              />
            </Item>

            <Item stackedLabel last>
              <Label>{SignUp.passwordLabel}</Label>
              <Input
                editable={!this.state.isFormSubmitting}
                secureTextEntry
                value={this.state.password}
                onChangeText={text => this.setState({password: text})}
              />
            </Item>

            <Button
              block
              disabled={this.state.isFormSubmitting}
              primary={!this.state.isFormSubmitting}
              style={styles.signUp}
              onPress={this.state.isSignUp ? this.signUp : this.signIn}
            >
              {this.state.isFormSubmitting && <Spinner color='blue' />}
              {!this.state.isFormSubmitting &&
                <Text>
                  {this.state.isSignUp ? SignUp.signUp : SignUp.signIn}
                </Text>
              }
            </Button>

            <Button
              transparent
              style={{alignSelf: 'center', marginTop: 10}}
              onPress={() => this.setState(prevState => ({
                isSignUp: !prevState.isSignUp
              }))}
            >
              <Text>
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
    justifyContent: 'center',
    flex: 1
  },

  signUp: {
    marginTop: 40
  }
});

export default SignUpScreen;
