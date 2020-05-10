import * as React from 'react';

import AuthService from '@lib/data/auth';
import { User } from '@lib/models';

import Text from '@web/components/form/text';
import Button from '@web/components/form/button';

import './style.scss';

export default class SignIn extends React.Component<{ onSignIn: (user: User) => void }, { email: string, password: string }> {
    state = {
        email: '',
        password: ''
    }

    render() {
        return <div className='sign-in'>
            <div className='sign-in-tile'>
                <h3>Sign In</h3>

                <Text
                    label='Email Address'
                    value={this.state.email}
                    onChange={(email: string) => this.setState({ email })}
                    focus={true}
                />

                <Text
                    label='Password'
                    value={this.state.password}
                    onChange={(password: string) => this.setState({ password })}
                    type='password'
                />

                <Button
                    label='Submit'
                    onClick={() => this.onSubmit()}
                />
            </div>
        </div>
    }

    get() {
        return JSON.parse(window.localStorage.getItem('user'));
    }

    private async onSubmit() {
        try {
            const user = await AuthService.signIn(this.state.email, this.state.password);
            if (user)
                this.props.onSignIn(user);
        } catch (e) {
            console.error(e);
        }
    }
}