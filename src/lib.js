// Load modules

var domain = require("domain");
var Hoek = require('hoek');
var lumberjack = require('lumberjack-protocol');
var GoodSqueeze = require('good-squeeze');
var stream = require("stream");

function GoodLogstash(events, config) {

	if (!(this instanceof GoodLogstash)) {
		return new GoodLogstash(events, config);
	}

	this.squeeze = new GoodSqueeze.Squeeze(events);
	this.safeJson = new GoodSqueeze.SafeJson();

	//errors from the most inner eventemitter of the tls socket implementation must be caught
	//with this domain in order to prevent app crashes, when the receiving end resets the connection
	//this can happen when the provided ssl cert is not valid for the corresponding server -> errors with socket hang up
	var d = domain.create();
	var self = this;
	d.on("error", function (e) {
		console.log("Caught error while connecting to logstash server", e.message);

	});
	d.run(function () {
		self.client = lumberjack.client(config.tlsOptions, config.clientOptions);
	});

	this.client.on("connect", function () {
		console.log("connection to logstash server established");
	});

	this.client.on("disconnect", function (err) {
		console.log("logstash client disconnected", err);
	});
};

GoodLogstash.prototype.init = function (readstream, emitter, callback) {

	var ws = stream.Writable();
	var self = this;
	ws._write = function (chunk, enc, next) {
		self.client.writeDataFrame({
			"line": chunk
		});
		next();
	};

	readstream
		.pipe(this.squeeze) // filters events as configured above
		.pipe(this.safeJson) // safely converts from object to a string, as stdout expects
		.pipe(ws);


	emitter.on('stop', function () {
		self.client.close();
	});

	callback();
}

GoodLogstash.attributes = {
	name: 'good-logstash'
}

module.exports = GoodLogstash;