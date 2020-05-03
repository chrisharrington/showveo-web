import { History as RouterHistory, createBrowserHistory } from 'history';

export abstract class Views {
    static BasePath = '';

    static Movies = `${Views.BasePath}/movies`;
    static MovieDetails = `${Views.Movies}/:year/:name`;
    static MoviePlayer = `${Views.Movies}/player/:year/:name`;

    static Shows = `${Views.BasePath}/shows`;
    static Show = `${Views.BasePath}/shows/:name`;
    static Season = `${Views.BasePath}/shows/:name/:season`;
    static EpisodeDetails = `${Views.BasePath}/shows/:name/:season/:episode`;
    static EpisodePlayer = `${Views.BasePath}/shows/player/:name/:season/:episode`;
}

class NavigatorClass {
    history: RouterHistory;
    back: boolean;

    constructor() {
        this.back = false;
        this.history = createBrowserHistory();
    }

    getKey(pathname: string, ordinal: number = 0) : string {
        pathname = pathname.replace(`${Views.BasePath}/`, '');
        return pathname.split('/')[ordinal];
    }

    navigate(view: Views, params?: any, query?: any) {
        let location = view.toString();
        Object.keys(params || {}).forEach(k => location = location.replace(`:${k}`, params[k]));

        if (query)
            Object.keys(query).forEach((key: string, index: number) => location += `${index === 0 ? '?' : '&'}${key}=${query[key]}`);

        window.scrollTo(0, 0);
        this.history.push(location);
        setTimeout(() => this.back = false, 0);
    }
}

export const Navigator = new NavigatorClass();