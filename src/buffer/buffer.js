/*********************************

 File:       buffer.js
 Function:   Beacon message buffer
 Copyright:  hrbr.io
 Date:       6/25/18 8:54 PM
 Author:     mkahn

 Buffers formatted Beacon messages for transmission.

 This simple buffer is implemented as an Array.

 **********************************/

const sizeof = require( 'sizeof' ).sizeof;

module.exports = class Buffer {

    /**
     *
     * @param {Object} options - Options for the buffer
     * @param {Number} options.lengthLimit - How many entries to buffer. Default: 100, 0 is no limit.
     * @param {Number} options.memoryLimit - Check sizeof the buffer and start dropping when size exceeded. Default: 0
     *     (unlimited)
     * @param {('oldest' | 'newest')} options.dropOnLimit - Which end of the Array to toss when the limit is reached.
     *     Default: 'oldest'
     * @param {Function} options.onLimit - Callback if/when limit hit
     */
    constructor( options ) {
        this.bufferArray = [];
        this.bufferLengthLimit = ( options && options.lengthLimit ) || 100;
        this.bufferMemorySizeLimit = ( options && options.memoryLimit ) || 0;
        this.onLimitCb = ( options && options.onLimit );
        this.dropOnLimit = ( options && options.dropOnLimit ) || 'oldest';
        this.pull = this.pull.bind(this);
        this.push = this.push.bind(this);
        this.flush = this.flush.bind(this);
    }

    get lengthLimitReached() {
        return (this.bufferLengthLimit > 0) && (this.bufferArray.length >= this.bufferLengthLimit);
    }

    get memoryLimitReached() {
        return (this.bufferMemorySizeLimit > 0) && (sizeof( this.bufferArray ) >= this.bufferMemorySizeLimit);
    }

    get atLimit() {
        return this.lengthLimitReached || this.memoryLimitReached;
    }

    get entries(){
        return this.bufferArray.length;
    }

    get memoryUsage(){
        return sizeof(this.bufferArray);
    }

    get top(){
        return this.bufferArray[0];
    }


    push( messageObject ) {

        if ( this.atLimit ) {
            if ( this.dropOnLimit === 'oldest' ) {
                this.bufferArray.shift(); // chuck the oldest
                this.bufferArray.push( messageObject ); // push the newest
            } // no need to check for anything else, other option is to chuck the new entry

            if ( this.onLimitCb ) {
                this.onLimitCb( {
                    memoryLimitReached: this.memoryLimitReached,
                    lengthLimitReached: this.lengthLimitReached
                } )
            }
        } else {
            this.bufferArray.push( messageObject ); // push the newest
        }

    }

    pull() {
        return this.bufferArray.shift();
    }


    flush() {
        this.bufferArray = [];
    }


};