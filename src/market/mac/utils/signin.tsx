export function getSignUpHost() {
    return 'https://signup.live.com/';
}

export function getSignInHeader(context: any) {
    return context.loc('SignInMac');
}

export function getTitle(context: any) {
    return context.loc('WorkOrMSAAccount');
}

export function getRedirectString() {
    return '?ru=';
}

export function shouldUseNewSigninModal() {
    return false;
}