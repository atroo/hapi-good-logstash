// Load modules

var os = require('os');
var domain = require("domain");
var Hoek = require('hoek');
var Stringify = require('json-stringify-safe');
var Squeeze = require('good-squeeze').Squeeze;
var lumberjack = require('lumberjack-protocol');
var GoodReporter = require('good-reporter');

var GoodLogstash = function (events, options) {
    this.options = options;
    GoodReporter.call(this, events, options);
};

module.exports = GoodLogstash;

Hoek.inherits(GoodLogstash, GoodReporter);

var public = GoodLogstash.prototype;

public.send = function (data) {
    this.client.writeDataFrame({
        "line": Stringify(data)
    });
};

public.start = function (emitter, callback) {

    var onReport = this._handleEvent.bind(this);
    var self = this;

    emitter.on('report', onReport);

    //errors from the most inner eventemitter of the tls socket implementation must be caught
    //with this domain in order to prevent app crashes, when the receiving end resets the connection
    //this can happen when the provided ssl cert is not valid for the corresponding server -> errors with socket hang up
    var d = domain.create();
    d.on("error", function (e) {
        console.log("Caught error while connecting to logstashserver", e.message);

    });
    d.run(function () {
        self.client = lumberjack.client(self.options.tlsOptions, self.options.clientOptions);
    });

    this.client.on("connect", function () {
        console.log("connection with logstash server established");
    });

    this.client.on("disconnect", function () {
        console.log("logstash client disconnected");
    });

    callback();
};

public._report = function (event, eventData) {
    var tags = (eventData.tags || []).concat([]);
    tags.unshift(event);

    this.send(eventData);
};