/*********************************

 File:       beacon.test.js
 Function:   Tests the main Beacon State Machine
 Copyright:  hrbr.io
 Date:       6/26/18 10:44 AM
 Author:     mkahn

 Enter detailed description

 **********************************/

const expect = require("chai").expect;
const Beacon = require('../../../src/beacon/beacon');
const _ = require('lodash');


describe('Beacon Unit Tests', function () {

    describe('Initialize state checks', function () {

        Beacon.txOn = false; // for testing

        it('Fresh Beacon should be uninitialized.', function (done) {
            expect(Beacon.isInitialized).to.equal(false);
            done();
        });

        it('Un-initted Beacon should throw Error on transmit.', function (done) {
            expect(Beacon.transmit).to.throw();
            done();
        });

        it('Init of Beacon should change isInitialized.', function (done) {
            Beacon.initialize({apiKey: 'ABCD321099', appVersionId: 'io.hrbr.test:1.0.0',
                beaconVersionId: 'io.hrbr.test:1.0.0', txOptions: {useLocalServer: true}});
            expect(Beacon.isInitialized).to.equal(true);
            done();
        });

        it('Initted Beacon should NOT throw Error on transmit.', function (done) {
            expect(() => Beacon.transmit({ beaconMessageType: 'TEST', data: {}})).to.not.throw();
            // TODO: this should be in its own test, but there were sequencing issues...
            Beacon.beaconPostUrl = 'beer';
            expect(Beacon.beaconPostUrl).to.equal('beer');
            done();
        });

        it('Should send 10 beacons', function (done) {
            Beacon.initialize({
                apiKey: 'ABCD321099',
                appVersionId: 'io.hrbr.mochatestapp:9.8.7',
                beaconVersionId: 'io.hrbr.mochatestbeacon:5.4.3',
                beaconInstanceId: 'this_must_be_the_place',
                txOptions: { server: 'local'},
                drainedCb: () => done()
            });
            Beacon.txOn = true; // for testing
            _.times(10, value => {
                Beacon.transmit({beaconMessageType: "TEST_STREAM", data: {value: value}});
            });
            // TODO: Right now, pass/fail for this visual inspection of the Sails DB. Not great.
        });

        it('Should provide Tx buffer count', function (done) {
            Beacon.txOn = false; // for testing
            _.times(5, value => {
                Beacon.transmit({beaconMessageType: "TEST_STREAM", data: {value: value}});
            });
            expect(Beacon.pendingTxCount).to.be.equal(5);
            // TODO: Right now, pass/fail for this visual inspection of the Sails DB. Not great.
            done();
        });


    });




});