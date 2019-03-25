/*********************************

 File:       Singleton.js
 Function:   Example of a Singleton in Node.js
 Copyright:  hrbr.io
 Date:       6/26/18 10:40 AM
 Author:     mkahn

There's a good chance we will want some/all of the Beacon to be a singleton so that we
don't end up with multiple instances/cache stores, etc.

This example code is from:
https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/

 **********************************/

// create a unique, global symbol name
// -----------------------------------
const BEACON_KEY = Symbol.for( "io.hrbr.beacones6proto" );

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

const globalSymbols = Object.getOwnPropertySymbols( global );
const hasBeacon = (globalSymbols.indexOf( BEACON_KEY ) > -1);

if ( !hasBeacon ) {
    global[ BEACON_KEY ] = {
        tag: "Hello Beacon!"
    };
}

// define the singleton API
// ------------------------
const singleton = {
    beer: 'Budweiser'
};

Object.defineProperty( singleton, "instance", {
    get: function () {
        return global[ BEACON_KEY ];
    }
} );

// ensure the API is never changed
// -------------------------------

//Object.freeze( singleton );

// export the singleton API only
// -----------------------------

module.exports = singleton;