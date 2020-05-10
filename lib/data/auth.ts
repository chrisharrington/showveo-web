import { User } from '@lib/models';
import Config from '@lib/config';

import BaseService from './base';

class AuthService extends BaseService {
    async signIn(email: string, password: string) : Promise<User | null> {
        const result = await this.post(`${Config.ApiUrl}/auth`, { email, password });
        if (result.status !== 200)
            return null;

        return await result.json();
    }

    async isAuthorized(token: string) : Promise<boolean> {
        if (!token)
            return false;

        const response = await fetch(`${Config.ApiUrl}/auth?token=${token}`, {
            method: 'GET',
            mode: 'cors'
        });

        return response.status === 200;
    }
}

export default new AuthService();