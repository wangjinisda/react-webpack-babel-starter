import * as React from 'react'
import { render } from 'react-dom'

import { appHistory, historyCreator } from './../../../market/shared/routerHistory'
import { configureStore } from './../../../_sample/store'

import routes from './../../../_sample/routes'
import { Router, match } from 'react-router';

// import createHistory from 'react-router/lib/createMemoryHistory';

let createHistory = require('react-router/lib/createMemoryHistory');
let { Provider } = require('react-redux');
let { RouterContext } = require('react-router');
let { renderToString } = require('react-dom/server');

// let { ReduxAsyncConnect, loadOnServer, reducer } = require('redux-async-connect')
let template = require("./../../../pug/views/sample_index.pug");

export let serverRenderHandler = () => {

    return (req: any, res: any, next: any) => {

        let __INITIAL_STATE__ = {};
        const memoryHistory = createHistory(req.originalUrl);
        const store = configureStore(__INITIAL_STATE__);
        const history = historyCreator(store)(memoryHistory);
        match({ history: history, routes: routes, location: req.originalUrl }, (error: any, redirectLocation: Location, renderProps: any) => {
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
            }
        });
    }

}