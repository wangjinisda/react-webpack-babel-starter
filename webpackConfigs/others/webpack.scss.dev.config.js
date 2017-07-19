const webpack              = require("webpack");
const ExtractTextPlugin    = require('extract-text-webpack-plugin');

const rules                = require('./../rules/index');
const { resolve }          = require("path");

const rootPath             = resolve(process.cwd(), './');
const styles_LTR           = resolve(rootPath, './src/market/mac/styles/styles-LTR.scss');

const styles_RTL           = resolve(rootPath, './src/market/mac/styles/styles-RTL.scss');

module.exports = {
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx", ".tsx", ".ts"],
        modules: [
            resolve(process.cwd(), './src/resources/external_artifacts/MWF_1.6.0/core'),
            resolve(process.cwd(), './src/resources/external_artifacts/MWF_1.6.0/core/styles'),
            resolve(process.cwd(), './src/market/shared'),
            resolve(process.cwd(), './node_modules')
        ],
    },
    entry: {
        'styles_LTR': styles_LTR,
        'styles-RTL': styles_RTL
    },
    output: {
        filename: "[name].js?[hash]",
        chunkFilename: "[name].js?[hash]",
        path: resolve(rootPath, './public'),
        publicPath: "./public/"
    },
    context: rootPath,

    devtool: "eval-source-map",

    module: {
        rules: [
            rules.jsRules.reactJs,
            rules.stylesRules.cssExtractTextPluginPureNaming,
            rules.stylesRules.scssExtractTextPluginPureNaming,
            rules.imageRules.images_css,
            rules.fontRules.fonts_css,
        ]
    },
    devtool: "source-map",
    plugins: [
        new ExtractTextPlugin({
            filename: "css/[name].css?[hash]-[chunkhash]-[contenthash]-[name]",
            disable: false,
            allChunks: true
        }),
        // new webpack.optimize.CommonsChunkPlugin({ name: "c", filename: "c.js" })
    ]
};
