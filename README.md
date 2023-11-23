# Tarball

Create and extract tar archive files.

## Usage

This node can extract and create tar files, it does this depending on the `msg.payload`:

- if the payload is an array, assume that a tarball should be created
- if the payload is an `object` then assume the payload is a `Buffer` to be extracted

**Extraction**

Extraction generates a message per file found and a final message with `complete = true` is sent once the file has been completely extracted. The payload of the final complete message is an array of all files extracted.

This behaviour allows this node to be connected to a join node in manual mode.


<p><b>Extraction</b>

<p>
  Extraction assumes that the msg.payload is an ArrayBuffer with
  the contents of the tarball. Either encoded in xz format or
  gzip format.

<p>
  A message is generated as each file is extracted. All data is encoded
  in a <code>Buffer</code> object as it is not possible to distinguish between
  binary content and text content. The message has a <code>path</code> attribute 
  for the file name and <code>payload</code> contains the buffer with the files
  contents.

<p>
  Once all files have been extracted, one file message is sent that
  contains <code>complete</code> set to true and <code>payload</code> being an array containing
  all files that were extracted. Each file is represented by a hash
  object: 
<p>
  <code>
  {<br>
    path: "full path of file",<br>
    payload: Buffer.from("object containing file contents in Buffer form")<br>
  }<br>
  </code>



**Compression**

<p>
  For compression, <code>msg.payload</code> is assumed to be an array containing
  objects of the form:

<p>
  <code>
  {<br>
    path: "full/path/in/tar/file.txt",<br>
    payload: Buffer.from("file contents"),<br>
  }<br>
  </code>
<p>
  Payload is assumed to be a <code>Buffer</code> object. If <code>path</code> is not defined, the
  entry is ignored.

<p>
  Returned is a tar archive which can then be compressed using 
  <a href="https://flows.nodered.org/node/@ecraneworldwide/node-red-contrib-lz4" target="_blank">Lzma</a>
  or <a href="https://flows.nodered.org/node/node-red-contrib-gzip" target="_blank">Gzip</a>.
  

### Artifacts

- [Flow maintaining this code](https://flowhub.org/f/cd8ee0cc76ab3339)
- [GitHub repo](https://github.com/gorenje/node-red-contrib-tarball)
- [NPMjs package](https://www.npmjs.com/package/@gregoriusrippenstein/node-red-contrib-tarball)
- [Node-RED package page](https://flows.nodered.org/node/@gregoriusrippenstein/node-red-contrib-tarball)

