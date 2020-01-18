import BaseService from './base';

import Config from '@lib/config';
import { Show } from '@lib/models';

export default class ShowService extends BaseService {
    static async getAll() : Promise<Show[]> {
        const data = await this.get(`${Config.ApiUrl}/shows/all`);
        return data.map(this.build);
    }

    static async getByName(name: string) : Promise<Show> {
        return this.build(await this.get(`${Config.ApiUrl}/shows/${name}`));
    }

    private static build(data: any) : Show {
        const show = new Show();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}