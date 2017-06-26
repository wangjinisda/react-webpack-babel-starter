export function getSignUpHost() {
    return 'https://portal.office.com/signUp?sku=appsource';
}

export function getSignInHeader(context: any) {
    return context.loc('SI_SignInAppSource');
}

export function getTitle(context: any) {
    return context.loc('SI_WorkAccount');
}

export function getRedirectString() {
    return '&ru=';
}

export function shouldUseNewSigninModal() {
    return true;
}