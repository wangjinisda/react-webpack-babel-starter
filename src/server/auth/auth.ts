
import { generateUid } from './../../market/server/utils'
import { newSpzaCookie, saveAppsourceLead } from './../../market/server/auth/cookie'


function newGuestUser() {
    return {
        id: generateUid(32),
        group: ['guest'],
        signedIn: false,
        authCode: '',
        idToken: '',
        idTokenPayload: '',
        accessToken: {
            spza: '',
            graph: ''
        },
        refreshToken: '',
        displayName: 'guest',
        givenName: '',
        familyName: '',
        email: 'guest@' + (process.env.serverUrl || ''),
        alternateEmail: '',
        isMSAUser: false,
        isFieldUser: false
    }
}

export function authHandler() {
    return (req: any, res: any, next: any) => {
        let cookie = newSpzaCookie();
        let result = cookie.read(req);
        if (result.error) {
            req.user = newGuestUser();
            saveAppsourceLead(req.user, res);
        }
        return next();
    }
}