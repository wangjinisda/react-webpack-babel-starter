let queryStringUtils = require('query-string');
import { getAppConfig } from '../init/appConfig';

export class Url {
    public host: string;
    public query: any;
    public endpoint: string;

    constructor(endpoint: string, query?: any, host?: string) {
        this.host = host || getAppConfig('hostname');
        this.endpoint = endpoint;
        this.query = query || {};
    }

    isQueryEmpty(): boolean {
        if (!this.query) {
            return true;
        }
        for (let key in this.query) {
            if (this.query.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    getUrl(): string {
        let url = 'https://' + this.host;
        url += this.endpoint;
        if ( this.query ) {
            url += '?' + queryStringUtils.stringify(this.query);
        }
        return url;
    }
}