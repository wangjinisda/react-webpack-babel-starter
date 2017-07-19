const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { resolve } = require("path");

const rules = {
    // ...
    css: {
        test: /\.css$/,
        use: ["style-loader", "css-loader?modules", "postcss-loader",],
    },
    scss: {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"],
        //exclude: path.resolve(__dirname, 'src/app')
    },
    cssExtractTextPlugin: {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',

            // Could also be write as follow:
            // use: 'css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
            use: [
                {
                    loader: 'css-loader',
                    query: {
                        modules: true,
                        localIdentName: '[name]__[local]___[hash:base64:5]'
                    }
                },
                'postcss-loader'
            ]
        }),
    },
    cssExtractTextPluginPureNaming: {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',

            // Could also be write as follow:
            // use: 'css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
            use: [
                {
                    loader: 'css-loader',
                    query: {
                        modules: true,
                        localIdentName: '[local]'
                    }
                },
                'postcss-loader'
            ]
        }),
    },
    scssExtractTextPlugin: {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',

            // Could also be write as follow:
            // use: 'css-loader?modules&importLoader=2&sourceMap&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader'
            use: [
                {
                    loader: 'css-loader',
                    query: {
                        modules: true,
                        sourceMap: true,
                        importLoaders: 2,
                        localIdentName: '[name]__[local]___[hash:base64:5]'
                    }
                },
                'sass-loader'
            ]
        }),
    },
    scssExtractTextPluginPureNaming: {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',

            // Could also be write as follow:
            // use: 'css-loader?modules&importLoader=2&sourceMap&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader'
            use: [
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        sourceMap: true,
                        importLoaders: 2,
                        localIdentName: '[local]',
                        import: true
                    }
                },
                {
                    loader: "sass-loader",
                    options: {
                        includePaths: [
                            resolve(__dirname, "./../../src/resources/external_artifacts/MWF_1.6.0"),
                            resolve(__dirname, "./../../src/resources/external_artifacts/MWF_1.6.0/core/styles")
                        ]
                    }
                }
            ]
        }),
    }

    // ...
}

module.exports = rules;