import * as httpProtocol from './httpProtocol';
import { logError } from '../../utils/httpClientUtil';
import { getAppConfig } from '../../services/init/appConfig';

let option: httpProtocol.IHttpOption = {
    requireCorrelationId: true,
    stringifyPostData: false,
    fullEndpoint: true
};

export function refreshAccessToken() {
    let endpoint = '/view/refreshAccessToken';

    let get = httpProtocol.get(endpoint, option);

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to refresh the access token');
            return Promise.reject(error);
        });
}