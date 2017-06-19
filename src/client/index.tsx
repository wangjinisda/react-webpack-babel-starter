import * as React from "react";
import * as ReactDOM from 'react-dom';
import {AppContainer} from "react-hot-loader";
import App from "./components/App";

const rootEl = document.getElementById("root");

const renderComponent = (Component: any) => {
    ReactDOM.render(
        <AppContainer>
            <Component/>
        </AppContainer>,
        rootEl
    );
};

renderComponent(App);

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept("./components/App", () => {
        const NewApp = require("./components/App").default;
        renderComponent(NewApp);
    });
}
