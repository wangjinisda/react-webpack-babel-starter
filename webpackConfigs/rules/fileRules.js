const rules = {
    files: {
          test: /\.(dll|DLL|pem)(\?[a-z0-9]+)?$/,
          loader: 'file-loader?name=/res/[name].[ext]'
    },
}

module.exports = rules;