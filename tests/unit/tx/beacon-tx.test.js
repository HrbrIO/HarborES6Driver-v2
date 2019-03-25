const expect = require("chai").expect;
const BeaconTx = require('../../../src/transmitter/transmitter');
const magicApiKey = require('../../environment').magicApiKey;
const testApiKey = 'BeerAndChickenWings';
const _ = require('lodash');

const options = {
    beaconInstanceId: 'test-binsid',
    appVersionId: 'test-appverid',
    beaconVersionId: 'test-bverid'
};

describe('Beacon-TX Unit Tests', function () {

    describe('Endpoints', function () {

        it('should return a local URL string', function (done) {
            const btx = new BeaconTx({server: 'local'});
            expect(btx.beaconPostUrl).to.equal('http://localhost:2020/beacon');
            done();
        });

        it('should return a cloud URL string', function (done) {
            const btx = new BeaconTx();
            expect(btx.beaconPostUrl).to.equal('https://harbor-stream.hrbr.io/beacon');
            done();
        });


    });

    describe('API Key', function () {

        it('should return the magic api key when no key is passed', function (done) {
            const btx = new BeaconTx();
            expect(btx.apiKey).to.equal(magicApiKey);
            done();
        });

        it('should return the api key when a specific key is passed', function (done) {
            const btx = new BeaconTx({apiKey: testApiKey});
            expect(btx.apiKey).to.equal(testApiKey);
            done();
        });

    });

    describe('Options', function () {


        it('should return the passed options', function (done) {
            const btx = new BeaconTx(options);
            expect(btx.beaconInstanceId).to.equal(options.beaconInstanceId);
            expect(btx.appVersionId).to.equal(options.appVersionId);
            expect(btx.beaconVersionId).to.equal(options.beaconVersionId);

            done();
        });


    });

    describe('HTTP TX to Local Server', function () {

        it('should return a 200 if the local server is running', function (done) {

            let opt = _.cloneDeep(options);
            opt.server = 'local';

            const btx = new BeaconTx(opt);
            btx.post({cpuUtil: 0.98})
                .then(response => {
                    expect(response).to.be.an('object');
                    done();
                })
                .catch(err => {
                    console.error("Can't post, check to make sure REST endpoint is up");
                });
        });

    });

    describe('Static debug methods/getters/etc.', function () {

        it('should return the local Harbor services URL', function (done) {
            expect(BeaconTx.localHarborServicesUrl).to.equal('http://localhost:2020/beacon');
            expect(BeaconTx.cloudHarborServicesProductionUrl).to.equal('https://harbor-stream.hrbr.io/beacon');
            done();
        });

    });

});