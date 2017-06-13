const rules = {
    map: {
        test: /\.tsx?$/,
        use: ["source-map-loader"],
        enforce: "pre"
    },
}

module.exports = rules;