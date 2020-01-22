import BaseService from './base';

import Config from '@lib/config';
import { Episode } from '@lib/models';

class EpisodeService extends BaseService {
    async getByShowAndSeason(show: string, season: number) : Promise<Episode[]> {
        const data = await this.get(`${Config.ApiUrl}/shows/${show}/${season}/episodes`);
        return data.map(this.build);
    }

    async getByShowSeasonAndEpisode(show: string, season: number, episode: number) : Promise<Episode> {
        return this.build(await this.get(`${Config.ApiUrl}/shows/${show}/${season}/${episode}`));
    }

    async saveProgress(id: string, secondsFromStart: number) : Promise<void> {
        this.post(`${Config.ApiUrl}/shows/progress`, {
            id,
            secondsFromStart
        });
    }

    private build(data: any) : Episode {
        const show = new Episode();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}

export default new EpisodeService();