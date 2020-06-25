import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpUrlEncodeBodyParser from '@middy/http-urlencode-body-parser';

import { Device } from '../models/device';
import { handler } from '../utils/lambda';
import { param } from '../utils/lambda/middlewares/path-params';

export const create = middy(async (event) => {
  const device = Object.assign(new Device(), event.body);

  await device.put();

  return { result: true };
})
  .use(httpJsonBodyParser())
  .use(httpUrlEncodeBodyParser());

class DevicesHandlers {
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

    return { success: true };
  }
}

const devicesHandlers = new DevicesHandlers();

export const list = () => devicesHandlers.list();
export const destroy = (event) => devicesHandlers.destroy(event);
