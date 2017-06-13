var DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");

const dir = "./core/images/content-images";



const resolve = {
    DirectoryNamedWebpackPlugin:  new DirectoryNamedWebpackPlugin({
            honorIndex: true | false, // defaults to false 

            // respect "main" fields defined in package.json 
            // if it's an Array, values will be used as name of the fields to check 
            // defaults to true, which is the same as ["main"] 
            honorPackage: true | false | ["main"],

            ignoreFn: function (webpackResolveRequest) {
                // custom logic to decide whether request should be ignored 
                // return true if request should be ignored, false otherwise 
                console.log(JSON.stringify(webpackResolveRequest.relativePath))
                if(webpackResolveRequest.relativePath === dir){
                    return false;
                }else{
                    return true
                }
            },

            transformFn: function (dirName) {
                // use this function to provide custom transforms of resolving directory name 
                // return desired filename or array of filenames which will be used 
                // one by one (honoring order) in attempts to resolve module 
                console.log("Hello World!")
                console.log(JSON.stringify(dirName))
                return ["album-glyph-default-large.png", "app-glyph-default-small.png"]; // default 
            }
        }) ,
        DirectoryNamedWebpackPluginDefault: new DirectoryNamedWebpackPlugin(true)
}

module.exports = resolve ;
