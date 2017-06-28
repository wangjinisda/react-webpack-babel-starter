const rules = {
    images: {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
            'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false'
        ]
    },
    images_css: {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
           'file-loader?name=images_css/[name].[ext]'
        ]
    },
}

module.exports = rules;