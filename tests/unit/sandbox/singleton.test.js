/*********************************

 File:       singleton.test.js
 Function:   Tests the Fancy Singleton Pattern (cache busting)
 Copyright:  hrbr.io
 Date:       6/26/18 10:44 AM
 Author:     mkahn

 See:
 https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/

 **********************************/

const expect = require( "chai" ).expect;
const Singleton = require( '../../../src/sandbox/singletonExample' );



describe( 'Singleton Tests', function () {

    describe( 'Singleton operation', function () {

        it( 'Singleton object should exist on global scope', function ( done ) {
            expect( Singleton ).to.be.an('object');
            expect( Singleton.beer ).to.equal('Budweiser');
            done();
        } );

        // If Object.freeze is uncommented in the Singleton code, this will fail
        it( 'There must be only one', function ( done ) {
            const Singleton2 = require( '../../../src/sandbox/singletonExample' );
            expect( Singleton.beer ).to.equal( 'Budweiser' );
            expect( Singleton2.beer ).to.equal( 'Budweiser' );
            Singleton2.beer = 'Blue Moon';
            expect( Singleton.beer ).to.equal( 'Blue Moon' );
            done();
        } );

    } );


} );