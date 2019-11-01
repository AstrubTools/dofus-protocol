const stream = require('stream')

/** Simplified version of split() on npm. */
const split = new stream.Transform({
  /**
   * @param {Buffer | string} chunk is the data from the Readable Stream.
   * @param {string} encoding is the file encoding, but isn't used here.
   * @param {() => void} next is a callback function called when you finish working
   *   with this chunk.
   */
  transform (chunk, encoding, next) {
    /* this.soFar represents the current line so far.
     * First, this.soFar is replaced with "" if it is null or undefined.
     *   This happens with the first chunk and if Array.pop() is called
     *   on an empty array.
     * Next, the soFar string is combined with the string provided by
     *   the stream ("chunk"). .toString() converts buffers to strings.
     * Finally, the string is split at the newline character defined
     *   by the \r?\n RegEx. This RegEx translates to either
     *   "\r\n" or "\n", which are the two end of line characters used by
     *   Windows and Unix respectively. */
    const lines = ((this.soFar != null ? this.soFar : '') + chunk.toString()).split(/\r?\0/)

    /* The last element of the array, aka data after the last complete line, 
     *   is removed with Array.pop() and stored in this.soFar for future */
    this.soFar = lines.pop()

    /* Each complete line is sent as a seperate push. If no line is 
     *   completed, this.push isn't called so nothing is outputted that time. */
    for (var line of lines) { this.push(line) }

    /* next() indicates that operations on this chunk are done. */
    next()
  },

  /**
   * If the file does not end in a newline, flush will output the
   * remaining this.soFar data from the last line.
   */
  flush (done) {
    /* Like the previous instance, this.soFar is
     *   replaced with "" if it is null or undefined.
     * Then, it is pushed out. */
    this.push(this.soFar != null ? this.soFar : '')

    /* done() indicates that operations are done. */
    done()
  }
})

module.exports = split
