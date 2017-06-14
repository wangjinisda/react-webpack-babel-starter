'use strict';
// server entry
import "./server";
const edge = require('edge');

const path       = require("path");
const file = require( '../resources/Dlls/Microsoft.SaaSMarketPlace.Common.dll');
const wj = require( './../resources/Dlls/Sample105.dll');


console.log(file);

function getCLRMethod(methodName: string) {
        return edge.func(wj);
}

let helloWorld = edge.func(`
    async (input) => { 
        return ".NET Welcomes " + input.ToString(); 
    }
`);

helloWorld('JavaScript', function (error:any, result:any) {
    if (error) throw error;
    console.log(result);
    
});

const clrDebug = edge.func(path.normalize(wj));
clrDebug(12, function (error:any, result:any) {
	if (error) throw error;
	console.log(result);
});