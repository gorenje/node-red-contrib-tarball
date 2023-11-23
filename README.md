# Tarball

Create and extract tar archive files.

## Usage

This node can extract and create tar files, it does this depending on the `msg.payload`:

- if the payload is an array, assume that a tarball should be created
- if the payload is an `object` then assume the payload is a `Buffer` to be extracted

**Extraction**

Extraction generates a message per file found and a final message with `complete = true` is sent once the file has been completely extracted. The payload of the final complete message is an array of all files extracted.

This behaviour allows this node to be connected to a join node in manual mode.

Extraction assumes that the msg.payload is an Buffer with the contents of the tarball. Either encoded in xz format, gzip format or non-encoded tar archive.

A message is generated for each file that is extracted. All data is encoded in a `Buffer` object as it is not possible to distinguish between binary content and text content. The message has a `path` attribute for the file name and `payload` contains the buffer with the files contents.

Once all files have been extracted, one file message is sent that contains `complete` set to true and `payload` being an array containing all files that were extracted. Each file is represented by a hash object: 

```
{
  path: "full path of file",
  payload: Buffer.from("object containing file contents in Buffer form")
}
```

**Compression**

For compression, `msg.payload` is assumed to be an array containing objects of the form:

```
{
  path: "full/path/in/tar/file.txt",
  payload: Buffer.from("file contents"),
}
```

Payload is assumed to be a `Buffer` object. If `path` is not defined, the entry is ignored.

Returned is a tar archive which can then be compressed using [Lzma](https://flows.nodered.org/node/@ecraneworldwide/node-red-contrib-lz4)
  or [Gzip](https://flowhub.org/f/bd55b01d4cf1db22).

### Artifacts

- [Flow maintaining this code](https://flowhub.org/f/cd8ee0cc76ab3339)
- [GitHub repo](https://github.com/gorenje/node-red-contrib-tarball)
- [NPMjs package](https://www.npmjs.com/package/@gregoriusrippenstein/node-red-contrib-tarball)
- [Node-RED package page](https://flows.nodered.org/node/@gregoriusrippenstein/node-red-contrib-tarball)

