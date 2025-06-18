import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

export interface DeviceType {
  ip: string;
  userAgent: string;
  deviceType: string;
  deviceName: string;
  deviceOs: string;
  browser: string;
}

export const Device = createParamDecorator((data: unknown, ctx: ExecutionContext): DeviceType => {
  const request = ctx.switchToHttp().getRequest();
  const userAgent = request.headers['user-agent'] || 'unknown';
  const ip = request.headers['x-forwarded-for']?.split(',')[0] || request.ip || 'unknown';
  const deviceInfo = getDeviceInfo(userAgent as string);

  return {
    ip,
    userAgent,
    ...deviceInfo,
  };
});

function getDeviceInfo(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    deviceType: result.device.type || 'desktop',
    deviceName: result.device.model || 'unknown',
    deviceOs: `${result.os.name || 'unknown'} ${result.os.version || ''}`.trim(),
    browser: `${result.browser.name || 'unknown'} ${result.browser.version || ''}`.trim(),
  };
}
