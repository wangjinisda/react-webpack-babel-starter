import * as secUtils from '../SecurityUtils';
import { Constants } from './../../shared/utils/constants';

interface IProtectedInfo {
    i: string; // idTokenPayload
    r: string; // refreshToken
}

interface ICookieInfo {
    u: string; // upn || email
    t: string; // ICookieProtectedInfo
}

interface ICookieLeadInfo {
    email: string;
    alternateEmail: string;
}

export interface IResult {
    return: string;
    error: string;
}

export const CookieOption = { maxAge: 900000, httpOnly: true, secure: true };

export function newSpzaCookie() {
    return new SpzaCookie();
}

export class SpzaCookie {
    public refreshToken: string;
    public idTokenPayload: string;
    public upn: string;
    public email: string;
    public cookieMark = Constants.Cookies.AppSourceCookie;

    read(req: any): IResult {
        if (!req.cookies || !req.cookies[this.cookieMark]) {
            return {
                return: null,
                error: 'Failed to read cookie since cookie does not contain ' + this.cookieMark + 'entry'};
        };
        return this.parse(req.cookies[this.cookieMark]);
    }

    write(res: any): IResult {
        if (!res) {
            return {
                return: null,
                error: 'Failed to write to cookie since res object does not exist.'
            } ;
        };

        let stringifyResult = this.stringify();
        if (stringifyResult.error) {
            return {
                return: null,
                error: 'Failed to write cookie, reason' + stringifyResult.error
            };
        }

        res.cookie(this.cookieMark, stringifyResult.return, CookieOption);
        return {
            return: 'Success',
            error: null
        };
    }

    loadFromUser(user: any): IResult {
        if (!user) {
            return {
                return: null,
                error: 'Failed to load user info. User object does not exist.'
            };
        }
        this.refreshToken = user.refreshToken;
        this.idTokenPayload = user.idTokenPayload;
        this.upn = user.upn || user.email;

        return {
            return: 'Success',
            error: null
        };
    }

    stringify(): IResult {
        let encrypedResult = this.encryptProtectedInfo();
        if (encrypedResult.error) {
            return {
                return: null,
                error: encrypedResult.error
            };
        }
        let cookie: ICookieInfo = {
            t: encrypedResult.return,
            u: this.upn || this.email || ''
        };

        return {
            return: JSON.stringify(cookie),
            error: null
        };
    }

    parse(cookieString: string): IResult {
        if (!cookieString) {
            return { return: null, error: 'Empty cookie string' };
        }
        try {
            let parsed = JSON.parse(cookieString);
            this.upn = parsed.u || parsed.email || '';
            let decryptResult = this.decryptProtectedInfo(parsed.t);

            return decryptResult;

        } catch (error) {
            return {
                return: null,
                error: error.message || 'Failed to parse the cookie string'
            };
        }
    }

    encryptProtectedInfo(): IResult {
        let protectedInfo: IProtectedInfo = {
            i: this.idTokenPayload,
            r: this.refreshToken
        };

        let encryptedText = '';
        try {
            encryptedText = secUtils.encrypt(JSON.stringify(protectedInfo));
        } catch (error) {
            return {
                return: null,
                error: 'Failed to encrypt the protected info of the cookie'
            };
        }

        return { return: encryptedText, error: null };
    }

    decryptProtectedInfo(encryptedText: string): IResult {
        if (!encryptedText) {
            return null;
        };

        try {
            let decryptedString = secUtils.decrypt(encryptedText);
            let protectedInfo = JSON.parse(decryptedString);
            if (!protectedInfo || protectedInfo.r == null || protectedInfo.i == null ) {
                throw new Error('refresh token or idtoken payload field do not exist in current cookie');
            };

            this.idTokenPayload = protectedInfo.i;
            this.refreshToken = protectedInfo.r;

            return { return: decryptedString, error: null };
        } catch (error) {
            return { return: null, error: error.message || 'failed to decrypt protected info' };
        }
    }
}

export function saveAppsourceLead(user: any, res: any) {
    if (!user || !res) {
        return;
    }
    let leadMark = Constants.Cookies.AppSourceLeadCookie;
    let u = {
        email: user.email || '',
        alternateEmail: user.alternateEmail || ''
    };
    res.cookie(leadMark, JSON.stringify(u), CookieOption);
}
