/*********************************

 File:       formatter.js
 Function:   Add additional fields to every beacon message, if so configured
 Copyright:  hrbr.io
 Date:       6/25/18 8:54 PM
 Author:     mkahn

 Adds "stock" ( and/or best practices) fields to a JSON beacon message before it moves on to the Cache and TX blocks

 **********************************/

const isObject = require('lodash').isObject;
const assignIn = require('lodash').assignIn;
const isString = require('lodash').isString;
const isPlainObject = require('lodash').isPlainObject;
const isArray = require('lodash').isArray;

module.exports = class Formatter {

    /**
     *
     * @param {Object} options - Options for the formatter
     * @param {Boolean} options.disableAllFormatting - Don't attach any supplemental fields
     * @param {Boolean} options.disableBestPractices - Don't attach best practice fields
     * @param {Object} options.commonFields - Fields that should be attached at the root of every beacon message
     */
    constructor(options) {

        // TODO do we still need these?
        this.disableAllFormatting = !!( options && options.disableAllFormatting );
        this.disableBestPractices = !!( options && options.disableBestPractices );
        // check for common fields and check that they are actually an object
        const cf = options && options.commonFields;
        if (cf && isObject(cf)) {
            this.commonFields = options && options.commonFields;
        } else if (cf && !isObject(cf)) {
            throw 'commonFields parameter must be an object';
        }
    }

    /**
     * @param { Object } [beaconObject=null]
     * @returns { Object }
     */
    format({data = null, beaconMessageType, dataTimestamp = null}) {

        let formattedObject = {};
        formattedObject.dataTimestamp = dataTimestamp || new Date().getTime();

        formattedObject.beaconMessageType = beaconMessageType;
        formattedObject.data = data;

        formattedObject.data = this.disableBestPractices ? formattedObject.data : assignIn(formattedObject.data, Formatter.bestPracticeFields);
        // if the user doesn't want common fields, don't pass any. There is no need for explicit disable.
        formattedObject.data = assignIn(formattedObject.data, this.commonFields);
        return formattedObject;

    }

    /**
     * Static best practices fields. This may or may not be here long term since stuff like dataTimestamp
     * got moved into the header.
     * @returns {Object}
     */
    static get bestPracticeFields() {
        return {};
    }


}