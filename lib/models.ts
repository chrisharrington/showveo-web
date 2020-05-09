import MovieService from '@lib/data/movies';
import EpisodeService from '@lib/data/episodes';
import Config from '@lib/config';

export enum Status {
    Missing = 'missing',
    Queued = 'queued',
    Fulfilled = 'fulfilled'
}

export enum CastState {
    NoDevicesAvailable = "NoDevicesAvailable",
    NotConnected = "NotConnected",
    Connecting = "Connecting",
    Connected = "Connected"
}

export enum PlayableType {
    Movie,
    Episode
}

export interface Playable {
    _id: string;
    runtime: number;
    progress: number;
    subtitlesStatus: Status;

    video() : string;
    subtitle() : string;
    saveProgress(time: number) : Promise<void>;
}

export interface Media {
    name: string;
    poster: string;
    synopsis: string;
    backdrop: string;
    year: string;
    genres: string[];
}

export class Movie implements Media, Playable {
    _id: string;
    name: string;
    poster: string;
    backdrop: string;
    synopsis: string;
    runtime: number;
    progress: number;
    year: string;
    subtitlesStatus: Status;
    genres: string[];

    video() : string {
        return `${Config.ApiUrl}/movies/play/${this.year}/${this.name}`;
    }

    subtitle() : string {
        return `${Config.ApiUrl}/movies/subtitle/${this.year}/${this.name}`;
    }

    async saveProgress(time: number) : Promise<void> {
        await MovieService.saveProgress(this._id, time);
    }
}

export class Show implements Media {
    name: string;
    poster: string;
    backdrop: string;
    synopsis: string;
    year: string;
    genres: string[];
    runtime: number;
}

export class Season {
    number: number;
    poster: string;
    synopsis: string;
    episodeCount: number;
}

export class Episode implements Playable {
    _id: string;
    runtime: number;
    progress: number;
    name: string;
    show: string;
    season: number;
    number: number;
    synopsis: string;
    subtitlesStatus: Status;
    airDate: string;

    video() : string {
        return `${Config.ApiUrl}/shows/play/${this.show}/${this.season}/${this.number}`;
    }

    subtitle() : string {
        return `${Config.ApiUrl}/shows/subtitle/${this._id}`;
    }

    async saveProgress(time: number) : Promise<void> {
        await EpisodeService.saveProgress(this._id, time);
    }
}

export class Device {
    id: string;
    name: string;
    host: string;
    isThisDevice: boolean;

    constructor() {
        this.isThisDevice = false;
    }

    static thisDevice() : Device {
        const device = new Device();
        device.id = '';
        device.name = 'This Device';
        device.host = '';
        device.isThisDevice = true;
        return device;
    }
}

export class PlayOptions {
    device: Device;
    isResume: boolean;
    isSubtitled: boolean;

    constructor(device: Device, isResume: boolean, isSubtitled: boolean) {
        this.device = device;
        this.isResume = isResume;
        this.isSubtitled = isSubtitled;
    }
}

export class Castable {
    playable: Playable;
    options: PlayOptions;
    type: PlayableType;

    constructor(playable: Playable, options: PlayOptions, type: PlayableType) {
        this.playable = playable;
        this.options = options;
        this.type = type;
    }
}

export enum Navigation {
    Movies = 'movies',
    KidMovies = 'kid-movies',
    Shows = 'shows',
    KidShows = 'kid-shows'
}