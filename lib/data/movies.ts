import BaseService from './base';

import Config from '@lib/config';
import { Movie, Device } from '@lib/models';

class MovieService extends BaseService {
    async getAll() : Promise<Movie[]> {
        const data = await this.get(`${Config.ApiUrl}/movies/all`);
        return data.map(this.build);
    }

    async getByYearAndName(year: number, name: string) : Promise<Movie> {
        return this.build(await this.get(`${Config.ApiUrl}/movies/${year}/${name}`));
    }

    async saveProgress(id: string, secondsFromStart: number) : Promise<void> {
        this.post(`${Config.ApiUrl}/movies/progress`, {
            id,
            secondsFromStart
        });
    }

    async stop(movie: Movie, device: Device) : Promise<void> {
        this.post(`${Config.ApiUrl}/movies/stop/${movie.name}/${movie.year}/${device.host}`);
    }

    private build(data: any) : Movie {
        const movie = new Movie();
        Object.keys(data).forEach(k => movie[k] = data[k]);
        return movie;
    }
}

export default new MovieService();