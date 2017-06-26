const rules = {
    images: {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
            'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false'
        ]
    },
    images_only_file_loader: {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
            'file-loader'
        ]
    },
}

module.exports = rules;