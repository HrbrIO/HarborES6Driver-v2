/*********************************

 File:       formatter.test.js
 Function:   Unit test for the beacon formatter
 Copyright:  hrbr.io
 Date:       6/25/18 9:22 PM
 Author:     mkahn

 **********************************/


const expect = require("chai").expect;
const Formatter = require('../../../src/formatter/formatter');
const _ = require('lodash');

const COMMON_FIELDS = {
    beer: 'Harp',
    wine: {region: 'Paso Robles', vineyard: 'Hidden Oaks'}
};


describe('Formatter Unit Tests', function () {

    describe('Static getters', function () {

        it('should return the best practices object', function (done) {
            const bpFields = Formatter.bestPracticeFields;
            expect(bpFields).to.be.an('object');
            done();
        });

    });

    describe('Supplemental field disables in constructor', function () {

        it('formatter should have BP and all formatting disabled', function (done) {
            const fmtr = new Formatter({disableBestPractices: true, disableAllFormatting: true});
            expect(fmtr.disableBestPractices).to.equal(true);
            expect(fmtr.disableAllFormatting).to.equal(true);
            done();
        });

        // This test is redundant for coverage, but here for sanity check.
        it('formatter should have BP and all formatting ENABLED', function (done) {
            const fmtr = new Formatter();
            expect(fmtr.disableBestPractices).to.equal(false);
            expect(fmtr.disableAllFormatting).to.equal(false);
            done();
        });

    });

    describe('Formatting with/without becaonMessageType', function () {

        it('formatter should return object with BP fields attached, no beaconMessageType', function (done) {
            const fmtr = new Formatter();
            const beaconMsg = {cpu: 0.98, weather: 'stormy'};
            const formatted = fmtr.format({ beaconMessageType: null, data: beaconMsg });
            expect(formatted).to.be.an('object');
            expect(formatted.data).to.be.an('object');
            expect(formatted.data.cpu).to.equal(beaconMsg.cpu);
            expect(formatted.data.weather).to.equal(beaconMsg.weather);
            expect(formatted.dataTimestamp).to.be.a('number');
            expect(formatted.beaconMessageType).to.be.null;
            done();
        });

        it('formatter should return object with BP fields attached, and beaconMessageType', function (done) {
            const bmt = "CPU_AND_WEATHER";
            const fmtr = new Formatter();
            const beaconMsg = {cpu: 0.98, weather: 'stormy'};
            const formatted = fmtr.format({ beaconMessageType: bmt, data: beaconMsg});
            expect(formatted).to.be.an('object');
            expect(formatted.data).to.be.an('object');
            expect(formatted.data.cpu).to.equal(beaconMsg.cpu);
            expect(formatted.data.weather).to.equal(beaconMsg.weather);
            expect(formatted.dataTimestamp).to.be.a('number');
            expect(formatted.beaconMessageType).to.equal(bmt);
            done();
        });

    });


    // describe('Formatting with BP turned on/off', function () {
    //
    //     it('formatter should return object with BP fields attached, no beaconMessageType', function (done) {
    //         const fmtr = new Formatter();
    //         const beaconMsg = {cpu: 0.98, weather: 'stormy'};
    //         const formatted = fmtr.format(beaconMsg);
    //         expect(formatted).to.be.an('object');
    //         expect(formatted.data).to.be.an('object');
    //         expect(formatted.data.cpu).to.equal(beaconMsg.cpu);
    //         expect(formatted.data.weather).to.equal(beaconMsg.weather);
    //         //FIXME: there are no BP fields right now, so nothing to really test
    //         //expect( formatted.data.recordedAt ).to.be.a( 'number' );
    //
    //         expect(formatted.dataTimestamp).to.be.a('number');
    //         expect(formatted.beaconMessageType).to.be.undefined;
    //
    //         done();
    //     });
    //
    //     // it( 'formatter should return object without BP fields attached', function ( done ) {
    //     //     const fmtr = new Formatter( { disableBestPractices: true } );
    //     //     const beaconMsg = { cpu: 0.98, weather: 'stormy' };
    //     //     const formatted = fmtr.format( beaconMsg );
    //     //     expect( formatted ).to.be.an( 'object' );
    //     //     expect( formatted.cpu ).to.equal( beaconMsg.cpu );
    //     //     expect( formatted.weather ).to.equal( beaconMsg.weather );
    //     //     expect( formatted ).to.not.have.property('recordedAt');
    //     //     done();
    //     // } );
    //
    // });

    describe('Formatting with Common Fields', function () {

        it('formatter should return object with BP & CF  attached', function (done) {
            const fmtr = new Formatter({commonFields: COMMON_FIELDS});
            const beaconMsg = {cpu: 0.98, weather: 'stormy'};
            const formatted = fmtr.format({ beaconMessageType: null, data: beaconMsg});
            expect(formatted).to.be.an('object');
            expect(formatted.data.cpu).to.equal(beaconMsg.cpu);
            expect(formatted.data.weather).to.equal(beaconMsg.weather);
            expect(formatted.data.beer).to.equal(COMMON_FIELDS.beer);
            expect(formatted.data.wine.region).to.equal(COMMON_FIELDS.wine.region);
            expect(formatted.data.wine.vineyard).to.equal(COMMON_FIELDS.wine.vineyard);
            done();
        });


        it('formatter should throw error with non-object CF field', function (done) {
            // This is a little trick to catch errors in constructors
            const func = function () {
                new Formatter({commonFields: 'this should crash'})
            };
            expect(func).to.throw();
            done();
        });

    });


});