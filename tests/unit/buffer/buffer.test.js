/*********************************

 File:       buffer.test.js
 Function:   Tests the Beacon message buffer
 Copyright:  hrbr.io
 Date:       6/26/18 10:44 AM
 Author:     mkahn

 Enter detailed description

 **********************************/

const expect = require("chai").expect;
const Buffer = require('../../../src/buffer/buffer');
const _ = require('lodash');


describe('Buffer Unit Tests', function () {

    describe('Initial state checks', function () {

        it('Fresh Buffer with no options should have proper values.', function (done) {
            const buff = new Buffer();
            expect(buff.bufferLengthLimit).to.be.a('number');
            expect(buff.bufferLengthLimit).to.equal(100);
            expect(buff.bufferMemorySizeLimit).to.be.a('number');
            expect(buff.bufferMemorySizeLimit).to.equal(0);
            expect(buff.onLimitCb).to.be.undefined;
            expect(buff.dropOnLimit).to.equal('oldest');
            done();
        });

        it('Fresh Buffer with user options should have proper values.', function (done) {
            const buff = new Buffer({
                lengthLimit: 99,
                memoryLimit: 5000,
                onLimit: function (cbval) {
                },
                dropOnLimit: 'newest'
            });
            expect(buff.bufferLengthLimit).to.be.a('number');
            expect(buff.bufferLengthLimit).to.equal(99);
            expect(buff.bufferMemorySizeLimit).to.be.a('number');
            expect(buff.bufferMemorySizeLimit).to.equal(5000);
            expect(buff.onLimitCb).to.be.a('function');
            expect(buff.dropOnLimit).to.equal('newest');
            done();
        });


    });

    describe('Basic push/pull with default limits', function () {

        const buff = new Buffer();

        it('Should work for basic push/pull', function (done) {
            //expect( buff.first ).to.be.undefined;
            _.times(100, (value) => {
                buff.push({value: value})
            });
            expect(buff.entries).to.equal(100);
            expect(buff.atLimit).to.equal(true);
            let oldest = buff.pull();
            expect(oldest).to.be.an('object');
            expect(oldest.value).to.equal(0);
            expect(buff.atLimit).to.equal(false);
            expect(buff.entries).to.equal(99);
            oldest = buff.pull();
            expect(oldest.value).to.equal(1);
            done();
        });

        it('Should drain', function (done) {
            _.times(buff.entries, () => {
                let p = buff.pull();
                expect(p).to.be.an('object');
            });
            expect(buff.pull()).to.be.undefined;
            expect(buff.entries).to.be.equal(0);
            done();
        });

    });

    describe('Push with limits, no callback', function () {


        it('Should overflow at 10 entries.', function (done) {
            const buff = new Buffer({lengthLimit: 10});
            _.times(100, (value) => {
                buff.push({value: value})
            });
            expect(buff.entries).to.equal(10);
            expect(buff.atLimit).to.equal(true);
            let oldest = buff.pull();
            expect(oldest).to.be.an('object');
            expect(oldest.value).to.equal(90);
            expect(buff.atLimit).to.equal(false);
            expect(buff.entries).to.equal(9);
            oldest = buff.pull();
            expect(oldest.value).to.equal(91);
            done();
        });

        it('Should overflow due to memory', function (done) {
            const buff = new Buffer({memoryLimit: 90});
            _.times(15, (value) => {
                buff.push({value: value})
            });
            expect(buff.entries).to.equal(5);

            expect(buff.atLimit).to.equal(true);
            _.times(15, buff.pull);

            expect(buff.atLimit).to.equal(false);
            expect(buff.entries).to.equal(0);
            let oldest = buff.pull();
            expect(oldest).to.be.undefined;
            done();
        });

    });

    describe('Push with limits, test callback', function () {


        it('Should overflow at 10 entries and callback.', function (done) {

            const buff = new Buffer({
                lengthLimit: 10,
                onLimit: (flags) => {
                    expect(buff.atLimit).to.equal(true);
                    done();
                }
            });

            _.times(11, (value) => {
                buff.push({value: value})
            });

        });


    });

    describe('Check getters', function () {


        it('Should report changing memory usage.', function (done) {

            const buff = new Buffer();
            const initialMem = buff.memoryUsage;
            buff.push({yada: 999});
            buff.push({yada: 999});
            buff.push({yada: 999});
            const memAt3 = buff.memoryUsage;
            expect(memAt3).to.be.greaterThan(initialMem);
            buff.pull();
            buff.pull();
            buff.pull();
            expect(buff.memoryUsage).to.be.lessThan(memAt3);
            done();

        });

        it('Should return the backing array.', function (done) {

            const buff = new Buffer();
            buff.push({yada: 999});
            buff.push({yada: 999});
            buff.push({yada: 999});
            const arr = buff.bufferArray;
            expect(arr.length).to.be.equal(3);
            done();

        });

        it('Should return the top of the buffer.', function (done) {

            const buff = new Buffer();
            buff.push({yada: 111});
            buff.push({yada: 222});
            buff.push({yada: 333});
            const top = buff.top;
            expect(top.yada).to.be.equal(111);
            expect(buff.entries).to.be.equal(3);
            done();

        });


    });

    describe('Test flush', function () {

        const buff = new Buffer();

        it('Should empty when flushed', function (done) {
            //expect( buff.first ).to.be.undefined;
            _.times(100, (value) => {
                buff.push({value: value})
            });
            expect(buff.entries).to.equal(100);
            expect(buff.atLimit).to.equal(true);
            buff.flush();
            expect(buff.entries).to.equal(0);
            done();
        });
    });

});