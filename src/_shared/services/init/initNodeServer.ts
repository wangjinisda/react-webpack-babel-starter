import * as appConfig from './appConfig';
import { generateGuid } from '../../utils/appUtils';

export function isNodeServer() {
    let detect = new Function('try {return this===global;}catch(e){return false;}');
    return detect();
}

export function initNodeServerConfig(name: string) {
    appConfig.init({
        runtimeEnvironment: 'node',
        appName: name,
        correlationId: generateGuid(),
        hostname: process.env.serverHostUrl,
        httpUserAgent: 'FrontEnd server http agent (nodejs)',
        apiVersion: process.env.appsourceApiVersion
    });
};
