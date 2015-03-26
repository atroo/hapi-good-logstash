// Load modules

var EventEmitter = require('events').EventEmitter;
var Stream = require('stream');
var Http = require('http');
var GoodLogstash = require('..');
var Hoek = require('hoek');
var expect = require('chai').expect;

// Declare internals

var internals = {};

internals.isSorted = function (elements) {

    var i = 0;
    var il = elements.length;

    while (i < il && elements[i + 1]) {

        if (elements[i].timestamp > elements[i + 1].timestamp) {
            return false;
        }
        ++i;
    }
    return true;
};

internals.getUri = function (server) {

    var address = server.address();

    return 'http://' + address.address + ':' + address.port;
};

internals.readStream = function (done) {

    var result = new Stream.Readable({ objectMode: true });
    result._read = Hoek.ignore;

    if (typeof done === 'function') {
        result.once('end', done);
    }

    return result;
};

// Test shortcuts

describe('GoodLogstash', function () {

    it('allows creation using new', function (done) {

        var reporter = new GoodLogstash({ log: '*' });
        expect(reporter).to.exist;
        done();
    });

   
});