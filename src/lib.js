// Load modules

var os = require('os');
var Hoek = require('hoek');
var Stringify = require('json-stringify-safe');
var Squeeze = require('good-squeeze').Squeeze;
var lumberjack = require('lumberjack-protocol');

module.exports = function (events, options) {

    var client;
    var squeezeStream = Squeeze(events);
    
    var GoodLogstash = function(events, options) {
        
    };
    
    var send = function(data) {
        client.writeDataFrame({"line": Stringify(data)});
    };
    
    var public = GoodLogstash.prototype;
    
    public.init = function(stream, emitter, callback) {
        client = lumberjack.client(options.tlsOptions, options.clientOptions);
        
        squeezeStream.on('data', function (data) {
            send(data);
        });

        stream.pipe(squeezeStream);
        callback();
    };
    
    return new GoodLogstash();
};