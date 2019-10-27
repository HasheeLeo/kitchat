// @flow

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, TextInput} from 'react-native';
import {
	Button,
	Container,
	Content,
	Form,
	Item,
	Input,
	Icon,
	Label,
	Spinner,
	Text,
	View
} from 'native-base';

import AccountApi from '~/app/api/AccountApi';
import {Routes} from '~/constants';
import {SignUp} from '~/strings';

import {
	NavigationScreenProp,
	NavigationState
} from 'react-navigation';

const BLUE = "#428AF8";
const LIGHT_GRAY = "#D3D3D3";

type Props = {
	navigation: NavigationScreenProp<NavigationState>
};

type State = {
	email: string,
	isFormSubmitting: boolean,
	isSessionSaved: boolean,
	isSignUp: boolean,
	password: string,
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
			password: '',
			isFocusedEmail: false,
			isFocusedPassword: false
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

	handleFocus = event => {
		this.setState({ isFocused: true });
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	};

	handleBlur = event => {
		this.setState({ isFocused: false });
		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	};

	render() {
		if(this.state.isFormSubmitting && this.state.isSessionSaved)
			return null;
		
		const { isFocusedEmail, isFocusedPassword } = this.state;
		const { onFocus, onBlur, ...otherProps } = this.props
		
		return (
			<Container>
				<Content contentContainerStyle={styles.contentContainer}>
					<Form style={styles.form}>
						
						<TextInput
							placeholder="Email"
							style={styles.inputTextStyle}
							selectionColor={BLUE}
							underlineColorAndroid={
								isFocusedEmail ? BLUE : LIGHT_GRAY
							}
							onFocus= {() => 
								this.setState({isFocusedEmail: true})
							}

							onBlur = {() => 
								this.setState({isFocusedEmail: false})
							}

							autoCapitalize='none'
							editable={!this.state.isFormSubmitting}
							textContentType='emailAddress'
							value={this.state.email}
							onChangeText={text => this.setState({email: text})}
						/>
						
						<TextInput
							placeholder = "Password"
							style={styles.inputTextStyle}
							selectionColor={BLUE}
							underlineColorAndroid={
								isFocusedPassword ? BLUE : LIGHT_GRAY
							}

							onFocus = {() => 
								this.setState({isFocusedPassword: true})
							}

							onBlur = {() => 
								this.setState({isFocusedPassword: false})
							}

							editable={!this.state.isFormSubmitting}
							secureTextEntry
							value={this.state.password}
							onChangeText={text => this.setState({password: text})}
						/>
						

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

	form: {
		marginLeft: 20,
		marginRight: 20
	},

	signUp: {
		marginTop: 50
	},

	inputTextStyle: {
		height: 50,
		paddingLeft: 6,
		fontSize: 16
	},
});

export default SignUpScreen;
