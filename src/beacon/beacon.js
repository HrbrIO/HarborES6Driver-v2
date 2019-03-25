/*********************************

 File:       beacon.js
 Function:   Main Beacon Object
 Copyright:  hrbr.io
 Date:       6/26/18 5:27 PM
 Author:     mkahn

 I've gone around the mental horn several times trying to decide whether this should be a *true* Node singleton
 or not. Out of the box, NodeJS `required` objects are not guaranteed to be true singletons. See the discussion
 in the link: https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/.

 For now, I am going to keep it light, and not go the extra mile with the fancy Singletons...

 **********************************/

const Buffer = require('../buffer/buffer');
const Formatter = require('../formatter/formatter');
const Tx = require('../transmitter/transmitter');
const assignIn = require('lodash').assignIn;
const util = require('util');

let buffer;
let formatter;
let tx;
let isBeaconInitialized = false;
let interMessageDelayMs;
let verbose; // set thru config
let txOn = true; // disables transmit, used mostly for testing
let drainedCallback;


function log(msg) {
    if (verbose) console.log(new Date() + ':' + msg);
}

function postNextToHarbor() {

    if (!txOn) return;

    const nextUp = buffer.pull();

    tx.post(nextUp)
        .then(resp => {
            //log('Beacon message sent successfully');
        })
        .catch(err => {
            log('Beacon message failed...status: ' + err.status);

            if (!err.status && err.code === 'ECONNREFUSED') err.status = 999; // flag for server down

            switch (err.status) {

                case 401:
                case 403:
                case 406:
                    log('Forbidden error, check API Key, beaconVersionId and appVersionId');
                    break;

                case 999: //server down
                    log('Harbor server refused connection, may be down');
                    break;

                default:
                    log(`Unhandled error. Requeing.`);
                    buffer.push(nextUp);

            }

});


}

const self = module.exports = {

    get isInitialized() {
        return isBeaconInitialized;
    },

    set txOn(shouldTransmit) {
        txOn = shouldTransmit;
    },

    get pendingTxCount() {
        return buffer.entries;
    },

    /**
     *
     * @param {Object} options
     * @param {String} options.apiKey  your api key. Required.
     * @param {Boolean} [options.allowNullMessageType=false ] allow null message type (bypass error)
     * @param {String} [options.beaconVersionId=null]  overrides the built in beaconVersionId.
     * @param {String} [options.appVersionId=null]  concatenated appId plus version. Example: io.hrbr.superapp:1.2.1
     * @param {String} [options.beaconInstanceId=null] unique Id for this instance, usually tied to the H/W or VM, etc.
     * @param {Object} [options.bufferOptions=null] allows direct setting of the Buffer block's options. See Buffer class.
     * @param {Object} [options.txOptions=null] allows direct setting of the Transmitter block's options. See Beacon-TX class.
     * @param {Number} [options.interMessageDelayMs=5]  ms between messages. Defaults to 5ms.
     * @param {Function} [options.drainedCb=null]  callback for when the message queue is drained. Useful for testing.
     * @param {Object} [options.formatter=null]  allows direct setting of the Formatter block's options. See Beacon-TX class.
     *
     */
    initialize: function (options) {

        // Error out if no API Key
        if (!options.apiKey) throw new Error("Missing apiKey");

        // Error out if no appVersionId
        if (!options.appVersionId) throw new Error("Missing appVersionId");

        // Error out if no beaconVersionId
        if (!options.beaconVersionId) throw new Error("Missing beaconVersionId");


        buffer = new Buffer(options && options.bufferOptions);
        formatter = new Formatter(options && options.formatterOptions);

        let txOptions = ( options && options.txOptions ) || {};
        txOptions = assignIn(txOptions, {
            apiKey: options.apiKey,
            appVersionId: options.appVersionId,
            beaconInstanceId: options.beaconInstanceId,
            beaconVersionId: options.beaconVersionId
        });
        tx = new Tx(txOptions);

        interMessageDelayMs = ( options && options.interMessageDelayMs ) || 5;
        drainedCallback = options.drainedCb;
        verbose = !!options.verbose;
        isBeaconInitialized = true;

        if (verbose) {
            console.log('-------  BEACON HEADER SETTINGS -------')
            console.log(util.inspect(txOptions));
        }

        Tx.Throttle
            // .on('sent', request => {
            //     console.log(`Throttle sent event.`)
            // })
            // .on('received', request => {
            //     console.log(`Throttle rx event`)
            // })
            .on('drained', () => {
                console.log(`Throttle drained event`)
            })
    },

    /**
     * @param {Object} [beaconObject=null] Beacon object
     * @param {String} [beaconObject.beaconMessageType=null]  beacon message type
     * @param { Object } [beaconObject.data = null ]  beacon data
     * @param { Number } [beaconObject.dataTimestamp = null ]  dataTimestamp, leaving null will get stamped with current time.
     */
    transmit: function (beaconObject) {

        if (!self.isInitialized) {
            throw new Error('Cannot transmit on uninitialized beacon.');
        }

        let formattedBeaconObject = formatter.format(beaconObject);
        buffer.push(formattedBeaconObject);
        // if nothing is being transmitted, kick tx off
        postNextToHarbor();

    },

    set beaconPostUrl(overridenUrl) {
        tx.beaconPostUrl = overridenUrl;
    },

    get beaconPostUrl() {
        return tx.beaconPostUrl;
    }


}
