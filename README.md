# Harbor ES6/Javascript Beacon Driver v2

[Note, these docs are lifted straight from the original dirver and have not been updated. The API is the same, so this shouldn't be an issue...for now. MAK]

Example Beacon driver in ES6 Javascript. This package is intended to be used for low-level communication
with Harbor as a part of your own Javascript Beacon projects. 

This version will be written primarily for use in NodeJS apps, but the repo will include the ability to run Browserfy to 
spit out a browser-usable version. The idea is to be generic and not dependant on Angular, React, etc. networking
libraries. We may write framework specific versions later.

## Features

- Configurable, full-featured ES6 beacon driver
- Optional in-memory buffering with buffer limits based on memory usage, or number of entries.
- Optional message retries
- Optional inter-message gap 

## Usage in an Existing Node.js Project

To add the driver to your project: `yarn add beacon-es6-driver`. You can also use `npm` but we recommend `yarn`.

Initialize the driver with:

```$xslt
const Beacon = require('beacon-es6-driver');

...

Beacon.initialize({
        apiKey: "[your-api-key]",
        appVersionId: "io.somecompany.mycoolapp:1.0.0",
        beaconVersionId: "[identifier for beacon version]",
        beaconInstanceId: "[instance identifier such as a device UDID or server IP]",
        bufferOptions: {
            lengthLimit: 100000
        },
        interMessageDelayMs: 5000
    });
    
```
All options are documented below.

Once the beacon driver is initialized, you can send a beacon with:

`Beacon.transmit({ beaconMessageType: 'TEST_MSG', data: {...});`

`beaconMessageType` is application dependent, as is the `data` you send. Some foghorn and tug implementations
may require specific message types and data schema, so check your documentation. If you include `dataTimestamp` then this 
value will be used instead of the current time:

`Beacon.transmit({ beaconMessageType: 'TEST_MSG', dataTimestamp: 12345678. data: {...});`

## Configuration Options

The `Beacon.initialize` method is passed all options as an object. The fields are shown in the table below.

| Field    |      Description      |  Default Value | Required? |
|:----------|:---------------------|:--------------:|:----------:|
| **apiKey**   |  Your Harbor API Key  | n/a            |  X |
| **appVersionId** | The name and version of the app using this driver. Typically something like `io.myco.myapp:2.1.3` | n/a | X |
| **beaconVersionId** | The name and version of the beacon driver. This driver can populate this automatically, or you can override it. | n/a | X |
| beaconInstanceId | An identifier for the host of this beacon. Typically this is a unique identifier for the individual device or system.|||
| interMessageDelayMs | Time between message transmission attempts in milliseconds. | 5 ||
| drainedCb | Callback when the buffer has been drained. Signature: `()=>{}` |||
| verbose | Turn on/off logging messages. | false ||
| bufferOptions | An object describing advanced buffering options.|||
| bufferOptions.lengthLimit | Maximum number of messages buffered before dropping | 100 ||
| bufferOptions.memoryLimit | *Approximate* limit for buffer size in KB. | 0 = off ||
| bufferOptions.onLimit | Callback when one of the limits is reached. Callback signature is: `({memoryLimitReached: BOOL, lengthLimitReached: BOOL})=>{}`|||
| bufferOptions.dropOnLimit | Whether to drop the oldest (default) or newest messages when buffer is full. Only the value 'oldest' has meaning. Anything else will drop newest. | 'oldest' ||
| txOptions | An object describing advanced Transmitter options |||
| txOptions.server | String indicating which server to use. Options are 'local', 'production', 'staging'. NOTE: This is unrelated your API key designations. Unless you are working at Harbor, you should not be using anything other than production. | production ||
| formatterOptions | An object describing data field modifications to be performed by the driver. |||
| formatterOptions.commonFields | Fields you want added to every `data` object transmitted. For example, if you want to add the fields `{ color: 'red', day: 'Sunday'}` to every single message transmitted, pass that object here. |||
| formatterOptions.disableBestPractices | The driver will automatically attach fields that Harbor considers "best practices". (As of this version, there are no such fields.). | false ||

_Failure to provide the required `apiKey`, `appVersionId`, or `beaconVersionId` parameters to the `Beacon.initialize` method will result in a strongly worded `Error` and absolutely no soup for you._ 

## Installation to Create Your Own Variant

- Install Node.js if it is not already installed.
    - Node version must support ES6 features, especially closures/fat-arrow functions.
    - This was developed using Node version 8.9.3, and tested to 10.x+. Stock Ubuntu installs the ancient 4.x version which DOES NOT work. Follow the directions for your platform to get a recent version.
- After cloning the repo, go into the root folder (with `package.json` in it) and `yarn install`

## Running Beaconflood Test App

`node beaconflood.js -r -k 1234-5678-8765-4321 -c 10 -l 5`

`-r` = run remote
`-k` = api key
`-c` = how many beacons to send
`-l` = inter-beacon loop delay in ms


