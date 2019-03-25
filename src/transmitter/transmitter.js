const request = require('superagent');
const BEACON_ENDPOINT = '/beacon';

const Throttle = require('superagent-throttle');

let throttle = new Throttle({
    active: true,     // set false to pause queue
    rate: 1000,          // how many requests can be sent every `ratePer`
    ratePer: 1000,   // number of ms in which `rate` requests may be sent
    concurrent: 64    // how many requests can be sent concurrently
});



const SERVERS = {
    production: 'https://harbor-stream.hrbr.io/beacon',
    staging: 'https://harbor-stream-staging.hrbr.io/beacon',
    local: 'http://localhost:2020' + BEACON_ENDPOINT
};

let MAGIC_API_KEY = 'ABCD321099'; // Magic key for testing with local node mockup

module.exports = class BeaconTX {

    /**
     *
     * @param {Object} options - Options for the transmitter
     * @param [{String}] options.server - [ production, staging, local ]
     * @param {String} options.apiKey - API key for this client. If not specified, the test API key is used
     * @param {String} options.beaconVersionId - Version of this particular beacon
     * @param {String} [ options.appVersionId ] - Concatenated app bundle Id and version Id.
     * @param {String} [ options.beaconInstanceId ] - Normally a UDID for the device/VM.
     */
    constructor(options) {

        // This had destructuring but I was getting weird errors with null fields even using default params.
        const server = options && options.server || 'production';
        this.beaconPostUrl = SERVERS[server];
        this.apiKey = options && options.apiKey || MAGIC_API_KEY;
        this.beaconVersionId = options && options.beaconVersionId;
        this.appVersionId = options && options.appVersionId;
        this.beaconInstanceId = options && options.beaconInstanceId;

    }

    /**
     *
     * @param { Object } message - object to post to Harbor Services
     * @param {Object}  [ message.data ] - the payload for this beacon message
     * @param {Number} [ message.dataTimestamp ] - the timestamp for when the data was captured
     * @returns { Promise }
     */
    post(message) {

        // set guaranteed fields....
        let req = request.post(this.beaconPostUrl)
            .send(message.data)
            .use(throttle.plugin())
            .retry(5)
            .set('User-Agent', "Hrbr.io-ES6/0.0.1")
            .set('apikey', this.apiKey)
            .set('Accept', 'application/json');

        // You can't set a header field to null, so we need to do this for every optional field.
        if (message.beaconMessageType)
            req = req.set('beaconMessageType', message.beaconMessageType);

        if (message.dataTimestamp)
            req = req.set('dataTimestamp', message.dataTimestamp);

        if (this.beaconVersionId)
            req = req.set('beaconVersionId', this.beaconVersionId);

        if (this.appVersionId)
            req = req.set('appVersionId', this.appVersionId);

        if (this.beaconInstanceId)
            req = req.set('beaconInstanceId', this.beaconInstanceId);

        return req;

    }

    /**
     *
     * @returns {string}
     */
    static get localHarborServicesUrl() {
        return SERVERS.local;
    }

    /**
     *
     * @returns {string}
     */
    static get cloudHarborServicesProductionUrl() {
        return SERVERS.production;
    }

    static get Throttle() {
        return throttle;
    }


}
