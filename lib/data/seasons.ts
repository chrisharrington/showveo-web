import BaseService from './base';

import Config from '@lib/config';
import { Season, Episode } from '@lib/models';

interface SeasonData {
    season: Season;
    episodes: Episode[];
}

class SeasonService extends BaseService {
    async getByShowName(show: string) : Promise<Season[]> {
        const data = await this.get(`${Config.ApiUrl}/shows/${show}/seasons`);
        return data.map(this.build);
    }

    async getByShowNameAndNumber(show: string, number: number) : Promise<SeasonData> {
        return await this.get(`${Config.ApiUrl}/shows/${show}/${number}`);
    }

    private build(data: any) : Season {
        const show = new Season();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}

export default new SeasonService();