
before( function ( done ) {

    // Increase the Mocha timeout for now
    this.timeout( 10000 );

    // teeny, tiny, hack for something node.js probably ought to do itself.
    global.__basedir = __dirname;

    done();

} );

after( function ( done ) {

    done();

} );