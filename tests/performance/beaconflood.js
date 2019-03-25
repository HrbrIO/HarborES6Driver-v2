/*********************************

 File:       beaconflood.js
 Function:   Light performance testing
 Copyright:  hrbr.io
 Date:       6/27/18 1:20 PM
 Author:     mkahn

 Floods harbor-services.

 **********************************/



const request = require('superagent');
const util = require('util');
const _ = require('lodash');
const Beacon = require('../../index');
const colors = require('colors');
const args = require('minimist')(process.argv.slice(2));

const loopDelay = args.l || 5000;
const apiKey = args.k || 'ABCD4949';
const beaconInstanceId = args.i || 'some-system-in-calif';
const appVersionId = args.a || 'io.hrbr.mitchtest:1.0.0';
const beaconVersionId = args.b || 'io.hrbr.beaconflood:1.0.0';
const loopCount = args.c || 10;
const server = args.s || 'production';
const msgType = args.m || 'BEACON_FLOOD_MSG';

let startTime;

function drained() {
    const endTime = new Date().getTime();
    const deltaTsecs = (endTime - startTime) / 1000;
    console.log('TX time for 1000 messages: ' + deltaTsecs +'sec ( '+ 1000/deltaTsecs + ' msec per msg)');
}

function sendBeacons() {
    startTime = new Date().getTime();
    _.times(loopCount, (seqNum) => {
        Beacon.transmit({
            beaconMessageType: msgType,
            data: {source: 'beaconflood.js', random: Math.random(), seqNum: seqNum}
        });
    });
}

if (!args.h){

    Beacon.initialize({
        apiKey: apiKey,
        appVersionId: appVersionId,
        beaconVersionId: beaconVersionId, //'beacon-es6-proto:0.3.0',
        beaconInstanceId: beaconInstanceId,
        txOptions: { server },
        bufferOptions: {
            lengthLimit: 100000
        },
        interMessageDelayMs: loopDelay,
        drainedCb: drained,
        verbose: true
    });

    if (server!=='local'){
        console.log('Flooding harbor services'.green);
    } else {
        console.log('Flooding local server'.green);
    }

    sendBeacons();


} else {
    console.log("-l".green+" loop delay in ms (default 5000ms)");
    console.log("-k".green + " API key (default ABCD4949)");
    console.log("-i".green + " beacon instance ID (default 'some-system-in-calif'");
    console.log("-a".green + " app version ID (default 'io.hrbr.beaconflood:0.2.0')");
    console.log("-c".green + " loop count (default: 10)");
    console.log("-s".green + " Server -> one of production (default), staging, local");
    console.log("-mt".green + " Beacon message type. Default is BEACON_FLOOD_MSG");
}







