import * as React from 'react'
import { render } from 'react-dom'

import { Provider } from 'react-redux'
import { appHistory, historyCreator } from './../../../market/shared/routerHistory'

import { configureStore } from './../../../_sample/store'
import routes from './../../../_sample/routes'

import { Router, match } from 'react-router';


// import createHistory from 'react-router/lib/createMemoryHistory';

let createHistory = require('react-router/lib/createMemoryHistory');
let { RouterContext } = require('react-redux');
let { renderToString } = require('react-dom/server');

let { ReduxAsyncConnect, loadOnServer, reducer } = require('redux-async-connect')
let template = require("./../../../pug/views/server_index.pug");

export let serverRenderHandler = () => {

    return (req: any, res: any, next: any) => {

        let __INITIAL_STATE__ = {};
        const memoryHistory = createHistory(req.originalUrl);
        const store = configureStore(memoryHistory, __INITIAL_STATE__);
        const history = historyCreator(store)(memoryHistory);
        match({ history: history, routes: routes, location: req.originalUrl }, (error: any, redirectLocation: Location, renderProps: any) => {
            if (redirectLocation) {
                res.redirect(redirectLocation.pathname + redirectLocation.search);
            } else if (error) {
                console.error('ROUTER ERROR: test');
                res.status(500);
            } else if (renderProps) {
                let InitialComponent = React.createElement(
                    Provider,
                    { store: store },
                    React.createElement(RouterContext, renderProps)
                );
                const appHTML = renderToString(InitialComponent);

                // 3. render the Redux initial data into the server markup

                const _html = template({
                    html: appHTML
                })
                res.send(_html);
            }
        });
    }

}