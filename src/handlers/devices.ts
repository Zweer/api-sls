import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpUrlEncodeBodyParser from '@middy/http-urlencode-body-parser';

import { Device } from '../models/device';

export const create = middy(async (event) => {
  const device = Object.assign(new Device(), event.body);

  await device.put();

  return { result: true };
})
  .use(httpJsonBodyParser())
  .use(httpUrlEncodeBodyParser());

export const list = middy(async () => {
  const devices = await Device.scan();

  console.log(devices);

  return devices;
});
