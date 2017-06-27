const webpack              = require("webpack");
const ExtractTextPlugin    = require('extract-text-webpack-plugin');

const rules                = require('./../rules/index');
const { resolve }          = require("path");

const rootPath             = resolve(process.cwd(), './');
const styles_LTR           = resolve(rootPath, './src/client/styles/index_LTR.js');

const styles_RTL           = resolve(rootPath, './src/client/styles/index_RTL.js');

module.exports = {
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx", ".tsx", ".ts"],
    },
    entry: {
        'styles_LTR': styles_LTR,
        'styles-RTL': styles_RTL
    },
    output: {
        filename: "[name].js?[hash]",
        chunkFilename: "[name].js?[hash]",
        path: resolve(rootPath, '/public'),
        publicPath: "/public/"
    },
    module: {
        rules: [
            rules.stylesRules.cssExtractTextPlugin,
            rules.stylesRules.scssExtractTextPlugin,
            rules.imageRules.images_only_file_loader,
            rules.fontRules.fonts,
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
