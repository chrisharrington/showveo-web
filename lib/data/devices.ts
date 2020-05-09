import { Device, Castable, PlayableType } from '@lib/models';
import Config from '@lib/config';

import BaseService from './base';

class DeviceService extends BaseService {
    async getAll() : Promise<Device[]> {
        const devices = await this.get(`${Config.ApiUrl}/devices`);
        return [Device.thisDevice()].concat(devices.map((device: Device) => this.build(device)));
    }

    async cast(castable: Castable) : Promise<void> {
        const params: any = {
            url: castable.playable.video(),
            host: castable.options.device.host
        };

        if (castable.type === PlayableType.Movie)
            params.movieId = castable.playable._id;
        else if (castable.type === PlayableType.Episode)
            params.episodeId = castable.playable._id;

        await this.post(`${Config.ApiUrl}/devices/cast`, params);
    }

    async pause(device: Device) {
        await this.post(`${Config.ApiUrl}/devices/pause`, { host: device.host });
    }

    async play(device: Device) {
        await this.post(`${Config.ApiUrl}/devices/play`, { host: device.host });
    }

    async stop(device: Device) {
        await this.post(`${Config.ApiUrl}/devices/stop`, { host: device.host });
    }

    private build(data: any) : Device {
        const show = new Device();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}

export default new DeviceService();