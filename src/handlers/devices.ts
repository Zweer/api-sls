import { Device } from '../models/device';

import { handler } from '../utils/lambda';
import { param } from '../utils/lambda/middlewares/path-params';
import { body } from '../utils/lambda/middlewares/body-parser';

class DevicesHandlers {
  @handler
  // eslint-disable-next-line class-methods-use-this
  async create(@body() deviceObj) {
    const device = Object.assign(new Device(), deviceObj);

    await device.put();

    return device;
  }

  @handler
  // eslint-disable-next-line class-methods-use-this
  async list() {
    const devices = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const device of Device.scan()) {
      devices.push(device);
    }

    return devices;
  }

  @handler
  // eslint-disable-next-line class-methods-use-this
  async destroy(@param('id') id) {
    const device = Object.assign(new Device(), { id });

    await device.destroy();

    return device;
  }
}

const devicesHandlers = new DevicesHandlers();

export const create = (event) => devicesHandlers.create(event);
export const list = () => devicesHandlers.list();
export const destroy = (event) => devicesHandlers.destroy(event);
