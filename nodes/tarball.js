module.exports = function(RED) {
  function CoretarballFunctionality(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var cfg = config;

    const tarStream = require('tar-stream');
    const streamx = require('streamx');
    const pakoGzip = require('pako');
    const lzmaNative = require('lzma-native');

    /*
     * Extract tar files.
     */
    var extractTarFile = (tarData, onFile, onFinish, onError) => {
      const extract = tarStream.extract()

      var allFiles = [];

      extract.on('entry', function (header, stream, next) {
        // header is the tar header
        // stream is the content body (might be an empty stream)
        // call next when you are done with this entry

        var buffer = [];

        stream.on('data', function (data) {
          buffer.push(data)
        });

        stream.on('end', function () {
          //@ts-ignore
          onFile(header.name, Buffer.concat(buffer))

          allFiles.push({
            path: header.name,
            payload: Buffer.concat(buffer)
          })

          next() // ready for next entry
        })

        stream.resume() // just auto drain the stream
      })

      extract.on('finish', function () {
        onFinish(allFiles)
      })

      extract.on('error', onError);

      var stream = streamx.Readable.from(Buffer.from(tarData))
      stream.pipe(extract);
    }

    /**
     *  Extract any payload checking the encoding: lz, gzip or none.
     */
    var extract = (payload, onFile, onDone, onTarError, onOtherError) => {
      import('file-type').then(module => {

        if ( !Buffer.isBuffer(payload)) {
          payload = Buffer.from(payload)
        }

        module.fileTypeFromBuffer(payload).then(d => {
          switch (d.ext) {
            case 'gz':
              extractTarFile(pakoGzip.inflate(payload), onFile, onDone, onTarError)
              break
            case 'tar':
              extractTarFile(payload, onFile, onDone, onTarError)
              break
            case 'xz':
              lzmaNative.decompress(payload).then(data => {
                extractTarFile(data, onFile, onDone, onTarError)
              }).catch(err => {
                onOtherError("tarball.error.xzcorrupt", err)
              })
              break
            default:
              onOtherError("tarball.error.formatnotsupported", err)
          }
        }).catch(err => {
          onOtherError("tarball.error.general", err)
        })
      }).catch(err => {
        onOtherError("tarball.error.general", err)
      })
    }

    /**
     * Compress payload to a tar file without compression.
     */
    var compress = (payload, onDone, onError) => {
      const pack = tarStream.pack()

      var buffer = [];

      pack.on('end', function () {
        onDone(Buffer.concat(buffer))
      });

      pack.on('data', function (data) {
        buffer.push(data)
      });

      pack.on('error', (err) => {
        onError(err)
      })

      payload.forEach((elem) => {
        if ( elem.path && elem.path != "" ) {
          var buf = Buffer.isBuffer(elem.payload) ? elem.payload : Buffer.from(elem.payload)
          pack.entry({ name: elem.path }, buf)
        }
      })

      pack.finalize()       
    }

    /*
     * Close something
     */
    node.on('close', function() {
      node.status({});
    });

    /* 
      * msg handler, in this case pass the message on unchanged 
      */
    node.on("input", function(msg, send, done) {

      var onOtherError = (localeKey, err) => {
        msg.error = err
        done(RED._(localeKey), msg)
      };

      /* no payload, no dice */
      if (!msg.hasOwnProperty('payload')) {
        return onOtherError("tarball.error.nopayload", { message: RED._("tarball.error.nopayload") })
      }

      /** Extraction handlers **/
      var onFile = (path, content) => {
        node.status({ fill: "yellow", shape: "dot", text: path })
        send({
          ...msg,
          path: path,
          payload: content
        }, false)
      };

      var onDone = (allFiles) => {
        node.status({ fill: "green", shape: "dot", text: RED._("tarball.info.complete_extraction") })
        send({
          ...msg,
          complete: true,
          payload: allFiles,
          path: undefined
        }, false)
        
        setTimeout(() => { node.status({}) }, 2000)
        done();
      };

      var onTarError = (err) => {
        node.status({ fill: "red", shape: "dot", text: RED._("tarball.error.general") })
        msg.error = err
        done(RED._("tarball.error.untar"), msg)
      };

      
      /** compression handlers **/
      var onCompDone = (tardata) => {
        node.status({ fill: "green", shape: "dot", text: RED._("tarball.info.complete_archive") })
        msg.payload = tardata
        send(msg,false)

        setTimeout(() => { node.status({}) }, 2000)
        done()
      };

      var onCompError = (err) => {
        node.status({ fill: "red", shape: "dot", text: RED._("tarball.error.general") })
        msg.error = err
        done(RED._("tarball.error.compressfailed"), msg)
      };
      
      /** handle the payload */
      switch (typeof msg.payload ) {
        case 'object':
          if (Array.isArray(msg.payload)) {
            compress(msg.payload, onCompDone, onCompError)
          } else {
            extract(msg.payload, onFile, onDone, onTarError, onOtherError)
          }
          break;
        default:
          done(RED._("tarball.error.unknownpayload"), msg)
      }
    });
  }

  RED.nodes.registerType("tarball", CoretarballFunctionality);

}
