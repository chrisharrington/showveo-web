import * as io from 'socket.io-client';

import { Device, Castable, CastMessage, CastAction } from '@lib/models';
import Config from '@lib/config';

import BaseService from './base';

const CAST_MESSAGE = 'cast';

class DeviceService extends BaseService {
    private socket: SocketIOClient.Socket;
    private heartbeats: any;

    constructor() {
        super();

        this.heartbeats = {};
        this.socket = io(Config.ApiUrl);

        this.socket.on(CAST_MESSAGE, (message: CastMessage) => {
            switch (message.action) {
                case CastAction.Status:
                    const handler = this.heartbeats[message.host];
                    if (handler)
                        handler(message);
                    break;
                default:
                    throw new Error(`No handler for cast message: ${message.action}`);
            }
        });
    }

    async all() : Promise<Device[]> {
        const devices = await this.get(`${Config.ApiUrl}/devices`);
        return [Device.thisDevice()].concat(devices.map((device: Device) => this.build(device)));
    }

    async cast(castable: Castable, onHeartbeat: (message: CastMessage) => void) {
        const message = new CastMessage(CastAction.Launch, castable.options.device.host);
        message.movieId = castable.playable._id;
        message.isSubtitled = castable.options.isSubtitled;
        message.isResume = castable.options.isResume;
        message.host = castable.options.device.host;
        message.url = castable.playable.video();
        this.socket.emit(CAST_MESSAGE, message);

        this.heartbeats[castable.options.device.host] = onHeartbeat;
    }

    async pause(device: Device) {
        this.socket.emit(CAST_MESSAGE, new CastMessage(CastAction.Pause, device.host));
    }

    async play(device: Device) {
        this.socket.emit(CAST_MESSAGE, new CastMessage(CastAction.Play, device.host));
    }

    async stop(device: Device) {
        this.socket.emit(CAST_MESSAGE, new CastMessage(CastAction.Stop, device.host));
    }

    private build(data: any) : Device {
        const show = new Device();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}

export default new DeviceService();