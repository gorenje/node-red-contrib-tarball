module.exports = function (RED) {
    function TarBallFunctionality(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        var cfg = config;

        const tarStream = require('tar-stream');
        const memoryStreams = require('memory-streams');
        const pakoGzip = require('pako')

        node.on('close', function () {
            node.status({});
        });

        node.on("input", function (msg, send, done) {
            const pack = tarStream.pack()

            msg.contents.forEach((elem) => {
                pack.entry({ name: elem.name }, elem.contents)
            })

            pack.finalize()

            var writer = new memoryStreams.WritableStream();

            pack.pipe(writer);

            writer.on('finish', function () {
                msg.payload = Buffer.from(pakoGzip.gzip(writer.toBuffer()));
                send(msg)
                done()
            });
        });
    };

    RED.nodes.registerType("TarBall", TarBallFunctionality);
}