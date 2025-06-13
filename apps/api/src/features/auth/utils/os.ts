import { UAParser } from 'ua-parser-js';

// 获取设备信息
export function getDeviceInfo(userAgent: string) {
  const parser = new UAParser(userAgent || '');
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return {
    deviceName: device.model,
    deviceOS: os.name,
    deviceType: device.type,
    browser: browser.name,
    userAgent: userAgent,
    ip: undefined,
    location: undefined,
  } as const;
}
