const webpack = require("webpack");
const { resolve } = require("path");
const StyleLintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const FileListPlugin = require('./plugins/FileListPlugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const rules = require('./rules/index');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const plugins = require('./plugins/index');

module.exports = {
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx", ".tsx", ".ts", "."],
        plugins: []
    },
    entry: {
        main: "./client/index.tsx", // the entry point of our app
        vendor: ['react', 'react-dom']
    },
    output: {
        filename: '[name].[hash].js',
        path: resolve(process.cwd(), "./public"),
        publicPath: "/" // necessary for HMR to know where to load the hot update chunks
    },

    context: resolve(process.cwd(), "./src"),
    devtool: "eval-source-map",

    devServer: {
        hot: true, // enable HMR on the server
        contentBase: resolve(process.cwd(), "./public"), // match the output path
        publicPath: "/" // match the output `publicPath`
    },

    module: {
        rules: [
            rules.imageRules.images,
            rules.fontRules.fonts,
            rules.pugRules.pug,
            rules.stylesRules.cssExtractTextPlugin,
            rules.stylesRules.scssExtractTextPlugin,
            rules.jsRules.reactJs,
            rules.jsRules.ts,
        ],
    },

    plugins: [
        new FileListPlugin({ options: true }),
        new StyleLintPlugin(),
        new webpack.HotModuleReplacementPlugin(), // enable HMR globally
        new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
        new HtmlWebpackPlugin({
            // Required
            inject: false,
            template: require('html-webpack-template-pug'),
            // Optional
            appMountId: 'root',
            mobile: true,
            title: 'My App',
            injectExtras: {
                head: [
                    "/css/styles-LTR.css"
                ]
            }
            // Other options...
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'chunks', // Specify the common bundle's name.
            filename: `chunks-[hash].js`,
        }),
        new WebpackShellPlugin({ onBuildStart: ['echo "Webpack Start"'], onBuildEnd: ['echo "Webpack End"'] }),
        // 
        new ExtractTextPlugin("style.css")
    ],
    performance: {
        hints: false
    },
    target: 'web'
};
