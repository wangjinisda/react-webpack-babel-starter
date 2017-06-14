"use strict"
const webpack            = require("webpack");
const {resolve}          = require("path");

const StyleLintPlugin    = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin  = require('html-webpack-plugin');

const FileListPlugin     = require('./plugins/FileListPlugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

const rules              = require('./rules/index');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');

const plugins            = require('./plugins/index');
var nodeExternals        = require('webpack-node-externals');

module.exports = {
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx", ".tsx", ".ts", "."],
        plugins: [ ]
    },
    entry:   {
        server: "./server/index.ts", // the entry point of our app
    },
    output: {
        path: resolve(__dirname, '../public'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate        : '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
        publicPath: resolve(__dirname, '../public/')
    },
    context: resolve(__dirname, "../src"),
    devtool: "eval-source-map",
    module: {
            rules: [
                rules.imageRules.images,
                rules.fontRules.fonts,
                rules.jadeRules.jade,
                rules.jsRules.reactJs,
                rules.jsRules.ts,
                rules.fileRuls.files
            ],
    },
    externals: [
        nodeExternals()
    ],
    plugins:     [
        new WebpackShellPlugin({
            onBuildStart:['echo "Webpack Start"'], 
            onBuildEnd:['echo "Webpack End"']
        }),
         new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false},
            sourceMap: true
        })
    ],
    target: 'node'
}