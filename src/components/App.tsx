import * as React from "react";

// require("!style-loader!css-loader!sass-loader!./App.scss");

const css = require('./App.scss');

console.log("css");
console.log(css);

// import 'expose-loader?$!../resources/external_artifacts/jquery/jquery-2.2.4.min.js';
// import '!!file-loader?name=[path]images/[name].[ext]!../resources/MWF_1.6.0/core/images/content-images/album-glyph-default-large.png';
// import file from '!!file-loader?name=images/[name].[ext]!../resources/MWF_1.6.0/core/images/content-images/album-glyph-default-large.png';

const reactLogo = require('./react_logo.svg');

class App extends React.Component<any, any> {
    render() {
        return <div className={css.app}>
            <h1>Hello World!</h1>
            <p>Foo to the bar</p>
            <img src={reactLogo}/>
        </div>;
    }
}

export default App;
