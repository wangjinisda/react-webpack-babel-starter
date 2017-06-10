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
        libraryTarget: 'commonjs2'
    },
    context: resolve(__dirname, "../src"),
    devtool: "inline-source-map",
    module: {
            rules: [
                rules.imageRules.images,
                rules.fontRules.fonts,
                rules.jadeRules.jade,
                rules.stylesRules.cssExtractTextPlugin,
                rules.stylesRules.scssExtractTextPlugin,
                rules.jsRules.reactJs,
                rules.jsRules.ts,
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
    ],
    target: 'node'
}