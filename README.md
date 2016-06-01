# Logstash reporter for good
A good reporter to communicate directly with a logstash instance using the lumberjack-protocol client

## Install

```javascript
npm install --save hapi-good-logstash
```

## Supported Good Versions

The Good Interface and the Reporter Interface eventually change from one major version to the next version, see the following compatibility table to select the good-logstash version according to your targeted good version

Good Version | hapi-good-logstah Version
--- | ---
< 6 | 0.0.4
6 | 1.0.0
7 | not supported yet

## Usage

Example for sending all ops events to logstash

```javascript
connection.register({
    register: require('good'),
    options: {
      opsInterval: 15000,
        reporters: [{
          reporter: "hapi-good-logstash",
          args: [{
              ops: '*'
          }, {
              tlsOptions: {
                  host: "localhost",
                  port: 8001,
                  ca: [fs.readFileSync('path to .crt')],
                  key: [fs.readFileSync('path to .key')],
                  cert: [fs.readFileSync('path to .crt')]
              },
              clientOptions: {
                  maxQueueSize: 500
              }
          }]
      }]
    } 
}, function (err) {
    if (err) {
        console.log('Failed loading good plugin', err);
    }
});
```

The clientoptions are passed to the [lumberjack-protocol module](https://github.com/benbria/node-lumberjack-protocol) and the tlsOptions are passed to the node.js tls socket connection directly.

## Security

**We use a patched version of logstash and the lumberjack input**, which only **accepts ssl** certificates configured in the logstash config, so the socket connection will be reset, if you provide a wrong certificate. This is **unfortunately not the default behavior of the official Logstash release**. The official logstash package accepts inputs even if provided a completley different certificate.

We published a blog post with a guide how to use our patched setup on [our homepages tech section](http://www.atroo.de/en/atroo-is-elking/).
