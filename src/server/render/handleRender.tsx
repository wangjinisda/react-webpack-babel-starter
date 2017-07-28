import * as React from 'react'
import { render } from 'react-dom'

import { appHistory, historyCreator } from './../../market/shared/routerHistory'
import { configureStore } from './store'

import routes from './../../market/mac/routes'
import { Router, match } from 'react-router';

// import createHistory from 'react-router/lib/createMemoryHistory';

let createHistory = require('react-router/lib/createMemoryHistory');
let { Provider } = require('react-redux');
let { RouterContext } = require('react-router');
let { renderToString } = require('react-dom/server');

// let { ReduxAsyncConnect, loadOnServer, reducer } = require('redux-async-connect')
let template = require("./../../pug/views/index.pug");

export let serverRenderHandler = () => {

    return (req: any, res: any, next: any) => {

        let userStore = {
            id: req.user.id,
            signedIn: req.user.signedIn,
            group: req.user.group,
            authCode: req.user.authCode,
            idToken: req.user.idToken,
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
            firstName: req.user.givenName,
            lastName: req.user.familyName,
            displayName: req.user.displayName,
            oid: req.user.oid,
            tid: req.user.tid,
            email: req.user.email,
            alternateEmail: req.user.alternateEmail,
            isMSAUser: req.user.isMSAUser,
            isFieldUser: req.user.isFieldUser,
            tokenRefreshTime: Date.parse(new Date().toISOString())
        };


        let __INITIAL_STATE__ = userStore;
        const memoryHistory = createHistory(req.originalUrl);
        const store = configureStore(memoryHistory, __INITIAL_STATE__);
        const history = historyCreator(store)(memoryHistory);
        let location = req.clientRedirectUrl || req.originalUrl;
        match({ history: history, routes: routes(store.dispatch), location: location }, (error: any, redirectLocation: Location, renderProps: any) => {
            if (redirectLocation) {
                res.redirect(redirectLocation.pathname + redirectLocation.search);
            } else if (error) {
                console.error('ROUTER ERROR: test');
                res.status(500);
            } else if (renderProps) {
                const appHTML = renderToString(
                    <Provider store={store} key="provider">
                        <RouterContext {...renderProps} />
                    </Provider>
                );

                // 3. render the Redux initial data into the server markup
                let currentState = store.getState();
                const _html = template({
                    html: appHTML,
                    state_data: currentState
                })
                res.send(_html);
            } else {
                res.status(404).send('Not found');
            }
        });
    }

}