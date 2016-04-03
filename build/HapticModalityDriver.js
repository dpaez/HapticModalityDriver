!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.HapticModalityDriver=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * Module dependencies
 */

var inherits = _dereq_( 'inherits' );
var Hammer = _dereq_( 'hammerjs' );
var ModalityDriverChannel = _dereq_( '../gyes/build/gyes' ).ModalityDriver;

/**
 * Module exports
 */

module.exports = HapticModalityDriver;

/**
 * Module contructor
 */

function HapticModalityDriver( opts ){
  opts = opts || {};
  opts.element = opts.element || document.body;
  opts.hapticEvents = opts.hapticEvents || [ 'hold', 'tap', 'doubletap', 'drag',
  'dragstart', 'dragend', 'dragup', 'dragdown', 'dragleft', 'dragright',
  'swipe', 'swipeup', 'swipedown', 'swipeleft', 'swiperight', 'transform',
  'transformstart', 'transformend', 'rotate', 'pinch', 'pinchin', 'pinchout',
  'touch', 'release' ];

  // input
  this.gesture = Hammer( opts.element, {gesture:true} );

  this.gesture.on( opts.hapticEvents.join(' '), this.newEvent.bind(this) );

  // some kind of module name
  this.id = 'WEBHAPTIC';

  // output
  this.vibrate = navigator.vibrate.bind(navigator) ||
        navigator.webkitVibrate.bind(navigator) ||
        navigator.mozVibrate.bind(navigator) ||
        navigator.msVibrate.bind(navigator);

  if ( this.vibrate ){
    this.on( 'synthetized', this.fission.bind(this) );
  }
}

inherits( HapticModalityDriver, ModalityDriverChannel );

HapticModalityDriver.prototype.fission = function( time ){
  time = time || 1000;
  var pattern = [100,30,100];
  pattern.push( time );
  console.log( 'HapticMD::onFission ', time );
  this.vibrate( pattern );
};

HapticModalityDriver.prototype.newEvent = function( data ){
  // Modality Driver Developer could add more functionality/parsing here.
  //console.log( 'HapticMD::onSignal ', data );
  var gesture = {};
  gesture.name = data.type || '';
  gesture.data = data.gesture || {};
  this.fire( 'recognized', {'gesture':data.type} );
};

},{"../gyes/build/gyes":9,"hammerjs":4,"inherits":6}],2:[function(_dereq_,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(_dereq_,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')
var isArray = _dereq_('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":2,"ieee754":5,"is-array":7}],4:[function(_dereq_,module,exports){
/*! Hammer.JS - v1.1.3 - 2014-05-20
 * http://eightmedia.github.io/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
  'use strict';

/**
 * @main
 * @module hammer
 *
 * @class Hammer
 * @static
 */

/**
 * Hammer, use this to create instances
 * ````
 * var hammertime = new Hammer(myElement);
 * ````
 *
 * @method Hammer
 * @param {HTMLElement} element
 * @param {Object} [options={}]
 * @return {Hammer.Instance}
 */
var Hammer = function Hammer(element, options) {
    return new Hammer.Instance(element, options || {});
};

/**
 * version, as defined in package.json
 * the value will be set at each build
 * @property VERSION
 * @final
 * @type {String}
 */
Hammer.VERSION = '1.1.3';

/**
 * default settings.
 * more settings are defined per gesture at `/gestures`. Each gesture can be disabled/enabled
 * by setting it's name (like `swipe`) to false.
 * You can set the defaults for all instances by changing this object before creating an instance.
 * @example
 * ````
 *  Hammer.defaults.drag = false;
 *  Hammer.defaults.behavior.touchAction = 'pan-y';
 *  delete Hammer.defaults.behavior.userSelect;
 * ````
 * @property defaults
 * @type {Object}
 */
Hammer.defaults = {
    /**
     * this setting object adds styles and attributes to the element to prevent the browser from doing
     * its native behavior. The css properties are auto prefixed for the browsers when needed.
     * @property defaults.behavior
     * @type {Object}
     */
    behavior: {
        /**
         * Disables text selection to improve the dragging gesture. When the value is `none` it also sets
         * `onselectstart=false` for IE on the element. Mainly for desktop browsers.
         * @property defaults.behavior.userSelect
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Specifies whether and how a given region can be manipulated by the user (for instance, by panning or zooming).
         * Used by Chrome 35> and IE10>. By default this makes the element blocking any touch event.
         * @property defaults.behavior.touchAction
         * @type {String}
         * @default: 'pan-y'
         */
        touchAction: 'pan-y',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @property defaults.behavior.touchCallout
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @property defaults.behavior.contentZooming
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents.
         * Mainly for desktop browsers.
         * @property defaults.behavior.userDrag
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in Safari on iPhone. This property obeys the alpha value, if specified.
         *
         * If you don't specify an alpha value, Safari on iPhone applies a default alpha value
         * to the color. To disable tap highlighting, set the alpha value to 0 (invisible).
         * If you set the alpha value to 1.0 (opaque), the element is not visible when tapped.
         * @property defaults.behavior.tapHighlightColor
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

/**
 * hammer document where the base events are added at
 * @property DOCUMENT
 * @type {HTMLElement}
 * @default window.document
 */
Hammer.DOCUMENT = document;

/**
 * detect support for pointer events
 * @property HAS_POINTEREVENTS
 * @type {Boolean}
 */
Hammer.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;

/**
 * detect support for touch events
 * @property HAS_TOUCHEVENTS
 * @type {Boolean}
 */
Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);

/**
 * detect mobile browsers
 * @property IS_MOBILE
 * @type {Boolean}
 */
Hammer.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);

/**
 * detect if we want to support mouseevents at all
 * @property NO_MOUSEEVENTS
 * @type {Boolean}
 */
Hammer.NO_MOUSEEVENTS = (Hammer.HAS_TOUCHEVENTS && Hammer.IS_MOBILE) || Hammer.HAS_POINTEREVENTS;

/**
 * interval in which Hammer recalculates current velocity/direction/angle in ms
 * @property CALCULATE_INTERVAL
 * @type {Number}
 * @default 25
 */
Hammer.CALCULATE_INTERVAL = 25;

/**
 * eventtypes per touchevent (start, move, end) are filled by `Event.determineEventTypes` on `setup`
 * the object contains the DOM event names per type (`EVENT_START`, `EVENT_MOVE`, `EVENT_END`)
 * @property EVENT_TYPES
 * @private
 * @writeOnce
 * @type {Object}
 */
var EVENT_TYPES = {};

/**
 * direction strings, for safe comparisons
 * @property DIRECTION_DOWN|LEFT|UP|RIGHT
 * @final
 * @type {String}
 * @default 'down' 'left' 'up' 'right'
 */
var DIRECTION_DOWN = Hammer.DIRECTION_DOWN = 'down';
var DIRECTION_LEFT = Hammer.DIRECTION_LEFT = 'left';
var DIRECTION_UP = Hammer.DIRECTION_UP = 'up';
var DIRECTION_RIGHT = Hammer.DIRECTION_RIGHT = 'right';

/**
 * pointertype strings, for safe comparisons
 * @property POINTER_MOUSE|TOUCH|PEN
 * @final
 * @type {String}
 * @default 'mouse' 'touch' 'pen'
 */
var POINTER_MOUSE = Hammer.POINTER_MOUSE = 'mouse';
var POINTER_TOUCH = Hammer.POINTER_TOUCH = 'touch';
var POINTER_PEN = Hammer.POINTER_PEN = 'pen';

/**
 * eventtypes
 * @property EVENT_START|MOVE|END|RELEASE|TOUCH
 * @final
 * @type {String}
 * @default 'start' 'change' 'move' 'end' 'release' 'touch'
 */
var EVENT_START = Hammer.EVENT_START = 'start';
var EVENT_MOVE = Hammer.EVENT_MOVE = 'move';
var EVENT_END = Hammer.EVENT_END = 'end';
var EVENT_RELEASE = Hammer.EVENT_RELEASE = 'release';
var EVENT_TOUCH = Hammer.EVENT_TOUCH = 'touch';

/**
 * if the window events are set...
 * @property READY
 * @writeOnce
 * @type {Boolean}
 * @default false
 */
Hammer.READY = false;

/**
 * plugins namespace
 * @property plugins
 * @type {Object}
 */
Hammer.plugins = Hammer.plugins || {};

/**
 * gestures namespace
 * see `/gestures` for the definitions
 * @property gestures
 * @type {Object}
 */
Hammer.gestures = Hammer.gestures || {};

/**
 * setup events to detect gestures on the document
 * this function is called when creating an new instance
 * @private
 */
function setup() {
    if(Hammer.READY) {
        return;
    }

    // find what eventtypes we add listeners to
    Event.determineEventTypes();

    // Register all gestures inside Hammer.gestures
    Utils.each(Hammer.gestures, function(gesture) {
        Detection.register(gesture);
    });

    // Add touch events on the document
    Event.onTouch(Hammer.DOCUMENT, EVENT_MOVE, Detection.detect);
    Event.onTouch(Hammer.DOCUMENT, EVENT_END, Detection.detect);

    // Hammer is ready...!
    Hammer.READY = true;
}

/**
 * @module hammer
 *
 * @class Utils
 * @static
 */
var Utils = Hammer.utils = {
    /**
     * extend method, could also be used for cloning when `dest` is an empty object.
     * changes the dest object
     * @method extend
     * @param {Object} dest
     * @param {Object} src
     * @param {Boolean} [merge=false]  do a merge
     * @return {Object} dest
     */
    extend: function extend(dest, src, merge) {
        for(var key in src) {
            if(!src.hasOwnProperty(key) || (dest[key] !== undefined && merge)) {
                continue;
            }
            dest[key] = src[key];
        }
        return dest;
    },

    /**
     * simple addEventListener wrapper
     * @method on
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     */
    on: function on(element, type, handler) {
        element.addEventListener(type, handler, false);
    },

    /**
     * simple removeEventListener wrapper
     * @method off
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     */
    off: function off(element, type, handler) {
        element.removeEventListener(type, handler, false);
    },

    /**
     * forEach over arrays and objects
     * @method each
     * @param {Object|Array} obj
     * @param {Function} iterator
     * @param {any} iterator.item
     * @param {Number} iterator.index
     * @param {Object|Array} iterator.obj the source object
     * @param {Object} context value to use as `this` in the iterator
     */
    each: function each(obj, iterator, context) {
        var i, len;

        // native forEach on arrays
        if('forEach' in obj) {
            obj.forEach(iterator, context);
        // arrays
        } else if(obj.length !== undefined) {
            for(i = 0, len = obj.length; i < len; i++) {
                if(iterator.call(context, obj[i], i, obj) === false) {
                    return;
                }
            }
        // objects
        } else {
            for(i in obj) {
                if(obj.hasOwnProperty(i) &&
                    iterator.call(context, obj[i], i, obj) === false) {
                    return;
                }
            }
        }
    },

    /**
     * find if a string contains the string using indexOf
     * @method inStr
     * @param {String} src
     * @param {String} find
     * @return {Boolean} found
     */
    inStr: function inStr(src, find) {
        return src.indexOf(find) > -1;
    },

    /**
     * find if a array contains the object using indexOf or a simple polyfill
     * @method inArray
     * @param {String} src
     * @param {String} find
     * @return {Boolean|Number} false when not found, or the index
     */
    inArray: function inArray(src, find) {
        if(src.indexOf) {
            var index = src.indexOf(find);
            return (index === -1) ? false : index;
        } else {
            for(var i = 0, len = src.length; i < len; i++) {
                if(src[i] === find) {
                    return i;
                }
            }
            return false;
        }
    },

    /**
     * convert an array-like object (`arguments`, `touchlist`) to an array
     * @method toArray
     * @param {Object} obj
     * @return {Array}
     */
    toArray: function toArray(obj) {
        return Array.prototype.slice.call(obj, 0);
    },

    /**
     * find if a node is in the given parent
     * @method hasParent
     * @param {HTMLElement} node
     * @param {HTMLElement} parent
     * @return {Boolean} found
     */
    hasParent: function hasParent(node, parent) {
        while(node) {
            if(node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    },

    /**
     * get the center of all the touches
     * @method getCenter
     * @param {Array} touches
     * @return {Object} center contains `pageX`, `pageY`, `clientX` and `clientY` properties
     */
    getCenter: function getCenter(touches) {
        var pageX = [],
            pageY = [],
            clientX = [],
            clientY = [],
            min = Math.min,
            max = Math.max;

        // no need to loop when only one touch
        if(touches.length === 1) {
            return {
                pageX: touches[0].pageX,
                pageY: touches[0].pageY,
                clientX: touches[0].clientX,
                clientY: touches[0].clientY
            };
        }

        Utils.each(touches, function(touch) {
            pageX.push(touch.pageX);
            pageY.push(touch.pageY);
            clientX.push(touch.clientX);
            clientY.push(touch.clientY);
        });

        return {
            pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
            pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
            clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
            clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
        };
    },

    /**
     * calculate the velocity between two points. unit is in px per ms.
     * @method getVelocity
     * @param {Number} deltaTime
     * @param {Number} deltaX
     * @param {Number} deltaY
     * @return {Object} velocity `x` and `y`
     */
    getVelocity: function getVelocity(deltaTime, deltaX, deltaY) {
        return {
            x: Math.abs(deltaX / deltaTime) || 0,
            y: Math.abs(deltaY / deltaTime) || 0
        };
    },

    /**
     * calculate the angle between two coordinates
     * @method getAngle
     * @param {Touch} touch1
     * @param {Touch} touch2
     * @return {Number} angle
     */
    getAngle: function getAngle(touch1, touch2) {
        var x = touch2.clientX - touch1.clientX,
            y = touch2.clientY - touch1.clientY;

        return Math.atan2(y, x) * 180 / Math.PI;
    },

    /**
     * do a small comparision to get the direction between two touches.
     * @method getDirection
     * @param {Touch} touch1
     * @param {Touch} touch2
     * @return {String} direction matches `DIRECTION_LEFT|RIGHT|UP|DOWN`
     */
    getDirection: function getDirection(touch1, touch2) {
        var x = Math.abs(touch1.clientX - touch2.clientX),
            y = Math.abs(touch1.clientY - touch2.clientY);

        if(x >= y) {
            return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }
        return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
    },

    /**
     * calculate the distance between two touches
     * @method getDistance
     * @param {Touch}touch1
     * @param {Touch} touch2
     * @return {Number} distance
     */
    getDistance: function getDistance(touch1, touch2) {
        var x = touch2.clientX - touch1.clientX,
            y = touch2.clientY - touch1.clientY;

        return Math.sqrt((x * x) + (y * y));
    },

    /**
     * calculate the scale factor between two touchLists
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @method getScale
     * @param {Array} start array of touches
     * @param {Array} end array of touches
     * @return {Number} scale
     */
    getScale: function getScale(start, end) {
        // need two fingers...
        if(start.length >= 2 && end.length >= 2) {
            return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
        }
        return 1;
    },

    /**
     * calculate the rotation degrees between two touchLists
     * @method getRotation
     * @param {Array} start array of touches
     * @param {Array} end array of touches
     * @return {Number} rotation
     */
    getRotation: function getRotation(start, end) {
        // need two fingers
        if(start.length >= 2 && end.length >= 2) {
            return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
        }
        return 0;
    },

    /**
     * find out if the direction is vertical   *
     * @method isVertical
     * @param {String} direction matches `DIRECTION_UP|DOWN`
     * @return {Boolean} is_vertical
     */
    isVertical: function isVertical(direction) {
        return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
    },

    /**
     * set css properties with their prefixes
     * @param {HTMLElement} element
     * @param {String} prop
     * @param {String} value
     * @param {Boolean} [toggle=true]
     * @return {Boolean}
     */
    setPrefixedCss: function setPrefixedCss(element, prop, value, toggle) {
        var prefixes = ['', 'Webkit', 'Moz', 'O', 'ms'];
        prop = Utils.toCamelCase(prop);

        for(var i = 0; i < prefixes.length; i++) {
            var p = prop;
            // prefixes
            if(prefixes[i]) {
                p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
            }

            // test the style
            if(p in element.style) {
                element.style[p] = (toggle == null || toggle) && value || '';
                break;
            }
        }
    },

    /**
     * toggle browser default behavior by setting css properties.
     * `userSelect='none'` also sets `element.onselectstart` to false
     * `userDrag='none'` also sets `element.ondragstart` to false
     *
     * @method toggleBehavior
     * @param {HtmlElement} element
     * @param {Object} props
     * @param {Boolean} [toggle=true]
     */
    toggleBehavior: function toggleBehavior(element, props, toggle) {
        if(!props || !element || !element.style) {
            return;
        }

        // set the css properties
        Utils.each(props, function(value, prop) {
            Utils.setPrefixedCss(element, prop, value, toggle);
        });

        var falseFn = toggle && function() {
            return false;
        };

        // also the disable onselectstart
        if(props.userSelect == 'none') {
            element.onselectstart = falseFn;
        }
        // and disable ondragstart
        if(props.userDrag == 'none') {
            element.ondragstart = falseFn;
        }
    },

    /**
     * convert a string with underscores to camelCase
     * so prevent_default becomes preventDefault
     * @param {String} str
     * @return {String} camelCaseStr
     */
    toCamelCase: function toCamelCase(str) {
        return str.replace(/[_-]([a-z])/g, function(s) {
            return s[1].toUpperCase();
        });
    }
};


/**
 * @module hammer
 */
/**
 * @class Event
 * @static
 */
var Event = Hammer.event = {
    /**
     * when touch events have been fired, this is true
     * this is used to stop mouse events
     * @property prevent_mouseevents
     * @private
     * @type {Boolean}
     */
    preventMouseEvents: false,

    /**
     * if EVENT_START has been fired
     * @property started
     * @private
     * @type {Boolean}
     */
    started: false,

    /**
     * when the mouse is hold down, this is true
     * @property should_detect
     * @private
     * @type {Boolean}
     */
    shouldDetect: false,

    /**
     * simple event binder with a hook and support for multiple types
     * @method on
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     * @param {Function} [hook]
     * @param {Object} hook.type
     */
    on: function on(element, type, handler, hook) {
        var types = type.split(' ');
        Utils.each(types, function(type) {
            Utils.on(element, type, handler);
            hook && hook(type);
        });
    },

    /**
     * simple event unbinder with a hook and support for multiple types
     * @method off
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     * @param {Function} [hook]
     * @param {Object} hook.type
     */
    off: function off(element, type, handler, hook) {
        var types = type.split(' ');
        Utils.each(types, function(type) {
            Utils.off(element, type, handler);
            hook && hook(type);
        });
    },

    /**
     * the core touch event handler.
     * this finds out if we should to detect gestures
     * @method onTouch
     * @param {HTMLElement} element
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {Function} handler
     * @return onTouchHandler {Function} the core event handler
     */
    onTouch: function onTouch(element, eventType, handler) {
        var self = this;

        var onTouchHandler = function onTouchHandler(ev) {
            var srcType = ev.type.toLowerCase(),
                isPointer = Hammer.HAS_POINTEREVENTS,
                isMouse = Utils.inStr(srcType, 'mouse'),
                triggerType;

            // if we are in a mouseevent, but there has been a touchevent triggered in this session
            // we want to do nothing. simply break out of the event.
            if(isMouse && self.preventMouseEvents) {
                return;

            // mousebutton must be down
            } else if(isMouse && eventType == EVENT_START && ev.button === 0) {
                self.preventMouseEvents = false;
                self.shouldDetect = true;
            } else if(isPointer && eventType == EVENT_START) {
                self.shouldDetect = (ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev));
            // just a valid start event, but no mouse
            } else if(!isMouse && eventType == EVENT_START) {
                self.preventMouseEvents = true;
                self.shouldDetect = true;
            }

            // update the pointer event before entering the detection
            if(isPointer && eventType != EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
            }

            // we are in a touch/down state, so allowed detection of gestures
            if(self.shouldDetect) {
                triggerType = self.doDetect.call(self, ev, eventType, element, handler);
            }

            // ...and we are done with the detection
            // so reset everything to start each detection totally fresh
            if(triggerType == EVENT_END) {
                self.preventMouseEvents = false;
                self.shouldDetect = false;
                PointerEvent.reset();
            // update the pointerevent object after the detection
            }

            if(isPointer && eventType == EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
            }
        };

        this.on(element, EVENT_TYPES[eventType], onTouchHandler);
        return onTouchHandler;
    },

    /**
     * the core detection method
     * this finds out what hammer-touch-events to trigger
     * @method doDetect
     * @param {Object} ev
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {HTMLElement} element
     * @param {Function} handler
     * @return {String} triggerType matches `EVENT_START|MOVE|END`
     */
    doDetect: function doDetect(ev, eventType, element, handler) {
        var touchList = this.getTouchList(ev, eventType);
        var touchListLength = touchList.length;
        var triggerType = eventType;
        var triggerChange = touchList.trigger; // used by fakeMultitouch plugin
        var changedLength = touchListLength;

        // at each touchstart-like event we want also want to trigger a TOUCH event...
        if(eventType == EVENT_START) {
            triggerChange = EVENT_TOUCH;
        // ...the same for a touchend-like event
        } else if(eventType == EVENT_END) {
            triggerChange = EVENT_RELEASE;

            // keep track of how many touches have been removed
            changedLength = touchList.length - ((ev.changedTouches) ? ev.changedTouches.length : 1);
        }

        // after there are still touches on the screen,
        // we just want to trigger a MOVE event. so change the START or END to a MOVE
        // but only after detection has been started, the first time we actualy want a START
        if(changedLength > 0 && this.started) {
            triggerType = EVENT_MOVE;
        }

        // detection has been started, we keep track of this, see above
        this.started = true;

        // generate some event data, some basic information
        var evData = this.collectEventData(element, triggerType, touchList, ev);

        // trigger the triggerType event before the change (TOUCH, RELEASE) events
        // but the END event should be at last
        if(eventType != EVENT_END) {
            handler.call(Detection, evData);
        }

        // trigger a change (TOUCH, RELEASE) event, this means the length of the touches changed
        if(triggerChange) {
            evData.changedLength = changedLength;
            evData.eventType = triggerChange;

            handler.call(Detection, evData);

            evData.eventType = triggerType;
            delete evData.changedLength;
        }

        // trigger the END event
        if(triggerType == EVENT_END) {
            handler.call(Detection, evData);

            // ...and we are done with the detection
            // so reset everything to start each detection totally fresh
            this.started = false;
        }

        return triggerType;
    },

    /**
     * we have different events for each device/browser
     * determine what we need and set them in the EVENT_TYPES constant
     * the `onTouch` method is bind to these properties.
     * @method determineEventTypes
     * @return {Object} events
     */
    determineEventTypes: function determineEventTypes() {
        var types;
        if(Hammer.HAS_POINTEREVENTS) {
            if(window.PointerEvent) {
                types = [
                    'pointerdown',
                    'pointermove',
                    'pointerup pointercancel lostpointercapture'
                ];
            } else {
                types = [
                    'MSPointerDown',
                    'MSPointerMove',
                    'MSPointerUp MSPointerCancel MSLostPointerCapture'
                ];
            }
        } else if(Hammer.NO_MOUSEEVENTS) {
            types = [
                'touchstart',
                'touchmove',
                'touchend touchcancel'
            ];
        } else {
            types = [
                'touchstart mousedown',
                'touchmove mousemove',
                'touchend touchcancel mouseup'
            ];
        }

        EVENT_TYPES[EVENT_START] = types[0];
        EVENT_TYPES[EVENT_MOVE] = types[1];
        EVENT_TYPES[EVENT_END] = types[2];
        return EVENT_TYPES;
    },

    /**
     * create touchList depending on the event
     * @method getTouchList
     * @param {Object} ev
     * @param {String} eventType
     * @return {Array} touches
     */
    getTouchList: function getTouchList(ev, eventType) {
        // get the fake pointerEvent touchlist
        if(Hammer.HAS_POINTEREVENTS) {
            return PointerEvent.getTouchList();
        }

        // get the touchlist
        if(ev.touches) {
            if(eventType == EVENT_MOVE) {
                return ev.touches;
            }

            var identifiers = [];
            var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
            var touchList = [];

            Utils.each(concat, function(touch) {
                if(Utils.inArray(identifiers, touch.identifier) === false) {
                    touchList.push(touch);
                }
                identifiers.push(touch.identifier);
            });

            return touchList;
        }

        // make fake touchList from mouse position
        ev.identifier = 1;
        return [ev];
    },

    /**
     * collect basic event data
     * @method collectEventData
     * @param {HTMLElement} element
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {Array} touches
     * @param {Object} ev
     * @return {Object} ev
     */
    collectEventData: function collectEventData(element, eventType, touches, ev) {
        // find out pointerType
        var pointerType = POINTER_TOUCH;
        if(Utils.inStr(ev.type, 'mouse') || PointerEvent.matchType(POINTER_MOUSE, ev)) {
            pointerType = POINTER_MOUSE;
        } else if(PointerEvent.matchType(POINTER_PEN, ev)) {
            pointerType = POINTER_PEN;
        }

        return {
            center: Utils.getCenter(touches),
            timeStamp: Date.now(),
            target: ev.target,
            touches: touches,
            eventType: eventType,
            pointerType: pointerType,
            srcEvent: ev,

            /**
             * prevent the browser default actions
             * mostly used to disable scrolling of the browser
             */
            preventDefault: function() {
                var srcEvent = this.srcEvent;
                srcEvent.preventManipulation && srcEvent.preventManipulation();
                srcEvent.preventDefault && srcEvent.preventDefault();
            },

            /**
             * stop bubbling the event up to its parents
             */
            stopPropagation: function() {
                this.srcEvent.stopPropagation();
            },

            /**
             * immediately stop gesture detection
             * might be useful after a swipe was detected
             * @return {*}
             */
            stopDetect: function() {
                return Detection.stopDetect();
            }
        };
    }
};


/**
 * @module hammer
 *
 * @class PointerEvent
 * @static
 */
var PointerEvent = Hammer.PointerEvent = {
    /**
     * holds all pointers, by `identifier`
     * @property pointers
     * @type {Object}
     */
    pointers: {},

    /**
     * get the pointers as an array
     * @method getTouchList
     * @return {Array} touchlist
     */
    getTouchList: function getTouchList() {
        var touchlist = [];
        // we can use forEach since pointerEvents only is in IE10
        Utils.each(this.pointers, function(pointer) {
            touchlist.push(pointer);
        });
        return touchlist;
    },

    /**
     * update the position of a pointer
     * @method updatePointer
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {Object} pointerEvent
     */
    updatePointer: function updatePointer(eventType, pointerEvent) {
        if(eventType == EVENT_END || (eventType != EVENT_END && pointerEvent.buttons !== 1)) {
            delete this.pointers[pointerEvent.pointerId];
        } else {
            pointerEvent.identifier = pointerEvent.pointerId;
            this.pointers[pointerEvent.pointerId] = pointerEvent;
        }
    },

    /**
     * check if ev matches pointertype
     * @method matchType
     * @param {String} pointerType matches `POINTER_MOUSE|TOUCH|PEN`
     * @param {PointerEvent} ev
     */
    matchType: function matchType(pointerType, ev) {
        if(!ev.pointerType) {
            return false;
        }

        var pt = ev.pointerType,
            types = {};

        types[POINTER_MOUSE] = (pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE));
        types[POINTER_TOUCH] = (pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH));
        types[POINTER_PEN] = (pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN));
        return types[pointerType];
    },

    /**
     * reset the stored pointers
     * @method reset
     */
    reset: function resetList() {
        this.pointers = {};
    }
};


/**
 * @module hammer
 *
 * @class Detection
 * @static
 */
var Detection = Hammer.detection = {
    // contains all registred Hammer.gestures in the correct order
    gestures: [],

    // data of the current Hammer.gesture detection session
    current: null,

    // the previous Hammer.gesture session data
    // is a full clone of the previous gesture.current object
    previous: null,

    // when this becomes true, no gestures are fired
    stopped: false,

    /**
     * start Hammer.gesture detection
     * @method startDetect
     * @param {Hammer.Instance} inst
     * @param {Object} eventData
     */
    startDetect: function startDetect(inst, eventData) {
        // already busy with a Hammer.gesture detection on an element
        if(this.current) {
            return;
        }

        this.stopped = false;

        // holds current session
        this.current = {
            inst: inst, // reference to HammerInstance we're working for
            startEvent: Utils.extend({}, eventData), // start eventData for distances, timing etc
            lastEvent: false, // last eventData
            lastCalcEvent: false, // last eventData for calculations.
            futureCalcEvent: false, // last eventData for calculations.
            lastCalcData: {}, // last lastCalcData
            name: '' // current gesture we're in/detected, can be 'tap', 'hold' etc
        };

        this.detect(eventData);
    },

    /**
     * Hammer.gesture detection
     * @method detect
     * @param {Object} eventData
     * @return {any}
     */
    detect: function detect(eventData) {
        if(!this.current || this.stopped) {
            return;
        }

        // extend event data with calculations about scale, distance etc
        eventData = this.extendEventData(eventData);

        // hammer instance and instance options
        var inst = this.current.inst,
            instOptions = inst.options;

        // call Hammer.gesture handlers
        Utils.each(this.gestures, function triggerGesture(gesture) {
            // only when the instance options have enabled this gesture
            if(!this.stopped && inst.enabled && instOptions[gesture.name]) {
                gesture.handler.call(gesture, eventData, inst);
            }
        }, this);

        // store as previous event event
        if(this.current) {
            this.current.lastEvent = eventData;
        }

        if(eventData.eventType == EVENT_END) {
            this.stopDetect();
        }

        return eventData;
    },

    /**
     * clear the Hammer.gesture vars
     * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
     * to stop other Hammer.gestures from being fired
     * @method stopDetect
     */
    stopDetect: function stopDetect() {
        // clone current data to the store as the previous gesture
        // used for the double tap gesture, since this is an other gesture detect session
        this.previous = Utils.extend({}, this.current);

        // reset the current
        this.current = null;
        this.stopped = true;
    },

    /**
     * calculate velocity, angle and direction
     * @method getVelocityData
     * @param {Object} ev
     * @param {Object} center
     * @param {Number} deltaTime
     * @param {Number} deltaX
     * @param {Number} deltaY
     */
    getCalculatedData: function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
        var cur = this.current,
            recalc = false,
            calcEv = cur.lastCalcEvent,
            calcData = cur.lastCalcData;

        if(calcEv && ev.timeStamp - calcEv.timeStamp > Hammer.CALCULATE_INTERVAL) {
            center = calcEv.center;
            deltaTime = ev.timeStamp - calcEv.timeStamp;
            deltaX = ev.center.clientX - calcEv.center.clientX;
            deltaY = ev.center.clientY - calcEv.center.clientY;
            recalc = true;
        }

        if(ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
            cur.futureCalcEvent = ev;
        }

        if(!cur.lastCalcEvent || recalc) {
            calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
            calcData.angle = Utils.getAngle(center, ev.center);
            calcData.direction = Utils.getDirection(center, ev.center);

            cur.lastCalcEvent = cur.futureCalcEvent || ev;
            cur.futureCalcEvent = ev;
        }

        ev.velocityX = calcData.velocity.x;
        ev.velocityY = calcData.velocity.y;
        ev.interimAngle = calcData.angle;
        ev.interimDirection = calcData.direction;
    },

    /**
     * extend eventData for Hammer.gestures
     * @method extendEventData
     * @param {Object} ev
     * @return {Object} ev
     */
    extendEventData: function extendEventData(ev) {
        var cur = this.current,
            startEv = cur.startEvent,
            lastEv = cur.lastEvent || startEv;

        // update the start touchlist to calculate the scale/rotation
        if(ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
            startEv.touches = [];
            Utils.each(ev.touches, function(touch) {
                startEv.touches.push({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
        }

        var deltaTime = ev.timeStamp - startEv.timeStamp,
            deltaX = ev.center.clientX - startEv.center.clientX,
            deltaY = ev.center.clientY - startEv.center.clientY;

        this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);

        Utils.extend(ev, {
            startEvent: startEv,

            deltaTime: deltaTime,
            deltaX: deltaX,
            deltaY: deltaY,

            distance: Utils.getDistance(startEv.center, ev.center),
            angle: Utils.getAngle(startEv.center, ev.center),
            direction: Utils.getDirection(startEv.center, ev.center),
            scale: Utils.getScale(startEv.touches, ev.touches),
            rotation: Utils.getRotation(startEv.touches, ev.touches)
        });

        return ev;
    },

    /**
     * register new gesture
     * @method register
     * @param {Object} gesture object, see `gestures/` for documentation
     * @return {Array} gestures
     */
    register: function register(gesture) {
        // add an enable gesture options if there is no given
        var options = gesture.defaults || {};
        if(options[gesture.name] === undefined) {
            options[gesture.name] = true;
        }

        // extend Hammer default options with the Hammer.gesture options
        Utils.extend(Hammer.defaults, options, true);

        // set its index
        gesture.index = gesture.index || 1000;

        // add Hammer.gesture to the list
        this.gestures.push(gesture);

        // sort the list by index
        this.gestures.sort(function(a, b) {
            if(a.index < b.index) {
                return -1;
            }
            if(a.index > b.index) {
                return 1;
            }
            return 0;
        });

        return this.gestures;
    }
};


/**
 * @module hammer
 */

/**
 * create new hammer instance
 * all methods should return the instance itself, so it is chainable.
 *
 * @class Instance
 * @constructor
 * @param {HTMLElement} element
 * @param {Object} [options={}] options are merged with `Hammer.defaults`
 * @return {Hammer.Instance}
 */
Hammer.Instance = function(element, options) {
    var self = this;

    // setup HammerJS window events and register all gestures
    // this also sets up the default options
    setup();

    /**
     * @property element
     * @type {HTMLElement}
     */
    this.element = element;

    /**
     * @property enabled
     * @type {Boolean}
     * @protected
     */
    this.enabled = true;

    /**
     * options, merged with the defaults
     * options with an _ are converted to camelCase
     * @property options
     * @type {Object}
     */
    Utils.each(options, function(value, name) {
        delete options[name];
        options[Utils.toCamelCase(name)] = value;
    });

    this.options = Utils.extend(Utils.extend({}, Hammer.defaults), options || {});

    // add some css to the element to prevent the browser from doing its native behavoir
    if(this.options.behavior) {
        Utils.toggleBehavior(this.element, this.options.behavior, true);
    }

    /**
     * event start handler on the element to start the detection
     * @property eventStartHandler
     * @type {Object}
     */
    this.eventStartHandler = Event.onTouch(element, EVENT_START, function(ev) {
        if(self.enabled && ev.eventType == EVENT_START) {
            Detection.startDetect(self, ev);
        } else if(ev.eventType == EVENT_TOUCH) {
            Detection.detect(ev);
        }
    });

    /**
     * keep a list of user event handlers which needs to be removed when calling 'dispose'
     * @property eventHandlers
     * @type {Array}
     */
    this.eventHandlers = [];
};

Hammer.Instance.prototype = {
    /**
     * bind events to the instance
     * @method on
     * @chainable
     * @param {String} gestures multiple gestures by splitting with a space
     * @param {Function} handler
     * @param {Object} handler.ev event object
     */
    on: function onEvent(gestures, handler) {
        var self = this;
        Event.on(self.element, gestures, handler, function(type) {
            self.eventHandlers.push({ gesture: type, handler: handler });
        });
        return self;
    },

    /**
     * unbind events to the instance
     * @method off
     * @chainable
     * @param {String} gestures
     * @param {Function} handler
     */
    off: function offEvent(gestures, handler) {
        var self = this;

        Event.off(self.element, gestures, handler, function(type) {
            var index = Utils.inArray({ gesture: type, handler: handler });
            if(index !== false) {
                self.eventHandlers.splice(index, 1);
            }
        });
        return self;
    },

    /**
     * trigger gesture event
     * @method trigger
     * @chainable
     * @param {String} gesture
     * @param {Object} [eventData]
     */
    trigger: function triggerEvent(gesture, eventData) {
        // optional
        if(!eventData) {
            eventData = {};
        }

        // create DOM event
        var event = Hammer.DOCUMENT.createEvent('Event');
        event.initEvent(gesture, true, true);
        event.gesture = eventData;

        // trigger on the target if it is in the instance element,
        // this is for event delegation tricks
        var element = this.element;
        if(Utils.hasParent(eventData.target, element)) {
            element = eventData.target;
        }

        element.dispatchEvent(event);
        return this;
    },

    /**
     * enable of disable hammer.js detection
     * @method enable
     * @chainable
     * @param {Boolean} state
     */
    enable: function enable(state) {
        this.enabled = state;
        return this;
    },

    /**
     * dispose this hammer instance
     * @method dispose
     * @return {Null}
     */
    dispose: function dispose() {
        var i, eh;

        // undo all changes made by stop_browser_behavior
        Utils.toggleBehavior(this.element, this.options.behavior, false);

        // unbind all custom event handlers
        for(i = -1; (eh = this.eventHandlers[++i]);) {
            Utils.off(this.element, eh.gesture, eh.handler);
        }

        this.eventHandlers = [];

        // unbind the start event listener
        Event.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);

        return null;
    }
};


/**
 * @module gestures
 */
/**
 * Move with x fingers (default 1) around on the page.
 * Preventing the default browser behavior is a good way to improve feel and working.
 * ````
 *  hammertime.on("drag", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Drag
 * @static
 */
/**
 * @event drag
 * @param {Object} ev
 */
/**
 * @event dragstart
 * @param {Object} ev
 */
/**
 * @event dragend
 * @param {Object} ev
 */
/**
 * @event drapleft
 * @param {Object} ev
 */
/**
 * @event dragright
 * @param {Object} ev
 */
/**
 * @event dragup
 * @param {Object} ev
 */
/**
 * @event dragdown
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var triggered = false;

    function dragGesture(ev, inst) {
        var cur = Detection.current;

        // max touches
        if(inst.options.dragMaxTouches > 0 &&
            ev.touches.length > inst.options.dragMaxTouches) {
            return;
        }

        switch(ev.eventType) {
            case EVENT_START:
                triggered = false;
                break;

            case EVENT_MOVE:
                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(ev.distance < inst.options.dragMinDistance &&
                    cur.name != name) {
                    return;
                }

                var startCenter = cur.startEvent.center;

                // we are dragging!
                if(cur.name != name) {
                    cur.name = name;
                    if(inst.options.dragDistanceCorrection && ev.distance > 0) {
                        // When a drag is triggered, set the event center to dragMinDistance pixels from the original event center.
                        // Without this correction, the dragged distance would jumpstart at dragMinDistance pixels instead of at 0.
                        // It might be useful to save the original start point somewhere
                        var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
                        startCenter.pageX += ev.deltaX * factor;
                        startCenter.pageY += ev.deltaY * factor;
                        startCenter.clientX += ev.deltaX * factor;
                        startCenter.clientY += ev.deltaY * factor;

                        // recalculate event data using new start point
                        ev = Detection.extendEventData(ev);
                    }
                }

                // lock drag to axis?
                if(cur.lastEvent.dragLockToAxis ||
                    ( inst.options.dragLockToAxis &&
                        inst.options.dragLockMinDistance <= ev.distance
                        )) {
                    ev.dragLockToAxis = true;
                }

                // keep direction on the axis that the drag gesture started on
                var lastDirection = cur.lastEvent.direction;
                if(ev.dragLockToAxis && lastDirection !== ev.direction) {
                    if(Utils.isVertical(lastDirection)) {
                        ev.direction = (ev.deltaY < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                    } else {
                        ev.direction = (ev.deltaX < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                    }
                }

                // first time, trigger dragstart event
                if(!triggered) {
                    inst.trigger(name + 'start', ev);
                    triggered = true;
                }

                // trigger events
                inst.trigger(name, ev);
                inst.trigger(name + ev.direction, ev);

                var isVertical = Utils.isVertical(ev.direction);

                // block the browser events
                if((inst.options.dragBlockVertical && isVertical) ||
                    (inst.options.dragBlockHorizontal && !isVertical)) {
                    ev.preventDefault();
                }
                break;

            case EVENT_RELEASE:
                if(triggered && ev.changedLength <= inst.options.dragMaxTouches) {
                    inst.trigger(name + 'end', ev);
                    triggered = false;
                }
                break;

            case EVENT_END:
                triggered = false;
                break;
        }
    }

    Hammer.gestures.Drag = {
        name: name,
        index: 50,
        handler: dragGesture,
        defaults: {
            /**
             * minimal movement that have to be made before the drag event gets triggered
             * @property dragMinDistance
             * @type {Number}
             * @default 10
             */
            dragMinDistance: 10,

            /**
             * Set dragDistanceCorrection to true to make the starting point of the drag
             * be calculated from where the drag was triggered, not from where the touch started.
             * Useful to avoid a jerk-starting drag, which can make fine-adjustments
             * through dragging difficult, and be visually unappealing.
             * @property dragDistanceCorrection
             * @type {Boolean}
             * @default true
             */
            dragDistanceCorrection: true,

            /**
             * set 0 for unlimited, but this can conflict with transform
             * @property dragMaxTouches
             * @type {Number}
             * @default 1
             */
            dragMaxTouches: 1,

            /**
             * prevent default browser behavior when dragging occurs
             * be careful with it, it makes the element a blocking element
             * when you are using the drag gesture, it is a good practice to set this true
             * @property dragBlockHorizontal
             * @type {Boolean}
             * @default false
             */
            dragBlockHorizontal: false,

            /**
             * same as `dragBlockHorizontal`, but for vertical movement
             * @property dragBlockVertical
             * @type {Boolean}
             * @default false
             */
            dragBlockVertical: false,

            /**
             * dragLockToAxis keeps the drag gesture on the axis that it started on,
             * It disallows vertical directions if the initial direction was horizontal, and vice versa.
             * @property dragLockToAxis
             * @type {Boolean}
             * @default false
             */
            dragLockToAxis: false,

            /**
             * drag lock only kicks in when distance > dragLockMinDistance
             * This way, locking occurs only when the distance has become large enough to reliably determine the direction
             * @property dragLockMinDistance
             * @type {Number}
             * @default 25
             */
            dragLockMinDistance: 25
        }
    };
})('drag');

/**
 * @module gestures
 */
/**
 * trigger a simple gesture event, so you can do anything in your handler.
 * only usable if you know what your doing...
 *
 * @class Gesture
 * @static
 */
/**
 * @event gesture
 * @param {Object} ev
 */
Hammer.gestures.Gesture = {
    name: 'gesture',
    index: 1337,
    handler: function releaseGesture(ev, inst) {
        inst.trigger(this.name, ev);
    }
};

/**
 * @module gestures
 */
/**
 * Touch stays at the same place for x time
 *
 * @class Hold
 * @static
 */
/**
 * @event hold
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var timer;

    function holdGesture(ev, inst) {
        var options = inst.options,
            current = Detection.current;

        switch(ev.eventType) {
            case EVENT_START:
                clearTimeout(timer);

                // set the gesture so we can check in the timeout if it still is
                current.name = name;

                // set timer and if after the timeout it still is hold,
                // we trigger the hold event
                timer = setTimeout(function() {
                    if(current && current.name == name) {
                        inst.trigger(name, ev);
                    }
                }, options.holdTimeout);
                break;

            case EVENT_MOVE:
                if(ev.distance > options.holdThreshold) {
                    clearTimeout(timer);
                }
                break;

            case EVENT_RELEASE:
                clearTimeout(timer);
                break;
        }
    }

    Hammer.gestures.Hold = {
        name: name,
        index: 10,
        defaults: {
            /**
             * @property holdTimeout
             * @type {Number}
             * @default 500
             */
            holdTimeout: 500,

            /**
             * movement allowed while holding
             * @property holdThreshold
             * @type {Number}
             * @default 2
             */
            holdThreshold: 2
        },
        handler: holdGesture
    };
})('hold');

/**
 * @module gestures
 */
/**
 * when a touch is being released from the page
 *
 * @class Release
 * @static
 */
/**
 * @event release
 * @param {Object} ev
 */
Hammer.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
        if(ev.eventType == EVENT_RELEASE) {
            inst.trigger(this.name, ev);
        }
    }
};

/**
 * @module gestures
 */
/**
 * triggers swipe events when the end velocity is above the threshold
 * for best usage, set `preventDefault` (on the drag gesture) to `true`
 * ````
 *  hammertime.on("dragleft swipeleft", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Swipe
 * @static
 */
/**
 * @event swipe
 * @param {Object} ev
 */
/**
 * @event swipeleft
 * @param {Object} ev
 */
/**
 * @event swiperight
 * @param {Object} ev
 */
/**
 * @event swipeup
 * @param {Object} ev
 */
/**
 * @event swipedown
 * @param {Object} ev
 */
Hammer.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
        /**
         * @property swipeMinTouches
         * @type {Number}
         * @default 1
         */
        swipeMinTouches: 1,

        /**
         * @property swipeMaxTouches
         * @type {Number}
         * @default 1
         */
        swipeMaxTouches: 1,

        /**
         * horizontal swipe velocity
         * @property swipeVelocityX
         * @type {Number}
         * @default 0.6
         */
        swipeVelocityX: 0.6,

        /**
         * vertical swipe velocity
         * @property swipeVelocityY
         * @type {Number}
         * @default 0.6
         */
        swipeVelocityY: 0.6
    },

    handler: function swipeGesture(ev, inst) {
        if(ev.eventType == EVENT_RELEASE) {
            var touches = ev.touches.length,
                options = inst.options;

            // max touches
            if(touches < options.swipeMinTouches ||
                touches > options.swipeMaxTouches) {
                return;
            }

            // when the distance we moved is too small we skip this gesture
            // or we can be already in dragging
            if(ev.velocityX > options.swipeVelocityX ||
                ev.velocityY > options.swipeVelocityY) {
                // trigger swipe events
                inst.trigger(this.name, ev);
                inst.trigger(this.name + ev.direction, ev);
            }
        }
    }
};

/**
 * @module gestures
 */
/**
 * Single tap and a double tap on a place
 *
 * @class Tap
 * @static
 */
/**
 * @event tap
 * @param {Object} ev
 */
/**
 * @event doubletap
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var hasMoved = false;

    function tapGesture(ev, inst) {
        var options = inst.options,
            current = Detection.current,
            prev = Detection.previous,
            sincePrev,
            didDoubleTap;

        switch(ev.eventType) {
            case EVENT_START:
                hasMoved = false;
                break;

            case EVENT_MOVE:
                hasMoved = hasMoved || (ev.distance > options.tapMaxDistance);
                break;

            case EVENT_END:
                if(!Utils.inStr(ev.srcEvent.type, 'cancel') && ev.deltaTime < options.tapMaxTime && !hasMoved) {
                    // previous gesture, for the double tap since these are two different gesture detections
                    sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
                    didDoubleTap = false;

                    // check if double tap
                    if(prev && prev.name == name &&
                        (sincePrev && sincePrev < options.doubleTapInterval) &&
                        ev.distance < options.doubleTapDistance) {
                        inst.trigger('doubletap', ev);
                        didDoubleTap = true;
                    }

                    // do a single tap
                    if(!didDoubleTap || options.tapAlways) {
                        current.name = name;
                        inst.trigger(current.name, ev);
                    }
                }
                break;
        }
    }

    Hammer.gestures.Tap = {
        name: name,
        index: 100,
        handler: tapGesture,
        defaults: {
            /**
             * max time of a tap, this is for the slow tappers
             * @property tapMaxTime
             * @type {Number}
             * @default 250
             */
            tapMaxTime: 250,

            /**
             * max distance of movement of a tap, this is for the slow tappers
             * @property tapMaxDistance
             * @type {Number}
             * @default 10
             */
            tapMaxDistance: 10,

            /**
             * always trigger the `tap` event, even while double-tapping
             * @property tapAlways
             * @type {Boolean}
             * @default true
             */
            tapAlways: true,

            /**
             * max distance between two taps
             * @property doubleTapDistance
             * @type {Number}
             * @default 20
             */
            doubleTapDistance: 20,

            /**
             * max time between two taps
             * @property doubleTapInterval
             * @type {Number}
             * @default 300
             */
            doubleTapInterval: 300
        }
    };
})('tap');

/**
 * @module gestures
 */
/**
 * when a touch is being touched at the page
 *
 * @class Touch
 * @static
 */
/**
 * @event touch
 * @param {Object} ev
 */
Hammer.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
        /**
         * call preventDefault at touchstart, and makes the element blocking by disabling the scrolling of the page,
         * but it improves gestures like transforming and dragging.
         * be careful with using this, it can be very annoying for users to be stuck on the page
         * @property preventDefault
         * @type {Boolean}
         * @default false
         */
        preventDefault: false,

        /**
         * disable mouse events, so only touch (or pen!) input triggers events
         * @property preventMouse
         * @type {Boolean}
         * @default false
         */
        preventMouse: false
    },
    handler: function touchGesture(ev, inst) {
        if(inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
            ev.stopDetect();
            return;
        }

        if(inst.options.preventDefault) {
            ev.preventDefault();
        }

        if(ev.eventType == EVENT_TOUCH) {
            inst.trigger('touch', ev);
        }
    }
};

/**
 * @module gestures
 */
/**
 * User want to scale or rotate with 2 fingers
 * Preventing the default browser behavior is a good way to improve feel and working. This can be done with the
 * `preventDefault` option.
 *
 * @class Transform
 * @static
 */
/**
 * @event transform
 * @param {Object} ev
 */
/**
 * @event transformstart
 * @param {Object} ev
 */
/**
 * @event transformend
 * @param {Object} ev
 */
/**
 * @event pinchin
 * @param {Object} ev
 */
/**
 * @event pinchout
 * @param {Object} ev
 */
/**
 * @event rotate
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var triggered = false;

    function transformGesture(ev, inst) {
        switch(ev.eventType) {
            case EVENT_START:
                triggered = false;
                break;

            case EVENT_MOVE:
                // at least multitouch
                if(ev.touches.length < 2) {
                    return;
                }

                var scaleThreshold = Math.abs(1 - ev.scale);
                var rotationThreshold = Math.abs(ev.rotation);

                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(scaleThreshold < inst.options.transformMinScale &&
                    rotationThreshold < inst.options.transformMinRotation) {
                    return;
                }

                // we are transforming!
                Detection.current.name = name;

                // first time, trigger dragstart event
                if(!triggered) {
                    inst.trigger(name + 'start', ev);
                    triggered = true;
                }

                inst.trigger(name, ev); // basic transform event

                // trigger rotate event
                if(rotationThreshold > inst.options.transformMinRotation) {
                    inst.trigger('rotate', ev);
                }

                // trigger pinch event
                if(scaleThreshold > inst.options.transformMinScale) {
                    inst.trigger('pinch', ev);
                    inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
                }
                break;

            case EVENT_RELEASE:
                if(triggered && ev.changedLength < 2) {
                    inst.trigger(name + 'end', ev);
                    triggered = false;
                }
                break;
        }
    }

    Hammer.gestures.Transform = {
        name: name,
        index: 45,
        defaults: {
            /**
             * minimal scale factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
             * @property transformMinScale
             * @type {Number}
             * @default 0.01
             */
            transformMinScale: 0.01,

            /**
             * rotation in degrees
             * @property transformMinRotation
             * @type {Number}
             * @default 1
             */
            transformMinRotation: 1
        },

        handler: transformGesture
    };
})('transform');

/**
 * @module hammer
 */

// AMD export
if(typeof define == 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
// commonjs export
} else if(typeof module !== 'undefined' && module.exports) {
    module.exports = Hammer;
// browser export
} else {
    window.Hammer = Hammer;
}

})(window);
},{}],5:[function(_dereq_,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],6:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(_dereq_,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],8:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],9:[function(_dereq_,module,exports){
(function (process,global,Buffer){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.gyes=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib/');
},{"./lib/":5}],2:[function(_dereq_,module,exports){
/**
 * @module Clocks
 */

/**
 * Module dependencies
 */

var util = _dereq_( 'util' );
var Emitter = _dereq_( 'events' ).EventEmitter;
var messaging = _dereq_( './messaging' );

/**
 * Module exports
 */

module.exports = Clock;

/**
 * Module constructor
 * @constructor
 */
function Clock( startTime, updateTime ){
  startTime = startTime || 3000;
  updateTime = updateTime || 1000;

  this.startTime = startTime;
  this.updateTime = updateTime;

  this.timeoutID = undefined;
}

/**
 * Extends with Emitter
 */

util.inherits( Clock, Emitter );

/**
 * Module implementation
 */

Clock.prototype.update = function(){
  var self = this;
  // check if exists a timeout for this interpretation
  if ( 'undefined' === typeof this.timeoutID ){
    // create a new timeout
    this.timeoutID = setTimeout( self.stop.bind(self), self.startTime );
    return;
  }

  console.log( 'clocks::update' );

  // update old timeout
  clearTimeout( this.timeoutID );
  this.timeoutID = setTimeout( self.stop.bind(self), self.updateTime );
};

/**
 * stop Halts an interpretation window clock.
 * @private
 * @fires Clocks#stop
 */
Clock.prototype.stop = function(){
  /**
   * @event Clocks#stop
   */
  this.emit( 'clock::stop' );
  clearTimeout( this.timeoutID );
};
},{"./messaging":7,"events":10,"util":13}],3:[function(_dereq_,module,exports){
/**
 * @module Fission
 */

/**
 * Module dependencies
 */

var util = _dereq_( 'util' );
var Emitter = _dereq_( 'events' ).EventEmitter;
var messaging = _dereq_( './messaging' );

/**
 * Module exports
 */

module.exports = Fission;

/**
 * Module constructor
 * @constructor
 */
function Fission( opts ){
  opts = opts || {};

  this.interpretations = {};
  this.totalI = 0;
  this.setup();
}

/**
 * Extends with Emitter
 */

util.inherits( Fission, Emitter );

/**
 * Module implementation
 */

/**
 * setup Setup private events
 * @api private
 */
Fission.prototype.setup = function(){
  messaging.on( 'gyes::interpretation', this.sendInterpretation.bind(this) );
};

/**
 * sendInterpretation Emits interpretation event to the developer.
 * @param  {Object} data data should contain an interpretation object.
 * @private
 */
Fission.prototype.sendInterpretation = function( data ){
  if ( !data ){
    throw new Error( 'Missing argument.' );
  }

  try{
    this.emit( data.interpretation.name, data.interpretation );
  }catch( e ){
    console.error( e );
    throw new Error( 'Fission::sendInterpretation | ', e );
  }
};



},{"./messaging":7,"events":10,"util":13}],4:[function(_dereq_,module,exports){
/**
 * @module Fusion
 */

/**
 * Module dependencies
 */

var util = _dereq_( 'util' );
var Emitter = _dereq_( 'events' ).EventEmitter;
var debug = _dereq_('debug')('gyes:fusion');
var messaging = _dereq_( './messaging' );

/**
 * Module exports
 */
module.exports = Fusion;

/**
 * Module constructor
 * @constructor
 */
function Fusion( opts ){
  opts = opts || {};
  this.interpretations = {};
  this.events = {};
  this.totalI = 0;
  this.verbose = opts.verbose || false;

  this.setup();
}


/**
 * Extending with Emitter
 */

util.inherits( Fusion, Emitter );

/**
 * Module methods
 */

/**
 * setup Setup private events
 * @private
 */
Fusion.prototype.setup = function(){
  messaging.on( 'gyes::new_signal', this.onSignal.bind(this) );
};

/**
 * fuse Adds a new fusion to the fusion system.
 * @param  {Object} anInterpretation One or more modality events which defines a fusion.
 * @public
 */
Fusion.prototype.fuse = function( anInterpretation ){

  if ( 'undefined' === typeof anInterpretation ){
    throw new Error( 'Missing arguments. At least one modality event is required.' );
  }

  // TODO: try here with workers
  // var w = new Worker();

  this.launchMultipleListeners( anInterpretation );
};

/**
 * launchMultipleListeners Starts the internal fusion engine. Connects interpretation events with their signals.
 * @param  {Object} anInterpretation An interpretation object.
 * @private
 */
Fusion.prototype.launchMultipleListeners = function( anInterpretation ){
  var self = this;

  var modalityEvents = anInterpretation.getEventsList();
  /*
  for ( var i=0; i < modalityEvents.length; i++ ){
    // hooking up new modality events to be listened
    this.on( modalityEvents[ i ], self.onEvent );
  }
  */
  this.interpretations[ this.totalI++ ] = anInterpretation;

  // create/update per event hash of interpretations
  // one event can be part of many interpretations
  // so this is done to avoid walking all over the interpretations.
  for ( var j = 0; j < modalityEvents.length; j++ ) {
    var modalityEvent = modalityEvents[ j ];

    // hooking up new modality events to be listened
    this.on( modalityEvent, this.onEvent.bind( self ) );

    this.events[ modalityEvent ] = this.events[ modalityEvent ] || [];

    this.events[ modalityEvent ].push( anInterpretation );
  }
};

/**
 * onEvent Handles interpretations updates.
 * @param  {String} eventName An string indicating a signals event name.
 * @private
 */
Fusion.prototype.onEvent = function( eventName ){
  // TODO: do it the async way... :/
  var eventInterpretations = this.events[ eventName ] || [];

  console.log( 'interpretation::onEvent ', eventInterpretations );

  for ( var i = 0; i < eventInterpretations.length; i++ ){
    //eventInterpretations[ i ].touch( eventName );
    eventInterpretations[ i ].touch.call( eventInterpretations[ i ], eventName );
  }

};

/**
 * onSignal Handles the connection with the rest of the clients. When a distributed signal happens this will be activated.
 * @param  {Object} data A signal object representation.
 * @private
 */
Fusion.prototype.onSignal = function( data ){
  debug( 'fusion::onSignal ', data );

  // TODO: improve comments :)
  // if do data.gesture then this is a hardcoded solution...
  // Must think on a modality driver (mini) protocol
  this.emit( data.gesture, data.gesture );
  if ( this.verbose ){
    this.emit( 'fusion::onSignal', data );
  }
};
},{"./messaging":7,"debug":14,"events":10,"util":13}],5:[function(_dereq_,module,exports){
/**
 * The bloody blank page.
 * Never stop.
 * Dont even halt on.
 * Instead, go on and on and on.
 *
 * codename: Gyes
 * main module.
 *
 */

/**
 * @module Gyes
 */

/**
 * Module dependencies
 */
var debug = _dereq_('debug')('gyes');
var SocketClient = _dereq_( 'socket.io-client' );
var messaging = _dereq_( './messaging' );

/**
 * Module exports
 */

module.exports = Gyes; // Gyes == codename

module.exports.io = SocketClient;

module.exports.Interpretation = _dereq_( './interpretation' );

module.exports.Modality = _dereq_( './modality' );

module.exports.ModalityDriver = _dereq_( './modalityDriver' );

module.exports.Fusion = _dereq_( './fusion' );

module.exports.Fission = _dereq_( './fission' );

/**
 * Module constructor
 * @constructor
 * @param {string} app_key  A required app key.
 * @param {string} uri  An optional server uri.
 * @param {object} opts An optional options object.
 */
function Gyes( app_key, uri, opts ){
  if ( !app_key ){ throw new Error( 'A key is required.' ); }

  if ( !(this instanceof Gyes) ) return new Gyes( uri, opts );

  opts = opts || {};
  this.globalInterpretations = true;
  if ('boolean' === typeof opts.globalInterpretations){
    this.globalInterpretations = opts.globalInterpretations;
  }
  this.modalities = [];
  this.throttle = 0;
  try{
    this.io = SocketClient.connect( uri, opts );
  }catch( e ){
    throw Error(e);
  }

  // internal listeners - signals are an alternative
  messaging.on( 'gyes::recognize', this.emitSignal.bind(this) ); // when modality driver instance recognizes
  messaging.on( 'interpretation::trigger', this.emitInterpretation.bind(this) );
  // plusultra listeners
  this.io.on( 'plusultra::broadcast_new_modality', this.newModality.bind(this) );
  this.io.on( 'plusultra::broadcast_modality_signal', this.newSignal.bind(this) );
  this.io.on( 'plusultra::broadcast_interpretation', this.distributedInterpretation.bind(this) );
  // define message system
  this.messageSystem = ( this.globalInterpretations ) ? this.io : messaging;

}

/**
 * Module API
 */

Gyes.prototype.connect = function( uri, opts ){
  return this.io.connect( uri, opts );
};

Gyes.prototype.authenticate = function( key ){
  this.io.emit( 'authenticate', {token: key} );
};

Gyes.prototype.addModality = function( app_key, aModality ){

  // check modality prototype for specific methods, like a factory
  var isValid = this.isValidModality( aModality );
  if ( isValid ){
    // propagate the new modality | send app_key too?
    // this.io.emit( 'plusultra::new_modality', {'modality': aModality} );
    this.modalities.push( aModality );
  }else{
    throw new Error( 'There are some required methods not implemented yet. Verify your modality driver.' );
  }

};

Gyes.prototype.isValidModality = function( aModality ){
  var proto = aModality.prototype;

  // TODO: check this, it does not work this way anymore.
/*
  var hasType = ( (proto.modalityType) && ('string' === typeof proto.modalityType) );
  var isRecognizer = ( (proto.recognized) && ('function' === typeof proto.recognized) );
  var isSynthetizer = ( (proto.syntethize) && ('function' === typeof proto.syntethize) );

  return ( hasType && (isRecognizer || isSynthetizer) );
*/
  return true;
};

/**
 * emitSignal Distributes a modality generated signal to be consumed by the (distributed) Fusion module.
 * @param  {Object} data Modality signal data object.
 * @private
 */
Gyes.prototype.emitSignal = function( data ){
  debug( 'gyes::emitSignal' );
  this.io.emit( 'plusultra::modality_signal', {'signal':data} );
};

/**
 * emitInterpretation Distributes an interpretation generated by Fusion module to be catched by Fission engines.
 * @param  {Object} interpretation An Interpretation object.
 * @private
 */
Gyes.prototype.emitInterpretation = function( interpretation ){
  debug( 'gyes::emitInterpretation' );
  messaging.emit( 'gyes::interpretation', {'interpretation':interpretation} );

  if ( this.globalInterpretations ){
    this.io.emit( 'plusultra::interpretation', {'interpretation':JSON.stringify(interpretation)} );
  }

  if ( interpretation.canSynth ){
    var synths =  interpretation.synths;
    for ( var i = 0; i < synths.length; i++ ){
      var synthData = synths[ i ];
      // local messaging
      messaging.emit( 'gyes::synthesize', synthData );
    }
  }
};

/**
 * distributedInterpretation An interpretation generated elsewhere and shared through the platform.
 * @param  {Object} data An Interpretation object.
 * @private
 */
Gyes.prototype.distributedInterpretation = function( data ){
  debug( 'gyes::distributedInterpretation' );
  var interpretation = JSON.parse(data.interpretation);
  console.log( 'distributedInterpretation::interpretation is ', interpretation );
  messaging.emit( 'gyes::interpretation', {'interpretation':interpretation} );

  if ( interpretation.canSynth ){
    var synths =  interpretation.synths;
    for ( var i = 0; i < synths.length; i++ ){
      var synthData = synths[ i ];
      // local messaging
      console.log( 'synthData is:', synthData );
      messaging.emit( 'gyes::synthesize', synthData );
    }
  }
};

/**
 * newModality
 * @param  {Object} data A new modality object.
 * @private
 * @deprecated Add no value to distribute a ghost modality. At least not for production, maybe useful for log/stats.
 */
Gyes.prototype.newModality = function( data ){
  // this should be a set
  var newMod = data.modality;
  var exists = false;
  for ( var i = this.modalities.length - 1; i >= 0; i-- ) {
    if ( this.modalities[i] == newMod ){
      exists = true;
    }
  }
  if ( !exists ){
    this.modalities.push( data.modality );
    // signal the fusion module ?
  }
};

/**
 * newSignal Handles a broadcasted signal (which happened on any other client). Fuels the fusion system.
 * @param  {Object} data A signal representation.
 * @private
 */
Gyes.prototype.newSignal = function( data ){
  debug( 'gyes::newSignal: %s', data );
  //if ( this.throttle % 3 === 0 ){
  messaging.emit( 'gyes::new_signal', data.signal );
  //}
  this.throttle++;
};
},{"./fission":3,"./fusion":4,"./interpretation":6,"./messaging":7,"./modality":8,"./modalityDriver":9,"debug":14,"socket.io-client":41}],6:[function(_dereq_,module,exports){
/**
 * @module Interpretation
 */

/**
 * Module dependencies
 */

var util = _dereq_( 'util' );
var debug = _dereq_('debug')('gyes:interpretation');
var Set = _dereq_('set-collection');
var Clock = _dereq_( './clocks' );
var messaging = _dereq_( './messaging' );

/**
 * Module exports
 */

module.exports = Interpretation;

/**
 * Module constructor
 * @constructor
 */
function Interpretation( eventsList ){
  var bag = new Set();

  if ( 'undefined' === typeof eventsList ){
    throw new Error( 'Missing argument: eventsList' );
  }

  if ( 'string' === typeof eventsList ){
    eventsList = [ eventsList ];
  }

  if ( !util.isArray(eventsList) ){
    throw new Error( 'Wrong argument. Expected an array or a string with an unique event.' );
  }

  for ( var i=0; i < eventsList.length; i++ ){
    bag.add( eventsList[i] );
  }

  this.events = eventsList;
  this.name = this.getName( eventsList );
  this.set = bag;
  this.count = bag.count;
  this.lastEvent = null;
  this.synths = [];
  this.canSynth = false;

  this.clock = new Clock();
  this.clock.on( 'clock::stop', this.reset.bind(this) );
}

/**
 * Module implementation
 */

/**
 * getName Access to interpretation identifier.
 * @param  {Array} eventsList A list of events, used to generate interpretations identifier.
 * @return {String}            A simple interpretation identifier.
 * @public
 */
Interpretation.prototype.getName = function( events ){
  var name = '';

  events = events || this.events;

  for (var i = 0; i < events.length; i++) {
    name += events[i];
  }

  return name;
};

/**
 * touch Updates interpretation instance state.
 * @param  {String} eventName A captured event name.
 *
 * @private
 */
Interpretation.prototype.touch = function( eventName ){
  if ( 'undefined' === typeof eventName ){
    throw new Error( 'An event is required' );
  }
  debug( 'interpretation::touch ', eventName );

  if ( (eventName == this.lastEvent) || (!this.set.has(eventName)) ) return;

  this.lastEvent = eventName;
  this.count = this.count - 1;

  if ( this.count <= 0 ){
    // distributing a new interpretation.
    messaging.emit( 'interpretation::trigger', this );
    this.clock.stop();
  }else{
    this.clock.update();
  }
};

/**
 * reset Restart an internal interpretation counter/state.
 * @private
 */
Interpretation.prototype.reset = function(){
  this.count = this.set.count;
  this.lastEvent = null;
};

/**
 * getEventsList Getter for the interpretations events list.
 * @return {Array} Interpretations events list.
 * @public
 */
Interpretation.prototype.getEventsList = function(){
  return this.events;
};

/**
 * canSynthetize Attachs a synthetizer to an interpretation.
 * @param {String} modalityID A string that identifies a unique modality type.
 * @param {String} modalityDriverID A string indicating a reference to a modality driver.
 * @param {Object} params An optional object containing parameters to be passed to the modality synth.
 *
 * @public
 */
Interpretation.prototype.canSynthetize = function( modalityID, modalityDriverID, params ){
  if ( ('undefined' === typeof modalityID) || ('undefined' === typeof modalityDriverID) ){
    throw new Error( 'Missing params. A modality id and a modality driver id are both required.' );
  }

  this.canSynth = true;
  params = params || {};
  this.synths.push({
    'modality': modalityID,
    'modalityDriver': modalityDriverID,
    'params': params
  });

};
},{"./clocks":2,"./messaging":7,"debug":14,"set-collection":19,"util":13}],7:[function(_dereq_,module,exports){
/**
 * @module Messaging
 */

/**
 * Module dependencies.
 */

var Emitter = _dereq_( 'events' ).EventEmitter;
var tube = new Emitter();
/**
 * Module exports
 */

module.exports = tube;
},{"events":10}],8:[function(_dereq_,module,exports){
/**
 * @module Modality
 */

/**
 * Module dependencies
 */

var util = _dereq_( 'util' );
var debug = _dereq_('debug')('gyes:modality');
var messaging = _dereq_( './messaging' );

/**
 * Module exports
 */

module.exports = Modality;

/**
 * Module constructor
 * @constructor
 */
function Modality( name, modType, opts ){
  if ( !(this instanceof Modality) ) return new Modality( name, modType, opts );

  if ( 'string' !== typeof name ) throw Error( 'A name is required.' );

  if ( 'string' !== typeof modType ) throw Error( 'A modType is required. Options are: input, output or both.' );


  opts = opts || {};

  this.name = name;

  this.modType = modType;

  this.opts = opts;

}

/**
 * Extends with `Emitter`.
 */

//util.inherits( Modality, Emitter );

/**
 * Module implementation
 */

/**
 * use Attachs a modalityDriver instance with a modality instance.
 * @param  {Object} modalityDriver A modali driver instance.
 * @public
 */
Modality.prototype.use = function( modalityDriver ){
  if ( 'undefined' === typeof modalityDriver ){
    throw new Error( 'A modality driver is missing.' );
  }

  this.md = modalityDriver;

  if ( (this.modType === 'output') || (this.modType === 'both') ){
    messaging.on( 'gyes::synthesize', this.dispatchSynthetizer.bind(this) );
  }

  if ( (this.modType === 'input') || (this.modType === 'both') ){
    this.md.on( 'recognized', this.dispatchRecognizer );
  }

  if ( (this.md.start) && ('function' === typeof this.md.start ) ){
    this.md.start();
  }

};

/**
 * dispatchSynthetizer Allows a modality driver to trigger custom synthetized functionality.
 * @param  {Object} data An object containing a valid modality identifier and a modalityDriver id.
 * @public
 */
Modality.prototype.dispatchSynthetizer = function( data ){
  debug( 'modality::dispatchSynthetizer' );
  if ( !data ){
    return;
  }
  console.log('modality::dispatchSynthetizer md ', this.md);
  if ( (data.modality === this.name) && (data.modalityDriver === this.md.getID()) ){
    this.md.fire( 'synthetized', data.params );
  }
};


/**
 * dispatchRecognizer Emits to plusultra data recognized by the modality.
 * @param  {Object} data Recognized data object.
 * @public
 */
Modality.prototype.dispatchRecognizer = function( data ){
  debug( 'modality::dispatchRecognizer' );
  messaging.emit( 'gyes::recognize', {'data':data} );
};

},{"./messaging":7,"debug":14,"util":13}],9:[function(_dereq_,module,exports){
/**
 * @module ModalityDriver
 */

/**
 * Module dependencies
 */
var Signal = _dereq_( 'signals' );

/**
 * Module exports
 */

module.exports = ModalityDriver;


/**
 * Module constructor
 */
function ModalityDriver(){

  /*
  this.synthetized = new Signal();
  this.recognized = new Signal();
  this.updated = new Signal();
  */

}

var _signals = {
  'synthetized' : new Signal(),
  'recognized'  : new Signal(),
  'updated'     : new Signal()
};

ModalityDriver.prototype.on = function( signal, callbackFn ){
  _signals[ signal ].add( callbackFn );
};

ModalityDriver.prototype.fire = function( signal, data ){
  _signals[ signal ].dispatch( data );
};

ModalityDriver.prototype.getID = function(){
  // overwrite with proper module driver name/id.
  return this.id || '';
};



/*
ModalityDriverChannel = exports;

ModalityDriverChannel.synthetized = new Signal();

ModalityDriverChannel.recognized = new Signal();

ModalityDriverChannel.updated = new Signal();
*/
},{"signals":40}],10:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],11:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],13:[function(_dereq_,module,exports){
(function (global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":12,"inherits":11}],14:[function(_dereq_,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = _dereq_('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors and the Firebug
 * extension (*not* the built-in Firefox web inpector) are
 * known to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table)));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? '%c ' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args

  var c = 'color: ' + this.color;
  args = [args[0], c, ''].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      localStorage.removeItem('debug');
    } else {
      localStorage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":15}],15:[function(_dereq_,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = _dereq_('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = exports.log || enabled.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace('*', '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":16}],16:[function(_dereq_,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],17:[function(_dereq_,module,exports){
'use strict';

var callable = _dereq_('es5-ext/lib/Object/valid-callable')

  , call = Function.prototype.call;

module.exports = function (cb/*, thisArg*/) {
	var thisArg = arguments[1];
	callable(cb);
	this._values.forEach(function (value, index) {
		call.call(cb, thisArg, value, null, this, index);
	}, this);
};

},{"es5-ext/lib/Object/valid-callable":36}],18:[function(_dereq_,module,exports){
'use strict';

var validValue = _dereq_('es5-ext/lib/Object/valid-value');

module.exports = function (value) {
	validValue(value);
	if (value._isSet_) value = value.values;
	if (value.length !== this.count) return false;
	return value.every(function (value) {
		return this.has(value);
	}, this);
};

},{"es5-ext/lib/Object/valid-value":37}],19:[function(_dereq_,module,exports){
'use strict';

var d             = _dereq_('es5-ext/lib/Object/descriptor')
  , SetCollection = _dereq_('./set');

Object.defineProperties(SetCollection.prototype, {
	forEach: d(_dereq_('./ext/for-each')),
	isCopy:  d(_dereq_('./ext/is-copy'))
});

module.exports = SetCollection;

},{"./ext/for-each":17,"./ext/is-copy":18,"./set":20,"es5-ext/lib/Object/descriptor":29}],20:[function(_dereq_,module,exports){
'use strict';

var contains   = _dereq_('es5-ext/lib/Array/prototype/contains')
  , copy       = _dereq_('es5-ext/lib/Array/prototype/copy')
  , remove     = _dereq_('es5-ext/lib/Array/prototype/remove')
  , uniq       = _dereq_('es5-ext/lib/Array/prototype/uniq')
  , d          = _dereq_('es5-ext/lib/Object/descriptor')

  , isArray = Array.isArray, forEach = Array.prototype.forEach
  , push = Array.prototype.push
  , defineProperty = Object.defineProperty

  , Constructor, SetCollection;

Constructor = function () {};
module.exports = SetCollection = function () {
	var set = new Constructor(), values = [];

	forEach.call(arguments, function self(value) {
		if (value._isSet_) push.apply(this, value.values);
		else if (isArray(value)) push.apply(this, value);
		else this.push(value);
	}, values);

	defineProperty(set, '_values', d('c', uniq.call(values)));
	set.count = set._values.length;
	return set;
};

Constructor.prototype = Object.defineProperties(SetCollection.prototype, {
	_isSet_: d(true),
	add: d(function (value) {
		if (this.has(value)) return;
		this._values.push(value);
		++this.count;
	}),
	delete: d(function (value) {
		if (!this.has(value)) return;
		remove.call(this._values, value);
		--this.count;
	}),
	has: d(function (value) { return contains.call(this._values, value); }),
	values: d.gs(function () { return copy.call(this._values); })
});

},{"es5-ext/lib/Array/prototype/contains":21,"es5-ext/lib/Array/prototype/copy":22,"es5-ext/lib/Array/prototype/remove":24,"es5-ext/lib/Array/prototype/uniq":25,"es5-ext/lib/Object/descriptor":29}],21:[function(_dereq_,module,exports){
'use strict';

var indexOf = _dereq_('./e-index-of');

module.exports = function (searchElement/*, position*/) {
	return indexOf.call(this, searchElement, arguments[1]) > -1;
};

},{"./e-index-of":23}],22:[function(_dereq_,module,exports){
'use strict';

var slice = Array.prototype.slice;

module.exports = function () {
	return slice.call(this);
};

},{}],23:[function(_dereq_,module,exports){
'use strict';

var numIsNaN = _dereq_('../../Number/is-nan')
  , ois      = _dereq_('../../Object/is')
  , value    = _dereq_('../../Object/valid-value')

  , indexOf = Array.prototype.indexOf;

module.exports = function (searchElement/*, fromIndex*/) {
	var i;
	if (!numIsNaN(searchElement) && (searchElement !== 0)) {
		return indexOf.apply(this, arguments);
	}

	for (i = (arguments[1] >>> 0); i < (value(this).length >>> 0); ++i) {
		if (this.hasOwnProperty(i) && ois(searchElement, this[i])) {
			return i;
		}
	}
	return -1;
};

},{"../../Number/is-nan":26,"../../Object/is":34,"../../Object/valid-value":37}],24:[function(_dereq_,module,exports){
'use strict';

var indexOf = _dereq_('./e-index-of')

  , forEach = Array.prototype.forEach, splice = Array.prototype.splice;

module.exports = function (/*item*/) {
	forEach.call(arguments, function (item) {
		var index = indexOf.call(this, item);
		if (index !== -1) {
			splice.call(this, index, 1);
		}
	}, this);
};

},{"./e-index-of":23}],25:[function(_dereq_,module,exports){
'use strict';

var indexOf = _dereq_('./e-index-of')

  , filter = Array.prototype.filter

  , isFirst;

isFirst = function (value, index) {
	return indexOf.call(this, value) === index;
};

module.exports = function () {
	return filter.call(this, isFirst, this);
};

},{"./e-index-of":23}],26:[function(_dereq_,module,exports){
'use strict';

module.exports = function (value) {
	return (value !== value); //jslint: skip
};

},{}],27:[function(_dereq_,module,exports){
// Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order

'use strict';

var isCallable = _dereq_('./is-callable')
  , callable   = _dereq_('./valid-callable')
  , value      = _dereq_('./valid-value')

  , call = Function.prototype.call, keys = Object.keys;

module.exports = function (method) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable(cb);

		list = keys(obj);
		if (compareFn) {
			list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);
		}
		return list[method](function (key, index) {
			return call.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

},{"./is-callable":32,"./valid-callable":36,"./valid-value":37}],28:[function(_dereq_,module,exports){
'use strict';

var isPlainObject = _dereq_('./is-plain-object')
  , forEach       = _dereq_('./for-each')
  , extend        = _dereq_('./extend')
  , value         = _dereq_('./valid-value')

  , recursive;

recursive = function (to, from, cloned) {
	forEach(from, function (value, key) {
		var index;
		if (isPlainObject(value)) {
			if ((index = cloned[0].indexOf(value)) === -1) {
				cloned[0].push(value);
				cloned[1].push(to[key] = extend({}, value));
				recursive(to[key], value, cloned);
			} else {
				to[key] = cloned[1][index];
			}
		}
	}, from);
};

module.exports = function (obj/*, deep*/) {
	var copy;
	if ((copy = Object(value(obj))) === obj) {
		copy = extend({}, obj);
		if (arguments[1]) {
			recursive(copy, obj, [[obj], [copy]]);
		}
	}
	return copy;
};

},{"./extend":30,"./for-each":31,"./is-plain-object":33,"./valid-value":37}],29:[function(_dereq_,module,exports){
'use strict';

var isCallable = _dereq_('./is-callable')
  , callable   = _dereq_('./valid-callable')
  , validValue = _dereq_('./valid-value')
  , copy       = _dereq_('./copy')
  , map        = _dereq_('./map')
  , isString   = _dereq_('../String/is-string')
  , contains   = _dereq_('../String/prototype/contains')

  , bind = Function.prototype.bind
  , defineProperty = Object.defineProperty
  , d;

d = module.exports = function (dscr, value) {
	var c, e, w;
	if (arguments.length < 2) {
		value = dscr;
		dscr = null;
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	return { value: value, configurable: c, enumerable: e, writable: w };
};

d.gs = function (dscr, get, set) {
	var c, e;
	if (isCallable(dscr)) {
		set = (get == null) ? undefined : callable(get);
		get = dscr;
		dscr = null;
	} else {
		get = (get == null) ? undefined : callable(get);
		set = (set == null) ? undefined : callable(set);
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	return { get: get, set: set, configurable: c, enumerable: e };
};

d.binder = function self(name, dv) {
	var value, dgs;
	if (!isString(name)) {
		return map(name, function (dv, name) { return self(name, dv); });
	}
	value = validValue(dv) && callable(dv.value);
	dgs = copy(dv);
	delete dgs.writable;
	delete dgs.value;
	dgs.get = function () {
		dv.value = bind.call(value, this);
		defineProperty(this, name, dv);
		return this[name];
	};
	return dgs;
};

},{"../String/is-string":38,"../String/prototype/contains":39,"./copy":28,"./is-callable":32,"./map":35,"./valid-callable":36,"./valid-value":37}],30:[function(_dereq_,module,exports){
'use strict';

var value = _dereq_('./valid-value')

  , forEach = Array.prototype.forEach, slice = Array.prototype.slice
  , keys = Object.keys

  , extend;

extend = function (src) {
	keys(Object(src)).forEach(function (key) {
		this[key] = src[key];
	}, this);
};

module.exports = function (dest/*, …src*/) {
	forEach.call(arguments, value);
	slice.call(arguments, 1).forEach(extend, dest);
	return dest;
};

},{"./valid-value":37}],31:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./_iterate')('forEach');

},{"./_iterate":27}],32:[function(_dereq_,module,exports){
// Inspired by: http://www.davidflanagan.com/2009/08/typeof-isfuncti.html

'use strict';

var forEach = Array.prototype.forEach.bind([]);

module.exports = function (obj) {
	var type;
	if (!obj) {
		return false;
	}
	type = typeof obj;
	if (type === 'function') {
		return true;
	}
	if (type !== 'object') {
		return false;
	}

	try {
		forEach(obj);
		return true;
	} catch (e) {
		if (e instanceof TypeError) {
			return false;
		}
		throw e;
	}
};

},{}],33:[function(_dereq_,module,exports){
'use strict';

var getPrototypeOf = Object.getPrototypeOf, prototype = Object.prototype
  , toString = prototype.toString

  , id = {}.toString();

module.exports = function (value) {
	var proto;
	if (!value || (typeof value !== 'object') || (toString.call(value) !== id)) {
		return false;
	}
	proto = getPrototypeOf(value);
	return (proto === prototype) || (getPrototypeOf(proto) === null);
};

},{}],34:[function(_dereq_,module,exports){
// Implementation credits go to:
// http://wiki.ecmascript.org/doku.php?id=harmony:egal

'use strict';

module.exports = function (x, y) {
	return (x === y) ?
			((x !== 0) || ((1 / x) === (1 / y))) :
			((x !== x) && (y !== y)); //jslint: skip
};

},{}],35:[function(_dereq_,module,exports){
'use strict';

var callable = _dereq_('./valid-callable')
  , forEach  = _dereq_('./for-each')

  , call = Function.prototype.call;

module.exports = function (obj, cb/*, thisArg*/) {
	var o = {}, thisArg = arguments[2];
	callable(cb);
	forEach(obj, function (value, key, obj, index) {
		o[key] = call.call(cb, thisArg, value, key, obj, index);
	});
	return o;
};

},{"./for-each":31,"./valid-callable":36}],36:[function(_dereq_,module,exports){
'use strict';

var isCallable = _dereq_('./is-callable');

module.exports = function (fn) {
	if (!isCallable(fn)) {
		throw new TypeError(fn + " is not a function");
	}
	return fn;
};

},{"./is-callable":32}],37:[function(_dereq_,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) {
		throw new TypeError("Cannot use null or undefined");
	}
	return value;
};

},{}],38:[function(_dereq_,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call('');

module.exports = function (x) {
	return (typeof x === 'string') || (x && (typeof x === 'object') &&
		((x instanceof String) || (toString.call(x) === id))) || false;
};

},{}],39:[function(_dereq_,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],40:[function(_dereq_,module,exports){
/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false, signals:false */

/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */

(function(global){

    // SignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a Signal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
     * @author Miller Medeiros
     * @constructor
     * @internal
     * @name SignalBinding
     * @param {Signal} signal Reference to Signal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type Signal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    SignalBinding.prototype = {

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active : true,

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params : null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce : function () {
            return this._isOnce;
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener : function () {
            return this._listener;
        },

        /**
         * @return {Signal} Signal that listener is currently bound to.
         */
        getSignal : function () {
            return this._signal;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

    };


/*global SignalBinding:false*/

    // Signal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @name Signal
     * @author Miller Medeiros
     * @constructor
     */
    function Signal() {
        /**
         * @type Array.<SignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;

        // enforce dispatch to aways work on same context (#47)
        var self = this;
        this.dispatch = function(){
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }

    Signal.prototype = {

        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION : '1.0.0',

        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize : false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate : true,

        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active : true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener : function (listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if(this.memorize && this._prevParams){
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener : function (listener, context) {
            var n = this._bindings.length,
                cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        },

        /**
         * Check if listener was attached to Signal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if Signal has the specified listener.
         */
        has : function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add : function (listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce : function (listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove : function (listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the Signal.
         */
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners : function () {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see Signal.prototype.disable
         */
        halt : function () {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch : function (params) {
            if (! this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (! n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see Signal.memorize
         */
        forget : function(){
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose : function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        }

    };


    // Namespace -----------------------------------------------------
    //================================================================

    /**
     * Signals namespace
     * @namespace
     * @name signals
     */
    var signals = Signal;

    /**
     * Custom event broadcaster
     * @see Signal
     */
    // alias for backwards compatibility (see #gh-44)
    signals.Signal = Signal;



    //exports to multiple environments
    if(typeof define === 'function' && define.amd){ //AMD
        define(function () { return signals; });
    } else if (typeof module !== 'undefined' && module.exports){ //node
        module.exports = signals;
    } else { //browser
        //use string because of Google closure compiler ADVANCED_MODE
        /*jslint sub:true */
        global['signals'] = signals;
    }

}(this));

},{}],41:[function(_dereq_,module,exports){

module.exports = _dereq_('./lib/');

},{"./lib/":42}],42:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var url = _dereq_('./url');
var parser = _dereq_('socket.io-parser');
var Manager = _dereq_('./manager');
var debug = _dereq_('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var io;

  if (opts.forceNew || false === opts.multiplex) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = _dereq_('./manager');
exports.Socket = _dereq_('./socket');

},{"./manager":43,"./socket":45,"./url":46,"debug":48,"socket.io-parser":79}],43:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var url = _dereq_('./url');
var eio = _dereq_('engine.io-client');
var Socket = _dereq_('./socket');
var Emitter = _dereq_('emitter');
var parser = _dereq_('socket.io-parser');
var on = _dereq_('./on');
var bind = _dereq_('bind');
var object = _dereq_('object-component');
var debug = _dereq_('debug')('socket.io-client:manager');

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if ('object' == typeof uri) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connected = 0;
  this.attempts = 0;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  if (!this.openReconnect && !this.reconnecting && this._reconnection) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.openReconnect = true;
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emit('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    }

    self.maybeReconnectOnOpen();
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emit('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emit('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connect', function(){
      self.connected++;
    });
  }
  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  --this.connected || this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i]);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  this.skipReconnect = true;
  this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('close');
  this.cleanup();
  this.readyState = 'closed';
  this.emit('close', reason);
  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting) return this;

  var self = this;
  this.attempts++;

  if (this.attempts > this._reconnectionAttempts) {
    debug('reconnect failed');
    this.emit('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.attempts * this.reconnectionDelay();
    delay = Math.min(delay, this.reconnectionDelayMax());
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      debug('attempting reconnect');
      self.emit('reconnect_attempt');
      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emit('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.attempts;
  this.attempts = 0;
  this.reconnecting = false;
  this.emit('reconnect', attempt);
};

},{"./on":44,"./socket":45,"./url":46,"bind":47,"debug":48,"emitter":49,"engine.io-client":50,"object-component":76,"socket.io-parser":79}],44:[function(_dereq_,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

},{}],45:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var parser = _dereq_('socket.io-parser');
var Emitter = _dereq_('emitter');
var toArray = _dereq_('to-array');
var on = _dereq_('./on');
var bind = _dereq_('bind');
var debug = _dereq_('debug')('socket.io-client:socket');
var hasBin = _dereq_('has-binary-data');
var indexOf = _dereq_('indexof');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  disconnect: 1,
  error: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.open();
  this.buffer = [];
  this.connected = false;
  this.disconnected = true;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;
  var io = this.io;
  io.open(); // ensure open
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'error', bind(this, 'onerror')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
  if ('open' == this.io.readyState) this.onopen();
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  this.packet(packet);

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon `error`.
 *
 * @param {Object} data
 * @api private
 */

Socket.prototype.onerror = function(data){
  this.emit('error', data);
};

/**
 * "Opens" the socket.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.buffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);
    self.packet({
      type: parser.ACK,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  debug('calling ack %s with %j', packet.id, packet.data);
  var fn = this.acks[packet.id];
  fn.apply(this, packet.data);
  delete this.acks[packet.id];
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events.
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  for (var i = 0; i < this.buffer.length; i++) {
    emit.apply(this, this.buffer[i]);
  }
  this.buffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  // clean subscriptions to avoid reconnections
  for (var i = 0; i < this.subs.length; i++) {
    this.subs[i].destroy();
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (!this.connected) return this;

  debug('performing disconnect (%s)', this.nsp);
  this.packet({ type: parser.DISCONNECT });

  // remove socket from pool
  this.destroy();

  // fire events
  this.onclose('io client disconnect');
  return this;
};

},{"./on":44,"bind":47,"debug":48,"emitter":49,"has-binary-data":73,"indexof":75,"socket.io-parser":79,"to-array":82}],46:[function(_dereq_,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = _dereq_('parseuri');
var debug = _dereq_('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.hostname;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('undefined' != typeof loc) {
        uri = loc.hostname + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if ((/(http|ws)/.test(obj.protocol) && 80 == obj.port) ||
     (/(http|ws)s/.test(obj.protocol) && 443 == obj.port)) {
    delete obj.port;
  }

  obj.path = obj.path || '/';

  // define unique id
  obj.id = obj.protocol + obj.host + (obj.port ? (':' + obj.port) : '');

  // define href
  obj.href = obj.protocol + '://' + obj.host + (obj.port ? (':' + obj.port) : '');

  return obj;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":48,"parseuri":77}],47:[function(_dereq_,module,exports){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],48:[function(_dereq_,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],49:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var index = _dereq_('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{"indexof":75}],50:[function(_dereq_,module,exports){

module.exports =  _dereq_('./lib/');

},{"./lib/":51}],51:[function(_dereq_,module,exports){

module.exports = _dereq_('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = _dereq_('engine.io-parser');

},{"./socket":52,"engine.io-parser":61}],52:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = _dereq_('./transports');
var Emitter = _dereq_('emitter');
var debug = _dereq_('debug')('engine.io-client:socket');
var index = _dereq_('indexof');
var parser = _dereq_('engine.io-parser');
var parseuri = _dereq_('parseuri');
var parsejson = _dereq_('parsejson');
var parseqs = _dereq_('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.host = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.host) {
    var pieces = opts.host.split(':');
    opts.hostname = pieces.shift();
    if (pieces.length) opts.port = pieces.pop();
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.forceBase64 = !!opts.forceBase64;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.flashPath = opts.flashPath || '';
  this.transports = opts.transports || ['polling', 'websocket', 'flashsocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.callbackBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.open();
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = _dereq_('./transport');
Socket.transports = _dereq_('./transports');
Socket.parser = _dereq_('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    forceBase64: this.forceBase64,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    flashPath: this.flashPath,
    policyPort: this.policyPort,
    socket: this
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';
  var transport = this.createTransport(transport);
  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState || 'closing' == self.readyState) {
            return;
          }
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.onopen && this.onopen.call(this);
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.emit('error', err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api public
*/

Socket.prototype.ping = function () {
  this.sendPacket('ping');
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  for (var i = 0; i < this.prevBufferLen; i++) {
    if (this.callbackBuffer[i]) {
      this.callbackBuffer[i]();
    }
  }

  this.writeBuffer.splice(0, this.prevBufferLen);
  this.callbackBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (this.writeBuffer.length == 0) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, fn) {
  this.sendPacket('message', msg, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, fn) {
  var packet = { type: type, data: data };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  this.callbackBuffer.push(fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.onClose('forced close');
    debug('socket closing - telling transport to close');
    this.transport.close();
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // clean buffers in next tick, so developers can still
    // grab the buffers on `close` event
    setTimeout(function() {
      self.writeBuffer = [];
      self.callbackBuffer = [];
      self.prevBufferLen = 0;
    }, 0);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":53,"./transports":55,"debug":48,"emitter":49,"engine.io-parser":61,"indexof":75,"parsejson":70,"parseqs":71,"parseuri":77}],53:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var parser = _dereq_('engine.io-parser');
var Emitter = _dereq_('emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * A counter used to prevent collisions in the timestamps used
 * for cache busting.
 */

Transport.timestamps = 0;

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  this.onPacket(parser.decodePacket(data, this.socket.binaryType));
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"emitter":49,"engine.io-parser":61}],54:[function(_dereq_,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var WS = _dereq_('./websocket');
var debug = _dereq_('debug')('engine.io-client:flashsocket');
var inherit = _dereq_('inherits');

/**
 * Module exports.
 */

module.exports = FlashWS;

/**
 * Obfuscated key for Blue Coat.
 */

var xobject = global[['Active'].concat('Object').join('X')];

/**
 * FlashWS constructor.
 *
 * @api public
 */

function FlashWS(options){
  WS.call(this, options);
  this.flashPath = options.flashPath;
  this.policyPort = options.policyPort;
}

/**
 * Inherits from WebSocket.
 */

inherit(FlashWS, WS);

/**
 * Transport name.
 *
 * @api public
 */

FlashWS.prototype.name = 'flashsocket';

/*
 * FlashSockets only support binary as base64 encoded strings
 */

FlashWS.prototype.supportsBinary = false;

/**
 * Opens the transport.
 *
 * @api public
 */

FlashWS.prototype.doOpen = function(){
  if (!this.check()) {
    // let the probe timeout
    return;
  }

  // instrument websocketjs logging
  function log(type){
    return function(){
      var str = Array.prototype.join.call(arguments, ' ');
      debug('[websocketjs %s] %s', type, str);
    };
  }

  global.WEB_SOCKET_LOGGER = { log: log('debug'), error: log('error') };
  global.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;
  global.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;

  if (!global.WEB_SOCKET_SWF_LOCATION) {
    global.WEB_SOCKET_SWF_LOCATION = this.flashPath + 'WebSocketMainInsecure.swf';
  }

  // dependencies
  var deps = [this.flashPath + 'web_socket.js'];

  if (!global.swfobject) {
    deps.unshift(this.flashPath + 'swfobject.js');
  }

  var self = this;

  load(deps, function(){
    self.ready(function(){
      WebSocket.__addTask(function () {
        self.ws = new WebSocket(self.uri());
        self.addEventListeners();
      });
    });
  });
};

/**
 * Override to prevent closing uninitialized flashsocket.
 *
 * @api private
 */

FlashWS.prototype.doClose = function(){
  if (!this.ws) return;
  var self = this;
  WebSocket.__addTask(function(){
    WS.prototype.doClose.call(self);
  });
};

/**
 * Writes to the Flash socket.
 *
 * @api private
 */

FlashWS.prototype.write = function(){
  var self = this, args = arguments;
  WebSocket.__addTask(function(){
    WS.prototype.write.apply(self, args);
  });
};

/**
 * Called upon dependencies are loaded.
 *
 * @api private
 */

FlashWS.prototype.ready = function(fn){
  if (typeof WebSocket == 'undefined' ||
    !('__initialize' in WebSocket) || !global.swfobject) {
    return;
  }

  if (global.swfobject.getFlashPlayerVersion().major < 10) {
    return;
  }

  function init () {
    // only start downloading the swf file when
    // we checked that this browser actually supports it
    if (!FlashWS.loaded) {
      if (843 != self.policyPort) {
        var policy = 'xmlsocket://' + self.hostname + ':' + self.policyPort;
        WebSocket.loadFlashPolicyFile(policy);
      }

      WebSocket.__initialize();
      FlashWS.loaded = true;
    }

    fn.call(self);
  }

  var self = this;
  if (document.body) {
    return init();
  }
  
  if (global.document && document.readyState == 'complete') {
    init();
  } else {
    if (global.attachEvent) {
      global.attachEvent('onload', init);
    } else if (global.addEventListener) {
      global.addEventListener('load', init, false);
    }
  }
};

/**
 * Feature detection for flashsocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

FlashWS.prototype.check = function(){
  if ('undefined' == typeof window) {
    return false;
  }

  if (typeof WebSocket != 'undefined' && !('__initialize' in WebSocket)) {
    return false;
  }

  if (xobject) {
    var control = null;
    try {
      control = new xobject('ShockwaveFlash.ShockwaveFlash');
    } catch (e) { }
    if (control) {
      return true;
    }
  } else {
    for (var i = 0, l = navigator.plugins.length; i < l; i++) {
      for (var j = 0, m = navigator.plugins[i].length; j < m; j++) {
        if (navigator.plugins[i][j].description == 'Shockwave Flash') {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Lazy loading of scripts.
 * Based on $script by Dustin Diaz - MIT
 */

var scripts = {};

/**
 * Injects a script. Keeps tracked of injected ones.
 *
 * @param {String} path
 * @param {Function} callback
 * @api private
 */

function create(path, fn){
  if (scripts[path]) return fn();

  var el = document.createElement('script');
  var loaded = false;

  debug('loading "%s"', path);
  el.onload = el.onreadystatechange = function(){
    if (loaded || scripts[path]) return;
    var rs = el.readyState;
    if (!rs || 'loaded' == rs || 'complete' == rs) {
      debug('loaded "%s"', path);
      el.onload = el.onreadystatechange = null;
      loaded = true;
      scripts[path] = true;
      fn();
    }
  };

  el.async = 1;
  el.src = path;

  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(el, head.firstChild);
}

/**
 * Loads scripts and fires a callback.
 *
 * @param {Array} paths
 * @param {Function} callback
 */

function load(arr, fn){
  function process(i){
    if (!arr[i]) return fn();
    create(arr[i], function () {
      process(++i);
    });
  }

  process(0);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./websocket":59,"debug":48,"inherits":69}],55:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = _dereq_('xmlhttprequest')
  , XHR = _dereq_('./polling-xhr')
  , JSONP = _dereq_('./polling-jsonp')
  , websocket = _dereq_('./websocket')
  , flashsocket = _dereq_('./flashsocket')

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;
exports.flashsocket = flashsocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr
    , xd = false;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
  }

  opts.xdomain = xd;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    return new JSONP(opts);
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./flashsocket":54,"./polling-jsonp":56,"./polling-xhr":57,"./websocket":59,"xmlhttprequest":60}],56:[function(_dereq_,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = _dereq_('./polling');
var inherit = _dereq_('inherits');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    });
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":58,"inherits":69}],57:[function(_dereq_,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = _dereq_('xmlhttprequest');
var Polling = _dereq_('./polling');
var Emitter = _dereq_('emitter');
var debug = _dereq_('debug')('engine.io-client:polling-xhr');
var inherit = _dereq_('inherits');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.create(opts.isBinary, opts.supportsBinary);
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(isBinary, supportsBinary){
  var xhr = this.xhr = new XMLHttpRequest({ agent: this.agent, xdomain: this.xd });
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    if (supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    xhr.onreadystatechange = function(){
      var data;

      try {
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          var contentType = xhr.getResponseHeader('Content-Type');
          if (contentType === 'application/octet-stream') {
            data = xhr.response;
          } else {
            if (!supportsBinary) {
              data = xhr.responseText;
            } else {
              data = 'ok';
            }
          }
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      } catch (e) {
        self.onError(e);
      }

      if (null != data) {
        self.onData(data);
      }
    };

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup();
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  this.xhr.onreadystatechange = empty;

  try {
    this.xhr.abort();
  } catch(e) {}

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":58,"debug":48,"emitter":49,"inherits":69,"xmlhttprequest":60}],58:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parseqs = _dereq_('parseqs');
var parser = _dereq_('engine.io-parser');
var debug = _dereq_('debug')('engine.io-client:polling');
var inherit = _dereq_('inherits');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = _dereq_('xmlhttprequest');
  var xhr = new XMLHttpRequest({ agent: this.agent, xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = +new Date + '-' + Transport.timestamps++;
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

},{"../transport":53,"debug":48,"engine.io-parser":61,"inherits":69,"parseqs":71,"xmlhttprequest":60}],59:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parser = _dereq_('engine.io-parser');
var parseqs = _dereq_('parseqs');
var debug = _dereq_('debug')('engine.io-client:websocket');
var inherit = _dereq_('inherits');

/**
 * `ws` exposes a WebSocket-compatible interface in
 * Node, or the `WebSocket` or `MozWebSocket` globals
 * in the browser.
 */

var WebSocket = _dereq_('ws');

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = { agent: this.agent };

  this.ws = new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  this.ws.binaryType = 'arraybuffer';
  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  for (var i = 0, l = packets.length; i < l; i++) {
    parser.encodePacket(packets[i], this.supportsBinary, function(data) {
      //Sometimes the websocket has already been closed but the browser didn't
      //have a chance of informing us about it yet, in that case send will
      //throw an error
      try {
        self.ws.send(data);
      } catch (e){
        debug('websocket closed before onclose event');
      }
    });
  }

  function ondrain() {
    self.writable = true;
    self.emit('drain');
  }
  // fake drain
  // defer to next tick to allow Socket to clear writeBuffer
  setTimeout(ondrain, 0);
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

},{"../transport":53,"debug":48,"engine.io-parser":61,"inherits":69,"parseqs":71,"ws":72}],60:[function(_dereq_,module,exports){
// browser shim for xmlhttprequest module
var hasCORS = _dereq_('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

},{"has-cors":67}],61:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = _dereq_('./keys');
var sliceBuffer = _dereq_('arraybuffer.slice');
var base64encoder = _dereq_('base64-arraybuffer');
var after = _dereq_('after');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Current protocol version.
 */

exports.protocol = 2;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = _dereq_('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = false;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += String(packet.data);
  }

  return callback('' + encoded);

};

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (isAndroid) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  if (supportsBinary) {
    if (Blob && !isAndroid) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, supportsBinary, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';
    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;
      msgLength += tailArray[i];
    }
    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        var basic = new Array(typed.length);
        for (var i = 0; i < typed.length; i++) {
          basic[i] = typed[i];
        }
        msg = String.fromCharCode.apply(null, basic);
      }
    }
    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType), i, total);
  });
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":62,"after":63,"arraybuffer.slice":64,"base64-arraybuffer":65,"blob":66}],62:[function(_dereq_,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],63:[function(_dereq_,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],64:[function(_dereq_,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],65:[function(_dereq_,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.buffer.byteLength, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes.buffer[i] >> 2];
      base64 += chars[((bytes.buffer[i] & 3) << 4) | (bytes.buffer[i + 1] >> 4)];
      base64 += chars[((bytes.buffer[i + 1] & 15) << 2) | (bytes.buffer[i + 2] >> 6)];
      base64 += chars[bytes.buffer[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
},{}],66:[function(_dereq_,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var b = new Blob(['hi']);
    return b.size == 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }
  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

module.exports = (function() {
  if (blobSupported) {
    return global.Blob;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],67:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var global = _dereq_('global');

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = 'XMLHttpRequest' in global &&
    'withCredentials' in new global.XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{"global":68}],68:[function(_dereq_,module,exports){

/**
 * Returns `this`. Execute this without a "context" (i.e. without it being
 * attached to an object of the left-hand side), and `this` points to the
 * "global" scope of the current JS execution.
 */

module.exports = (function () { return this; })();

},{}],69:[function(_dereq_,module,exports){
module.exports=_dereq_(11)
},{}],70:[function(_dereq_,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],71:[function(_dereq_,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],72:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],73:[function(_dereq_,module,exports){
(function (global){
/*
 * Module requirements.
 */

var isArray = _dereq_('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function recursiveCheckForBinary(obj) { 
    if (!obj) return false;

    if ( (global.Buffer && Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (recursiveCheckForBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      for (var key in obj) {
        if (recursiveCheckForBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return recursiveCheckForBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":74}],74:[function(_dereq_,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],75:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],76:[function(_dereq_,module,exports){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
},{}],77:[function(_dereq_,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
  var m = re.exec(str || '')
    , uri = {}
    , i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  return uri;
};

},{}],78:[function(_dereq_,module,exports){
(function (global){
/**
 * Modle requirements
 */

var isArray = _dereq_('isarray');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet) {
    var buffers = [];
    var packetData = packet.data;

    function deconstructBinPackRecursive(data) {
        if (!data) return data;

        if ((global.Buffer && Buffer.isBuffer(data)) ||
            (global.ArrayBuffer && data instanceof ArrayBuffer)) { // replace binary
            var placeholder = {_placeholder: true, num: buffers.length};
            buffers.push(data);
            return placeholder;
        } else if (isArray(data)) {
            var newData = new Array(data.length);
            for (var i = 0; i < data.length; i++) {
                newData[i] = deconstructBinPackRecursive(data[i]);
            }
            return newData;
        } else if ('object' == typeof data) {
            var newData = {};
            for (var key in data) {
                newData[key] = deconstructBinPackRecursive(data[key]);
            }
            return newData;
        }
        return data;
    }

    var pack = packet;
    pack.data = deconstructBinPackRecursive(packetData);
    pack.attachments = buffers.length; // number of binary 'attachments'
    return {packet: pack, buffers: buffers};
}

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

 exports.reconstructPacket = function(packet, buffers) {
    var curPlaceHolder = 0;

    function reconstructBinPackRecursive(data) {
        if (data._placeholder) {
            var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
            return buf;
        } else if (isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                data[i] = reconstructBinPackRecursive(data[i]);
            }
            return data;
        } else if ('object' == typeof data) {
            for (var key in data) {
                data[key] = reconstructBinPackRecursive(data[key]);
            }
            return data;
        }
        return data;
    }

    packet.data = reconstructBinPackRecursive(packet.data);
    packet.attachments = undefined; // no longer useful
    return packet;
 }

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {

  function removeBlobsRecursive(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    }

    if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        removeBlobsRecursive(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        removeBlobsRecursive(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  removeBlobsRecursive(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
}

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */
function isBuf(obj) {
  return (global.Buffer && Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":80}],79:[function(_dereq_,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('socket.io-parser');
var json = _dereq_('json3');
var isArray = _dereq_('isarray');
var Emitter = _dereq_('emitter');
var binary = _dereq_('./binary');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 3;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'BINARY_EVENT',
  'ACK',
  'ERROR'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

exports.Encoder = Encoder

/**
 * A socket.io Encoder instance
 *
 * @api public
 */
function Encoder() {};

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

exports.Decoder = Decoder

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments == 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if ((global.Buffer && Buffer.isBuffer(obj)) ||
            (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
            obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
}

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.ACK == p.type) {
    p.attachments = '';
    while (str.charAt(++i) != '-') {
      p.attachments += str.charAt(i);
    }
    p.attachments = Number(p.attachments);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i + 1 == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' != next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i + 1 == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
};

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
}

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
}

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
}

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./binary":78,"debug":48,"emitter":49,"isarray":80,"json3":81}],80:[function(_dereq_,module,exports){
module.exports=_dereq_(74)
},{}],81:[function(_dereq_,module,exports){
/*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function (window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // Detect native implementations.
  var nativeJSON = typeof JSON == "object" && JSON;

  // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
  // available.
  var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;

  if (JSON3 && nativeJSON) {
    // Explicitly delegate to the native `stringify` and `parse`
    // implementations in CommonJS environments.
    JSON3.stringify = nativeJSON.stringify;
    JSON3.parse = nativeJSON.parse;
  } else {
    // Export for web browsers, JavaScript engines, and asynchronous module
    // loaders, using the global `JSON` object if available.
    JSON3 = window.JSON = nativeJSON || {};
  }

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name) {
    if (has[name] !== undef) {
      // Return cached feature test result.
      return has[name];
    }

    var isSupported;
    if (name == "bug-string-char-index") {
      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      isSupported = "a"[0] != "a";
    } else if (name == "json") {
      // Indicates whether both `JSON.stringify` and `JSON.parse` are
      // supported.
      isSupported = has("json-stringify") && has("json-parse");
    } else {
      var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
      // Test `JSON.stringify`.
      if (name == "json-stringify") {
        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
        if (stringifySupported) {
          // A test function object with a custom `toJSON` method.
          (value = function () {
            return 1;
          }).toJSON = value;
          try {
            stringifySupported =
              // Firefox 3.1b1 and b2 serialize string, number, and boolean
              // primitives as object literals.
              stringify(0) === "0" &&
              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
              // literals.
              stringify(new Number()) === "0" &&
              stringify(new String()) == '""' &&
              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
              // does not define a canonical JSON representation (this applies to
              // objects with `toJSON` properties as well, *unless* they are nested
              // within an object or array).
              stringify(getClass) === undef &&
              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
              // FF 3.1b3 pass this test.
              stringify(undef) === undef &&
              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
              // respectively, if the value is omitted entirely.
              stringify() === undef &&
              // FF 3.1b1, 2 throw an error if the given value is not a number,
              // string, array, object, Boolean, or `null` literal. This applies to
              // objects with custom `toJSON` methods as well, unless they are nested
              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
              // methods entirely.
              stringify(value) === "1" &&
              stringify([value]) == "[1]" &&
              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
              // `"[null]"`.
              stringify([undef]) == "[null]" &&
              // YUI 3.0.0b1 fails to serialize `null` literals.
              stringify(null) == "null" &&
              // FF 3.1b1, 2 halts serialization if an array contains a function:
              // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
              // elides non-JSON values from objects and arrays, unless they
              // define custom `toJSON` methods.
              stringify([undef, getClass, null]) == "[null,null,null]" &&
              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
              // where character escape codes are expected (e.g., `\b` => `\u0008`).
              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
              stringify(null, value) === "1" &&
              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch (exception) {
            stringifySupported = false;
          }
        }
        isSupported = stringifySupported;
      }
      // Test `JSON.parse`.
      if (name == "json-parse") {
        var parse = JSON3.parse;
        if (typeof parse == "function") {
          try {
            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if (parse("0") === 0 && !parse(false)) {
              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if (parseSupported) {
                try {
                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch (exception) {}
                if (parseSupported) {
                  try {
                    // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                    // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                    // certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch (exception) {}
                }
                if (parseSupported) {
                  try {
                    // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                    // points. These environments, along with FF 3.1b1 and 2,
                    // also allow trailing commas in JSON objects and arrays.
                    parseSupported = parse("1.") !== 1;
                  } catch (exception) {}
                }
              }
            }
          } catch (exception) {
            parseSupported = false;
          }
        }
        isSupported = parseSupported;
      }
    }
    return has[name] = !!isSupported;
  }

  if (!has("json")) {
    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";

    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");

    // Define additional utility methods if the `Date` methods are buggy.
    if (!isExtended) {
      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function (year, month) {
        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    }

    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: A set of primitive types used by `isHostType`.
    var PrimitiveTypes = {
      'boolean': 1,
      'number': 1,
      'string': 1,
      'undefined': 1
    };

    // Internal: Determines if the given object `property` value is a
    // non-primitive.
    var isHostType = function (object, property) {
      var type = typeof object[property];
      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
    };

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, length;
          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == functionClass, property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!has("json-stringify")) {
      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        92: "\\\\",
        34: '\\"',
        8: "\\b",
        12: "\\f",
        10: "\\n",
        13: "\\r",
        9: "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function (value) {
        var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
        if (isLarge) {
          symbols = value.split("");
        }
        for (; index < length; index++) {
          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch (charCode) {
            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
            default:
              if (charCode < 32) {
                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                break;
              }
              result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
          }
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
        try {
          // Necessary for host object support.
          value = object[property];
        } catch (exception) {}
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == dateClass && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == booleanClass) {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == numberClass) {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == stringClass) {
          // Strings are double-quoted and escaped.
          return quote("" + value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == arrayClass) {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
            });
            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, className;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if ((className = getClass.call(filter)) == functionClass) {
            callback = filter;
          } else if (className == arrayClass) {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
          }
        }
        if (width) {
          if ((className = getClass.call(width)) == numberClass) {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (className == stringClass) {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!has("json-parse")) {
      var fromCharCode = String.fromCharCode;

      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        92: "\\",
        34: '"',
        47: "/",
        98: "\b",
        116: "\t",
        110: "\n",
        102: "\f",
        114: "\r"
      };

      // Internal: Stores the parser state.
      var Index, Source;

      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function () {
        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
        while (Index < length) {
          charCode = source.charCodeAt(Index);
          switch (charCode) {
            case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
            case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
            case 34:
              // `"` delimits a JSON string; advance to the next character and
              // begin parsing the string. String tokens are prefixed with the
              // sentinel `@` character to distinguish them from punctuators and
              // end-of-string tokens.
              for (value = "@", Index++; Index < length;) {
                charCode = source.charCodeAt(Index);
                if (charCode < 32) {
                  // Unescaped ASCII control characters (those with a code unit
                  // less than the space character) are not permitted.
                  abort();
                } else if (charCode == 92) {
                  // A reverse solidus (`\`) marks the beginning of an escaped
                  // control character (including `"`, `\`, and `/`) or Unicode
                  // escape sequence.
                  charCode = source.charCodeAt(++Index);
                  switch (charCode) {
                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                    case 117:
                      // `\u` marks the beginning of a Unicode escape sequence.
                      // Advance to the first character and validate the
                      // four-digit code point.
                      begin = ++Index;
                      for (position = Index + 4; Index < position; Index++) {
                        charCode = source.charCodeAt(Index);
                        // A valid sequence comprises four hexdigits (case-
                        // insensitive) that form a single hexadecimal value.
                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                          // Invalid Unicode escape sequence.
                          abort();
                        }
                      }
                      // Revive the escaped character.
                      value += fromCharCode("0x" + source.slice(begin, Index));
                      break;
                    default:
                      // Invalid escape sequence.
                      abort();
                  }
                } else {
                  if (charCode == 34) {
                    // An unescaped double-quote character marks the end of the
                    // string.
                    break;
                  }
                  charCode = source.charCodeAt(Index);
                  begin = Index;
                  // Optimize for the common case where a string is valid.
                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
                    charCode = source.charCodeAt(++Index);
                  }
                  // Append the string as-is.
                  value += source.slice(begin, Index);
                }
              }
              if (source.charCodeAt(Index) == 34) {
                // Advance to the next character and return the revived string.
                Index++;
                return value;
              }
              // Unterminated string.
              abort();
            default:
              // Parse numbers and literals.
              begin = Index;
              // Advance past the negative sign, if one is specified.
              if (charCode == 45) {
                isSigned = true;
                charCode = source.charCodeAt(++Index);
              }
              // Parse an integer or floating-point value.
              if (charCode >= 48 && charCode <= 57) {
                // Leading zeroes are interpreted as octal literals.
                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                  // Illegal octal literal.
                  abort();
                }
                isSigned = false;
                // Parse the integer component.
                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                // Floats cannot contain a leading decimal point; however, this
                // case is already accounted for by the parser.
                if (source.charCodeAt(Index) == 46) {
                  position = ++Index;
                  // Parse the decimal component.
                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal trailing decimal.
                    abort();
                  }
                  Index = position;
                }
                // Parse exponents. The `e` denoting the exponent is
                // case-insensitive.
                charCode = source.charCodeAt(Index);
                if (charCode == 101 || charCode == 69) {
                  charCode = source.charCodeAt(++Index);
                  // Skip past the sign following the exponent, if one is
                  // specified.
                  if (charCode == 43 || charCode == 45) {
                    Index++;
                  }
                  // Parse the exponential component.
                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal empty exponent.
                    abort();
                  }
                  Index = position;
                }
                // Coerce the parsed value to a JavaScript number.
                return +source.slice(begin, Index);
              }
              // A negative sign may only precede numbers.
              if (isSigned) {
                abort();
              }
              // `true`, `false`, and `null` literals.
              if (source.slice(Index, Index + 4) == "true") {
                Index += 4;
                return true;
              } else if (source.slice(Index, Index + 5) == "false") {
                Index += 5;
                return false;
              } else if (source.slice(Index, Index + 4) == "null") {
                Index += 4;
                return null;
              }
              // Unrecognized token.
              abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      var get = function (value) {
        var results, hasMembers;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      var update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if (getClass.call(value) == arrayClass) {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        var result, value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}(this));

},{}],82:[function(_dereq_,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}]},{},[1])

(1)
});


}).call(this,_dereq_("g5I+bs"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer)
},{"buffer":3,"g5I+bs":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2RrL1Byb3llY3Rvcy9IYXB0aWNNb2RhbGl0eURyaXZlci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZGsvUHJveWVjdG9zL0hhcHRpY01vZGFsaXR5RHJpdmVyL2luZGV4LmpzIiwiL2hvbWUvZGsvUHJveWVjdG9zL0hhcHRpY01vZGFsaXR5RHJpdmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9ob21lL2RrL1Byb3llY3Rvcy9IYXB0aWNNb2RhbGl0eURyaXZlci9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL2hvbWUvZGsvUHJveWVjdG9zL0hhcHRpY01vZGFsaXR5RHJpdmVyL25vZGVfbW9kdWxlcy9oYW1tZXJqcy9oYW1tZXIuanMiLCIvaG9tZS9kay9Qcm95ZWN0b3MvSGFwdGljTW9kYWxpdHlEcml2ZXIvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCIvaG9tZS9kay9Qcm95ZWN0b3MvSGFwdGljTW9kYWxpdHlEcml2ZXIvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9kay9Qcm95ZWN0b3MvSGFwdGljTW9kYWxpdHlEcml2ZXIvbm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwiL2hvbWUvZGsvUHJveWVjdG9zL0hhcHRpY01vZGFsaXR5RHJpdmVyL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvaG9tZS9kay9Qcm95ZWN0b3MvZ3llcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1aENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDam5FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQUE7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE1a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7O0FBSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdiQTtBQUNBO0FBQ0E7O0FBRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5XQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXRFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXpJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFsS0E7QUFDQTtBQUNBOztBQUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXBKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXJQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXJPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2REE7QUFDQTtBQUNBO0FBQ0E7O0FBSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUF6WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBNzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoICdpbmhlcml0cycgKTtcbnZhciBIYW1tZXIgPSByZXF1aXJlKCAnaGFtbWVyanMnICk7XG52YXIgTW9kYWxpdHlEcml2ZXJDaGFubmVsID0gcmVxdWlyZSggJy4uL2d5ZXMvYnVpbGQvZ3llcycgKS5Nb2RhbGl0eURyaXZlcjtcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0c1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gSGFwdGljTW9kYWxpdHlEcml2ZXI7XG5cbi8qKlxuICogTW9kdWxlIGNvbnRydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBIYXB0aWNNb2RhbGl0eURyaXZlciggb3B0cyApe1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgb3B0cy5lbGVtZW50ID0gb3B0cy5lbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gIG9wdHMuaGFwdGljRXZlbnRzID0gb3B0cy5oYXB0aWNFdmVudHMgfHwgWyAnaG9sZCcsICd0YXAnLCAnZG91YmxldGFwJywgJ2RyYWcnLFxuICAnZHJhZ3N0YXJ0JywgJ2RyYWdlbmQnLCAnZHJhZ3VwJywgJ2RyYWdkb3duJywgJ2RyYWdsZWZ0JywgJ2RyYWdyaWdodCcsXG4gICdzd2lwZScsICdzd2lwZXVwJywgJ3N3aXBlZG93bicsICdzd2lwZWxlZnQnLCAnc3dpcGVyaWdodCcsICd0cmFuc2Zvcm0nLFxuICAndHJhbnNmb3Jtc3RhcnQnLCAndHJhbnNmb3JtZW5kJywgJ3JvdGF0ZScsICdwaW5jaCcsICdwaW5jaGluJywgJ3BpbmNob3V0JyxcbiAgJ3RvdWNoJywgJ3JlbGVhc2UnIF07XG5cbiAgLy8gaW5wdXRcbiAgdGhpcy5nZXN0dXJlID0gSGFtbWVyKCBvcHRzLmVsZW1lbnQsIHtnZXN0dXJlOnRydWV9ICk7XG5cbiAgdGhpcy5nZXN0dXJlLm9uKCBvcHRzLmhhcHRpY0V2ZW50cy5qb2luKCcgJyksIHRoaXMubmV3RXZlbnQuYmluZCh0aGlzKSApO1xuXG4gIC8vIHNvbWUga2luZCBvZiBtb2R1bGUgbmFtZVxuICB0aGlzLmlkID0gJ1dFQkhBUFRJQyc7XG5cbiAgLy8gb3V0cHV0XG4gIHRoaXMudmlicmF0ZSA9IG5hdmlnYXRvci52aWJyYXRlLmJpbmQobmF2aWdhdG9yKSB8fFxuICAgICAgICBuYXZpZ2F0b3Iud2Via2l0VmlicmF0ZS5iaW5kKG5hdmlnYXRvcikgfHxcbiAgICAgICAgbmF2aWdhdG9yLm1velZpYnJhdGUuYmluZChuYXZpZ2F0b3IpIHx8XG4gICAgICAgIG5hdmlnYXRvci5tc1ZpYnJhdGUuYmluZChuYXZpZ2F0b3IpO1xuXG4gIGlmICggdGhpcy52aWJyYXRlICl7XG4gICAgdGhpcy5vbiggJ3N5bnRoZXRpemVkJywgdGhpcy5maXNzaW9uLmJpbmQodGhpcykgKTtcbiAgfVxufVxuXG5pbmhlcml0cyggSGFwdGljTW9kYWxpdHlEcml2ZXIsIE1vZGFsaXR5RHJpdmVyQ2hhbm5lbCApO1xuXG5IYXB0aWNNb2RhbGl0eURyaXZlci5wcm90b3R5cGUuZmlzc2lvbiA9IGZ1bmN0aW9uKCB0aW1lICl7XG4gIHRpbWUgPSB0aW1lIHx8IDEwMDA7XG4gIHZhciBwYXR0ZXJuID0gWzEwMCwzMCwxMDBdO1xuICBwYXR0ZXJuLnB1c2goIHRpbWUgKTtcbiAgY29uc29sZS5sb2coICdIYXB0aWNNRDo6b25GaXNzaW9uICcsIHRpbWUgKTtcbiAgdGhpcy52aWJyYXRlKCBwYXR0ZXJuICk7XG59O1xuXG5IYXB0aWNNb2RhbGl0eURyaXZlci5wcm90b3R5cGUubmV3RXZlbnQgPSBmdW5jdGlvbiggZGF0YSApe1xuICAvLyBNb2RhbGl0eSBEcml2ZXIgRGV2ZWxvcGVyIGNvdWxkIGFkZCBtb3JlIGZ1bmN0aW9uYWxpdHkvcGFyc2luZyBoZXJlLlxuICAvL2NvbnNvbGUubG9nKCAnSGFwdGljTUQ6Om9uU2lnbmFsICcsIGRhdGEgKTtcbiAgdmFyIGdlc3R1cmUgPSB7fTtcbiAgZ2VzdHVyZS5uYW1lID0gZGF0YS50eXBlIHx8ICcnO1xuICBnZXN0dXJlLmRhdGEgPSBkYXRhLmdlc3R1cmUgfHwge307XG4gIHRoaXMuZmlyZSggJ3JlY29nbml6ZWQnLCB7J2dlc3R1cmUnOmRhdGEudHlwZX0gKTtcbn07XG4iLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSClcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzLWFycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxudmFyIGtNYXhMZW5ndGggPSAweDNmZmZmZmZmXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIE5vdGU6XG4gKlxuICogLSBJbXBsZW1lbnRhdGlvbiBtdXN0IHN1cHBvcnQgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMuXG4gKiAgIEZpcmVmb3ggNC0yOSBsYWNrZWQgc3VwcG9ydCwgZml4ZWQgaW4gRmlyZWZveCAzMCsuXG4gKiAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG4gKlxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXkgd2lsbFxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgd2lsbCB3b3JrIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSAoZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgbmV3IFVpbnQ4QXJyYXkoMSkuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gc3ViamVjdCA+IDAgPyBzdWJqZWN0ID4+PiAwIDogMFxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcpXG4gICAgICBzdWJqZWN0ID0gYmFzZTY0Y2xlYW4oc3ViamVjdClcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JyAmJiBzdWJqZWN0ICE9PSBudWxsKSB7IC8vIGFzc3VtZSBvYmplY3QgaXMgYXJyYXktbGlrZVxuICAgIGlmIChzdWJqZWN0LnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkoc3ViamVjdC5kYXRhKSlcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0LmRhdGFcbiAgICBsZW5ndGggPSArc3ViamVjdC5sZW5ndGggPiAwID8gTWF0aC5mbG9vcigrc3ViamVjdC5sZW5ndGgpIDogMFxuICB9IGVsc2VcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHN0YXJ0IHdpdGggbnVtYmVyLCBidWZmZXIsIGFycmF5IG9yIHN0cmluZycpXG5cbiAgaWYgKHRoaXMubGVuZ3RoID4ga01heExlbmd0aClcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKylcbiAgICAgICAgYnVmW2ldID0gKChzdWJqZWN0W2ldICUgMjU2KSArIDI1NikgJSAyNTZcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuICYmIGFbaV0gPT09IGJbaV07IGkrKykge31cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdFssIGxlbmd0aF0pJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0b3RhbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoID4+PiAxXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbi8vIHRvU3RyaW5nKGVuY29kaW5nLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA9PT0gSW5maW5pdHkgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG4gIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmIChlbmQgPD0gc3RhcnQpIHJldHVybiAnJ1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSlcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKGIpIHtcbiAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpXG4gICAgICBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpXG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihieXRlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBiaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aCwgMilcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSB1dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBiaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBhc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuO1xuICAgIGlmIChzdGFydCA8IDApXG4gICAgICBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMClcbiAgICAgIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydClcbiAgICBlbmQgPSBzdGFydFxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpXG4gICAgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGlmICh0YXJnZXRfc3RhcnQgPCAwIHx8IHRhcmdldF9zdGFydCA+PSB0YXJnZXQubGVuZ3RoKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHNvdXJjZS5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiBzb3VyY2UubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSB1dGY4VG9CeXRlcyh2YWx1ZS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmVxdWFscyA9IEJQLmVxdWFsc1xuICBhcnIuY29tcGFyZSA9IEJQLmNvbXBhcmVcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLXpdL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKSB7XG4gICAgICBieXRlQXJyYXkucHVzaChiKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgsIHVuaXRTaXplKSB7XG4gIGlmICh1bml0U2l6ZSkgbGVuZ3RoIC09IGxlbmd0aCAlIHVuaXRTaXplO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cbiIsIi8qISBIYW1tZXIuSlMgLSB2MS4xLjMgLSAyMDE0LTA1LTIwXG4gKiBodHRwOi8vZWlnaHRtZWRpYS5naXRodWIuaW8vaGFtbWVyLmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0IEpvcmlrIFRhbmdlbGRlciA8ai50YW5nZWxkZXJAZ21haWwuY29tPjtcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAqL1xuXG4oZnVuY3Rpb24od2luZG93LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBtYWluXG4gKiBAbW9kdWxlIGhhbW1lclxuICpcbiAqIEBjbGFzcyBIYW1tZXJcbiAqIEBzdGF0aWNcbiAqL1xuXG4vKipcbiAqIEhhbW1lciwgdXNlIHRoaXMgdG8gY3JlYXRlIGluc3RhbmNlc1xuICogYGBgYFxuICogdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKG15RWxlbWVudCk7XG4gKiBgYGBgXG4gKlxuICogQG1ldGhvZCBIYW1tZXJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAqIEByZXR1cm4ge0hhbW1lci5JbnN0YW5jZX1cbiAqL1xudmFyIEhhbW1lciA9IGZ1bmN0aW9uIEhhbW1lcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBIYW1tZXIuSW5zdGFuY2UoZWxlbWVudCwgb3B0aW9ucyB8fCB7fSk7XG59O1xuXG4vKipcbiAqIHZlcnNpb24sIGFzIGRlZmluZWQgaW4gcGFja2FnZS5qc29uXG4gKiB0aGUgdmFsdWUgd2lsbCBiZSBzZXQgYXQgZWFjaCBidWlsZFxuICogQHByb3BlcnR5IFZFUlNJT05cbiAqIEBmaW5hbFxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuSGFtbWVyLlZFUlNJT04gPSAnMS4xLjMnO1xuXG4vKipcbiAqIGRlZmF1bHQgc2V0dGluZ3MuXG4gKiBtb3JlIHNldHRpbmdzIGFyZSBkZWZpbmVkIHBlciBnZXN0dXJlIGF0IGAvZ2VzdHVyZXNgLiBFYWNoIGdlc3R1cmUgY2FuIGJlIGRpc2FibGVkL2VuYWJsZWRcbiAqIGJ5IHNldHRpbmcgaXQncyBuYW1lIChsaWtlIGBzd2lwZWApIHRvIGZhbHNlLlxuICogWW91IGNhbiBzZXQgdGhlIGRlZmF1bHRzIGZvciBhbGwgaW5zdGFuY2VzIGJ5IGNoYW5naW5nIHRoaXMgb2JqZWN0IGJlZm9yZSBjcmVhdGluZyBhbiBpbnN0YW5jZS5cbiAqIEBleGFtcGxlXG4gKiBgYGBgXG4gKiAgSGFtbWVyLmRlZmF1bHRzLmRyYWcgPSBmYWxzZTtcbiAqICBIYW1tZXIuZGVmYXVsdHMuYmVoYXZpb3IudG91Y2hBY3Rpb24gPSAncGFuLXknO1xuICogIGRlbGV0ZSBIYW1tZXIuZGVmYXVsdHMuYmVoYXZpb3IudXNlclNlbGVjdDtcbiAqIGBgYGBcbiAqIEBwcm9wZXJ0eSBkZWZhdWx0c1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuSGFtbWVyLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIHRoaXMgc2V0dGluZyBvYmplY3QgYWRkcyBzdHlsZXMgYW5kIGF0dHJpYnV0ZXMgdG8gdGhlIGVsZW1lbnQgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIGRvaW5nXG4gICAgICogaXRzIG5hdGl2ZSBiZWhhdmlvci4gVGhlIGNzcyBwcm9wZXJ0aWVzIGFyZSBhdXRvIHByZWZpeGVkIGZvciB0aGUgYnJvd3NlcnMgd2hlbiBuZWVkZWQuXG4gICAgICogQHByb3BlcnR5IGRlZmF1bHRzLmJlaGF2aW9yXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBiZWhhdmlvcjoge1xuICAgICAgICAvKipcbiAgICAgICAgICogRGlzYWJsZXMgdGV4dCBzZWxlY3Rpb24gdG8gaW1wcm92ZSB0aGUgZHJhZ2dpbmcgZ2VzdHVyZS4gV2hlbiB0aGUgdmFsdWUgaXMgYG5vbmVgIGl0IGFsc28gc2V0c1xuICAgICAgICAgKiBgb25zZWxlY3RzdGFydD1mYWxzZWAgZm9yIElFIG9uIHRoZSBlbGVtZW50LiBNYWlubHkgZm9yIGRlc2t0b3AgYnJvd3NlcnMuXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWZhdWx0cy5iZWhhdmlvci51c2VyU2VsZWN0XG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTcGVjaWZpZXMgd2hldGhlciBhbmQgaG93IGEgZ2l2ZW4gcmVnaW9uIGNhbiBiZSBtYW5pcHVsYXRlZCBieSB0aGUgdXNlciAoZm9yIGluc3RhbmNlLCBieSBwYW5uaW5nIG9yIHpvb21pbmcpLlxuICAgICAgICAgKiBVc2VkIGJ5IENocm9tZSAzNT4gYW5kIElFMTA+LiBCeSBkZWZhdWx0IHRoaXMgbWFrZXMgdGhlIGVsZW1lbnQgYmxvY2tpbmcgYW55IHRvdWNoIGV2ZW50LlxuICAgICAgICAgKiBAcHJvcGVydHkgZGVmYXVsdHMuYmVoYXZpb3IudG91Y2hBY3Rpb25cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQ6ICdwYW4teSdcbiAgICAgICAgICovXG4gICAgICAgIHRvdWNoQWN0aW9uOiAncGFuLXknLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0aGUgZGVmYXVsdCBjYWxsb3V0IHNob3duIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0LlxuICAgICAgICAgKiBPbiBpT1MsIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0IHN1Y2ggYXMgYSBsaW5rLCBTYWZhcmkgZGlzcGxheXNcbiAgICAgICAgICogYSBjYWxsb3V0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmsuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHlvdSB0byBkaXNhYmxlIHRoYXQgY2FsbG91dC5cbiAgICAgICAgICogQHByb3BlcnR5IGRlZmF1bHRzLmJlaGF2aW9yLnRvdWNoQ2FsbG91dFxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcbiAgICAgICAgICovXG4gICAgICAgIHRvdWNoQ2FsbG91dDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTcGVjaWZpZXMgd2hldGhlciB6b29taW5nIGlzIGVuYWJsZWQuIFVzZWQgYnkgSUUxMD5cbiAgICAgICAgICogQHByb3BlcnR5IGRlZmF1bHRzLmJlaGF2aW9yLmNvbnRlbnRab29taW5nXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgY29udGVudFpvb21pbmc6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHRoYXQgYW4gZW50aXJlIGVsZW1lbnQgc2hvdWxkIGJlIGRyYWdnYWJsZSBpbnN0ZWFkIG9mIGl0cyBjb250ZW50cy5cbiAgICAgICAgICogTWFpbmx5IGZvciBkZXNrdG9wIGJyb3dzZXJzLlxuICAgICAgICAgKiBAcHJvcGVydHkgZGVmYXVsdHMuYmVoYXZpb3IudXNlckRyYWdcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB1c2VyRHJhZzogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPdmVycmlkZXMgdGhlIGhpZ2hsaWdodCBjb2xvciBzaG93biB3aGVuIHRoZSB1c2VyIHRhcHMgYSBsaW5rIG9yIGEgSmF2YVNjcmlwdFxuICAgICAgICAgKiBjbGlja2FibGUgZWxlbWVudCBpbiBTYWZhcmkgb24gaVBob25lLiBUaGlzIHByb3BlcnR5IG9iZXlzIHRoZSBhbHBoYSB2YWx1ZSwgaWYgc3BlY2lmaWVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBJZiB5b3UgZG9uJ3Qgc3BlY2lmeSBhbiBhbHBoYSB2YWx1ZSwgU2FmYXJpIG9uIGlQaG9uZSBhcHBsaWVzIGEgZGVmYXVsdCBhbHBoYSB2YWx1ZVxuICAgICAgICAgKiB0byB0aGUgY29sb3IuIFRvIGRpc2FibGUgdGFwIGhpZ2hsaWdodGluZywgc2V0IHRoZSBhbHBoYSB2YWx1ZSB0byAwIChpbnZpc2libGUpLlxuICAgICAgICAgKiBJZiB5b3Ugc2V0IHRoZSBhbHBoYSB2YWx1ZSB0byAxLjAgKG9wYXF1ZSksIHRoZSBlbGVtZW50IGlzIG5vdCB2aXNpYmxlIHdoZW4gdGFwcGVkLlxuICAgICAgICAgKiBAcHJvcGVydHkgZGVmYXVsdHMuYmVoYXZpb3IudGFwSGlnaGxpZ2h0Q29sb3JcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ3JnYmEoMCwwLDAsMCknXG4gICAgICAgICAqL1xuICAgICAgICB0YXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknXG4gICAgfVxufTtcblxuLyoqXG4gKiBoYW1tZXIgZG9jdW1lbnQgd2hlcmUgdGhlIGJhc2UgZXZlbnRzIGFyZSBhZGRlZCBhdFxuICogQHByb3BlcnR5IERPQ1VNRU5UXG4gKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gKiBAZGVmYXVsdCB3aW5kb3cuZG9jdW1lbnRcbiAqL1xuSGFtbWVyLkRPQ1VNRU5UID0gZG9jdW1lbnQ7XG5cbi8qKlxuICogZGV0ZWN0IHN1cHBvcnQgZm9yIHBvaW50ZXIgZXZlbnRzXG4gKiBAcHJvcGVydHkgSEFTX1BPSU5URVJFVkVOVFNcbiAqIEB0eXBlIHtCb29sZWFufVxuICovXG5IYW1tZXIuSEFTX1BPSU5URVJFVkVOVFMgPSBuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgfHwgbmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQ7XG5cbi8qKlxuICogZGV0ZWN0IHN1cHBvcnQgZm9yIHRvdWNoIGV2ZW50c1xuICogQHByb3BlcnR5IEhBU19UT1VDSEVWRU5UU1xuICogQHR5cGUge0Jvb2xlYW59XG4gKi9cbkhhbW1lci5IQVNfVE9VQ0hFVkVOVFMgPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcblxuLyoqXG4gKiBkZXRlY3QgbW9iaWxlIGJyb3dzZXJzXG4gKiBAcHJvcGVydHkgSVNfTU9CSUxFXG4gKiBAdHlwZSB7Qm9vbGVhbn1cbiAqL1xuSGFtbWVyLklTX01PQklMRSA9IC9tb2JpbGV8dGFibGV0fGlwKGFkfGhvbmV8b2QpfGFuZHJvaWR8c2lsay9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbi8qKlxuICogZGV0ZWN0IGlmIHdlIHdhbnQgdG8gc3VwcG9ydCBtb3VzZWV2ZW50cyBhdCBhbGxcbiAqIEBwcm9wZXJ0eSBOT19NT1VTRUVWRU5UU1xuICogQHR5cGUge0Jvb2xlYW59XG4gKi9cbkhhbW1lci5OT19NT1VTRUVWRU5UUyA9IChIYW1tZXIuSEFTX1RPVUNIRVZFTlRTICYmIEhhbW1lci5JU19NT0JJTEUpIHx8IEhhbW1lci5IQVNfUE9JTlRFUkVWRU5UUztcblxuLyoqXG4gKiBpbnRlcnZhbCBpbiB3aGljaCBIYW1tZXIgcmVjYWxjdWxhdGVzIGN1cnJlbnQgdmVsb2NpdHkvZGlyZWN0aW9uL2FuZ2xlIGluIG1zXG4gKiBAcHJvcGVydHkgQ0FMQ1VMQVRFX0lOVEVSVkFMXG4gKiBAdHlwZSB7TnVtYmVyfVxuICogQGRlZmF1bHQgMjVcbiAqL1xuSGFtbWVyLkNBTENVTEFURV9JTlRFUlZBTCA9IDI1O1xuXG4vKipcbiAqIGV2ZW50dHlwZXMgcGVyIHRvdWNoZXZlbnQgKHN0YXJ0LCBtb3ZlLCBlbmQpIGFyZSBmaWxsZWQgYnkgYEV2ZW50LmRldGVybWluZUV2ZW50VHlwZXNgIG9uIGBzZXR1cGBcbiAqIHRoZSBvYmplY3QgY29udGFpbnMgdGhlIERPTSBldmVudCBuYW1lcyBwZXIgdHlwZSAoYEVWRU5UX1NUQVJUYCwgYEVWRU5UX01PVkVgLCBgRVZFTlRfRU5EYClcbiAqIEBwcm9wZXJ0eSBFVkVOVF9UWVBFU1xuICogQHByaXZhdGVcbiAqIEB3cml0ZU9uY2VcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBFVkVOVF9UWVBFUyA9IHt9O1xuXG4vKipcbiAqIGRpcmVjdGlvbiBzdHJpbmdzLCBmb3Igc2FmZSBjb21wYXJpc29uc1xuICogQHByb3BlcnR5IERJUkVDVElPTl9ET1dOfExFRlR8VVB8UklHSFRcbiAqIEBmaW5hbFxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZWZhdWx0ICdkb3duJyAnbGVmdCcgJ3VwJyAncmlnaHQnXG4gKi9cbnZhciBESVJFQ1RJT05fRE9XTiA9IEhhbW1lci5ESVJFQ1RJT05fRE9XTiA9ICdkb3duJztcbnZhciBESVJFQ1RJT05fTEVGVCA9IEhhbW1lci5ESVJFQ1RJT05fTEVGVCA9ICdsZWZ0JztcbnZhciBESVJFQ1RJT05fVVAgPSBIYW1tZXIuRElSRUNUSU9OX1VQID0gJ3VwJztcbnZhciBESVJFQ1RJT05fUklHSFQgPSBIYW1tZXIuRElSRUNUSU9OX1JJR0hUID0gJ3JpZ2h0JztcblxuLyoqXG4gKiBwb2ludGVydHlwZSBzdHJpbmdzLCBmb3Igc2FmZSBjb21wYXJpc29uc1xuICogQHByb3BlcnR5IFBPSU5URVJfTU9VU0V8VE9VQ0h8UEVOXG4gKiBAZmluYWxcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVmYXVsdCAnbW91c2UnICd0b3VjaCcgJ3BlbidcbiAqL1xudmFyIFBPSU5URVJfTU9VU0UgPSBIYW1tZXIuUE9JTlRFUl9NT1VTRSA9ICdtb3VzZSc7XG52YXIgUE9JTlRFUl9UT1VDSCA9IEhhbW1lci5QT0lOVEVSX1RPVUNIID0gJ3RvdWNoJztcbnZhciBQT0lOVEVSX1BFTiA9IEhhbW1lci5QT0lOVEVSX1BFTiA9ICdwZW4nO1xuXG4vKipcbiAqIGV2ZW50dHlwZXNcbiAqIEBwcm9wZXJ0eSBFVkVOVF9TVEFSVHxNT1ZFfEVORHxSRUxFQVNFfFRPVUNIXG4gKiBAZmluYWxcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVmYXVsdCAnc3RhcnQnICdjaGFuZ2UnICdtb3ZlJyAnZW5kJyAncmVsZWFzZScgJ3RvdWNoJ1xuICovXG52YXIgRVZFTlRfU1RBUlQgPSBIYW1tZXIuRVZFTlRfU1RBUlQgPSAnc3RhcnQnO1xudmFyIEVWRU5UX01PVkUgPSBIYW1tZXIuRVZFTlRfTU9WRSA9ICdtb3ZlJztcbnZhciBFVkVOVF9FTkQgPSBIYW1tZXIuRVZFTlRfRU5EID0gJ2VuZCc7XG52YXIgRVZFTlRfUkVMRUFTRSA9IEhhbW1lci5FVkVOVF9SRUxFQVNFID0gJ3JlbGVhc2UnO1xudmFyIEVWRU5UX1RPVUNIID0gSGFtbWVyLkVWRU5UX1RPVUNIID0gJ3RvdWNoJztcblxuLyoqXG4gKiBpZiB0aGUgd2luZG93IGV2ZW50cyBhcmUgc2V0Li4uXG4gKiBAcHJvcGVydHkgUkVBRFlcbiAqIEB3cml0ZU9uY2VcbiAqIEB0eXBlIHtCb29sZWFufVxuICogQGRlZmF1bHQgZmFsc2VcbiAqL1xuSGFtbWVyLlJFQURZID0gZmFsc2U7XG5cbi8qKlxuICogcGx1Z2lucyBuYW1lc3BhY2VcbiAqIEBwcm9wZXJ0eSBwbHVnaW5zXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5IYW1tZXIucGx1Z2lucyA9IEhhbW1lci5wbHVnaW5zIHx8IHt9O1xuXG4vKipcbiAqIGdlc3R1cmVzIG5hbWVzcGFjZVxuICogc2VlIGAvZ2VzdHVyZXNgIGZvciB0aGUgZGVmaW5pdGlvbnNcbiAqIEBwcm9wZXJ0eSBnZXN0dXJlc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuSGFtbWVyLmdlc3R1cmVzID0gSGFtbWVyLmdlc3R1cmVzIHx8IHt9O1xuXG4vKipcbiAqIHNldHVwIGV2ZW50cyB0byBkZXRlY3QgZ2VzdHVyZXMgb24gdGhlIGRvY3VtZW50XG4gKiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIGNyZWF0aW5nIGFuIG5ldyBpbnN0YW5jZVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgaWYoSGFtbWVyLlJFQURZKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmaW5kIHdoYXQgZXZlbnR0eXBlcyB3ZSBhZGQgbGlzdGVuZXJzIHRvXG4gICAgRXZlbnQuZGV0ZXJtaW5lRXZlbnRUeXBlcygpO1xuXG4gICAgLy8gUmVnaXN0ZXIgYWxsIGdlc3R1cmVzIGluc2lkZSBIYW1tZXIuZ2VzdHVyZXNcbiAgICBVdGlscy5lYWNoKEhhbW1lci5nZXN0dXJlcywgZnVuY3Rpb24oZ2VzdHVyZSkge1xuICAgICAgICBEZXRlY3Rpb24ucmVnaXN0ZXIoZ2VzdHVyZSk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgdG91Y2ggZXZlbnRzIG9uIHRoZSBkb2N1bWVudFxuICAgIEV2ZW50Lm9uVG91Y2goSGFtbWVyLkRPQ1VNRU5ULCBFVkVOVF9NT1ZFLCBEZXRlY3Rpb24uZGV0ZWN0KTtcbiAgICBFdmVudC5vblRvdWNoKEhhbW1lci5ET0NVTUVOVCwgRVZFTlRfRU5ELCBEZXRlY3Rpb24uZGV0ZWN0KTtcblxuICAgIC8vIEhhbW1lciBpcyByZWFkeS4uLiFcbiAgICBIYW1tZXIuUkVBRFkgPSB0cnVlO1xufVxuXG4vKipcbiAqIEBtb2R1bGUgaGFtbWVyXG4gKlxuICogQGNsYXNzIFV0aWxzXG4gKiBAc3RhdGljXG4gKi9cbnZhciBVdGlscyA9IEhhbW1lci51dGlscyA9IHtcbiAgICAvKipcbiAgICAgKiBleHRlbmQgbWV0aG9kLCBjb3VsZCBhbHNvIGJlIHVzZWQgZm9yIGNsb25pbmcgd2hlbiBgZGVzdGAgaXMgYW4gZW1wdHkgb2JqZWN0LlxuICAgICAqIGNoYW5nZXMgdGhlIGRlc3Qgb2JqZWN0XG4gICAgICogQG1ldGhvZCBleHRlbmRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVzdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFttZXJnZT1mYWxzZV0gIGRvIGEgbWVyZ2VcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IGRlc3RcbiAgICAgKi9cbiAgICBleHRlbmQ6IGZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMsIG1lcmdlKSB7XG4gICAgICAgIGZvcih2YXIga2V5IGluIHNyYykge1xuICAgICAgICAgICAgaWYoIXNyYy5oYXNPd25Qcm9wZXJ0eShrZXkpIHx8IChkZXN0W2tleV0gIT09IHVuZGVmaW5lZCAmJiBtZXJnZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlc3Rba2V5XSA9IHNyY1trZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzaW1wbGUgYWRkRXZlbnRMaXN0ZW5lciB3cmFwcGVyXG4gICAgICogQG1ldGhvZCBvblxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24gb24oZWxlbWVudCwgdHlwZSwgaGFuZGxlcikge1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzaW1wbGUgcmVtb3ZlRXZlbnRMaXN0ZW5lciB3cmFwcGVyXG4gICAgICogQG1ldGhvZCBvZmZcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAgICovXG4gICAgb2ZmOiBmdW5jdGlvbiBvZmYoZWxlbWVudCwgdHlwZSwgaGFuZGxlcikge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBmb3JFYWNoIG92ZXIgYXJyYXlzIGFuZCBvYmplY3RzXG4gICAgICogQG1ldGhvZCBlYWNoXG4gICAgICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9ialxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAgICogQHBhcmFtIHthbnl9IGl0ZXJhdG9yLml0ZW1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaXRlcmF0b3IuaW5kZXhcbiAgICAgKiBAcGFyYW0ge09iamVjdHxBcnJheX0gaXRlcmF0b3Iub2JqIHRoZSBzb3VyY2Ugb2JqZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgdmFsdWUgdG8gdXNlIGFzIGB0aGlzYCBpbiB0aGUgaXRlcmF0b3JcbiAgICAgKi9cbiAgICBlYWNoOiBmdW5jdGlvbiBlYWNoKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGksIGxlbjtcblxuICAgICAgICAvLyBuYXRpdmUgZm9yRWFjaCBvbiBhcnJheXNcbiAgICAgICAgaWYoJ2ZvckVhY2gnIGluIG9iaikge1xuICAgICAgICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgICAvLyBhcnJheXNcbiAgICAgICAgfSBlbHNlIGlmKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yKGkgPSAwLCBsZW4gPSBvYmoubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgLy8gb2JqZWN0c1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yKGkgaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYob2JqLmhhc093blByb3BlcnR5KGkpICYmXG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGZpbmQgaWYgYSBzdHJpbmcgY29udGFpbnMgdGhlIHN0cmluZyB1c2luZyBpbmRleE9mXG4gICAgICogQG1ldGhvZCBpblN0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcmNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmluZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IGZvdW5kXG4gICAgICovXG4gICAgaW5TdHI6IGZ1bmN0aW9uIGluU3RyKHNyYywgZmluZCkge1xuICAgICAgICByZXR1cm4gc3JjLmluZGV4T2YoZmluZCkgPiAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZmluZCBpZiBhIGFycmF5IGNvbnRhaW5zIHRoZSBvYmplY3QgdXNpbmcgaW5kZXhPZiBvciBhIHNpbXBsZSBwb2x5ZmlsbFxuICAgICAqIEBtZXRob2QgaW5BcnJheVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzcmNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmluZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW58TnVtYmVyfSBmYWxzZSB3aGVuIG5vdCBmb3VuZCwgb3IgdGhlIGluZGV4XG4gICAgICovXG4gICAgaW5BcnJheTogZnVuY3Rpb24gaW5BcnJheShzcmMsIGZpbmQpIHtcbiAgICAgICAgaWYoc3JjLmluZGV4T2YpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHNyYy5pbmRleE9mKGZpbmQpO1xuICAgICAgICAgICAgcmV0dXJuIChpbmRleCA9PT0gLTEpID8gZmFsc2UgOiBpbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHNyYy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmKHNyY1tpXSA9PT0gZmluZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY29udmVydCBhbiBhcnJheS1saWtlIG9iamVjdCAoYGFyZ3VtZW50c2AsIGB0b3VjaGxpc3RgKSB0byBhbiBhcnJheVxuICAgICAqIEBtZXRob2QgdG9BcnJheVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICB0b0FycmF5OiBmdW5jdGlvbiB0b0FycmF5KG9iaikge1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqLCAwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZmluZCBpZiBhIG5vZGUgaXMgaW4gdGhlIGdpdmVuIHBhcmVudFxuICAgICAqIEBtZXRob2QgaGFzUGFyZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmVudFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IGZvdW5kXG4gICAgICovXG4gICAgaGFzUGFyZW50OiBmdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XG4gICAgICAgIHdoaWxlKG5vZGUpIHtcbiAgICAgICAgICAgIGlmKG5vZGUgPT0gcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHRoZSBjZW50ZXIgb2YgYWxsIHRoZSB0b3VjaGVzXG4gICAgICogQG1ldGhvZCBnZXRDZW50ZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB0b3VjaGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBjZW50ZXIgY29udGFpbnMgYHBhZ2VYYCwgYHBhZ2VZYCwgYGNsaWVudFhgIGFuZCBgY2xpZW50WWAgcHJvcGVydGllc1xuICAgICAqL1xuICAgIGdldENlbnRlcjogZnVuY3Rpb24gZ2V0Q2VudGVyKHRvdWNoZXMpIHtcbiAgICAgICAgdmFyIHBhZ2VYID0gW10sXG4gICAgICAgICAgICBwYWdlWSA9IFtdLFxuICAgICAgICAgICAgY2xpZW50WCA9IFtdLFxuICAgICAgICAgICAgY2xpZW50WSA9IFtdLFxuICAgICAgICAgICAgbWluID0gTWF0aC5taW4sXG4gICAgICAgICAgICBtYXggPSBNYXRoLm1heDtcblxuICAgICAgICAvLyBubyBuZWVkIHRvIGxvb3Agd2hlbiBvbmx5IG9uZSB0b3VjaFxuICAgICAgICBpZih0b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYWdlWDogdG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgICAgICAgICBwYWdlWTogdG91Y2hlc1swXS5wYWdlWSxcbiAgICAgICAgICAgICAgICBjbGllbnRYOiB0b3VjaGVzWzBdLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgY2xpZW50WTogdG91Y2hlc1swXS5jbGllbnRZXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgVXRpbHMuZWFjaCh0b3VjaGVzLCBmdW5jdGlvbih0b3VjaCkge1xuICAgICAgICAgICAgcGFnZVgucHVzaCh0b3VjaC5wYWdlWCk7XG4gICAgICAgICAgICBwYWdlWS5wdXNoKHRvdWNoLnBhZ2VZKTtcbiAgICAgICAgICAgIGNsaWVudFgucHVzaCh0b3VjaC5jbGllbnRYKTtcbiAgICAgICAgICAgIGNsaWVudFkucHVzaCh0b3VjaC5jbGllbnRZKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhZ2VYOiAobWluLmFwcGx5KE1hdGgsIHBhZ2VYKSArIG1heC5hcHBseShNYXRoLCBwYWdlWCkpIC8gMixcbiAgICAgICAgICAgIHBhZ2VZOiAobWluLmFwcGx5KE1hdGgsIHBhZ2VZKSArIG1heC5hcHBseShNYXRoLCBwYWdlWSkpIC8gMixcbiAgICAgICAgICAgIGNsaWVudFg6IChtaW4uYXBwbHkoTWF0aCwgY2xpZW50WCkgKyBtYXguYXBwbHkoTWF0aCwgY2xpZW50WCkpIC8gMixcbiAgICAgICAgICAgIGNsaWVudFk6IChtaW4uYXBwbHkoTWF0aCwgY2xpZW50WSkgKyBtYXguYXBwbHkoTWF0aCwgY2xpZW50WSkpIC8gMlxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxjdWxhdGUgdGhlIHZlbG9jaXR5IGJldHdlZW4gdHdvIHBvaW50cy4gdW5pdCBpcyBpbiBweCBwZXIgbXMuXG4gICAgICogQG1ldGhvZCBnZXRWZWxvY2l0eVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVRpbWVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFYXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhWVxuICAgICAqIEByZXR1cm4ge09iamVjdH0gdmVsb2NpdHkgYHhgIGFuZCBgeWBcbiAgICAgKi9cbiAgICBnZXRWZWxvY2l0eTogZnVuY3Rpb24gZ2V0VmVsb2NpdHkoZGVsdGFUaW1lLCBkZWx0YVgsIGRlbHRhWSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogTWF0aC5hYnMoZGVsdGFYIC8gZGVsdGFUaW1lKSB8fCAwLFxuICAgICAgICAgICAgeTogTWF0aC5hYnMoZGVsdGFZIC8gZGVsdGFUaW1lKSB8fCAwXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNhbGN1bGF0ZSB0aGUgYW5nbGUgYmV0d2VlbiB0d28gY29vcmRpbmF0ZXNcbiAgICAgKiBAbWV0aG9kIGdldEFuZ2xlXG4gICAgICogQHBhcmFtIHtUb3VjaH0gdG91Y2gxXG4gICAgICogQHBhcmFtIHtUb3VjaH0gdG91Y2gyXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGdldEFuZ2xlOiBmdW5jdGlvbiBnZXRBbmdsZSh0b3VjaDEsIHRvdWNoMikge1xuICAgICAgICB2YXIgeCA9IHRvdWNoMi5jbGllbnRYIC0gdG91Y2gxLmNsaWVudFgsXG4gICAgICAgICAgICB5ID0gdG91Y2gyLmNsaWVudFkgLSB0b3VjaDEuY2xpZW50WTtcblxuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih5LCB4KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRvIGEgc21hbGwgY29tcGFyaXNpb24gdG8gZ2V0IHRoZSBkaXJlY3Rpb24gYmV0d2VlbiB0d28gdG91Y2hlcy5cbiAgICAgKiBAbWV0aG9kIGdldERpcmVjdGlvblxuICAgICAqIEBwYXJhbSB7VG91Y2h9IHRvdWNoMVxuICAgICAqIEBwYXJhbSB7VG91Y2h9IHRvdWNoMlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gZGlyZWN0aW9uIG1hdGNoZXMgYERJUkVDVElPTl9MRUZUfFJJR0hUfFVQfERPV05gXG4gICAgICovXG4gICAgZ2V0RGlyZWN0aW9uOiBmdW5jdGlvbiBnZXREaXJlY3Rpb24odG91Y2gxLCB0b3VjaDIpIHtcbiAgICAgICAgdmFyIHggPSBNYXRoLmFicyh0b3VjaDEuY2xpZW50WCAtIHRvdWNoMi5jbGllbnRYKSxcbiAgICAgICAgICAgIHkgPSBNYXRoLmFicyh0b3VjaDEuY2xpZW50WSAtIHRvdWNoMi5jbGllbnRZKTtcblxuICAgICAgICBpZih4ID49IHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0b3VjaDEuY2xpZW50WCAtIHRvdWNoMi5jbGllbnRYID4gMCA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b3VjaDEuY2xpZW50WSAtIHRvdWNoMi5jbGllbnRZID4gMCA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHRvdWNoZXNcbiAgICAgKiBAbWV0aG9kIGdldERpc3RhbmNlXG4gICAgICogQHBhcmFtIHtUb3VjaH10b3VjaDFcbiAgICAgKiBAcGFyYW0ge1RvdWNofSB0b3VjaDJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXG4gICAgICovXG4gICAgZ2V0RGlzdGFuY2U6IGZ1bmN0aW9uIGdldERpc3RhbmNlKHRvdWNoMSwgdG91Y2gyKSB7XG4gICAgICAgIHZhciB4ID0gdG91Y2gyLmNsaWVudFggLSB0b3VjaDEuY2xpZW50WCxcbiAgICAgICAgICAgIHkgPSB0b3VjaDIuY2xpZW50WSAtIHRvdWNoMS5jbGllbnRZO1xuXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoKHggKiB4KSArICh5ICogeSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxjdWxhdGUgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHR3byB0b3VjaExpc3RzXG4gICAgICogbm8gc2NhbGUgaXMgMSwgYW5kIGdvZXMgZG93biB0byAwIHdoZW4gcGluY2hlZCB0b2dldGhlciwgYW5kIGJpZ2dlciB3aGVuIHBpbmNoZWQgb3V0XG4gICAgICogQG1ldGhvZCBnZXRTY2FsZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0IGFycmF5IG9mIHRvdWNoZXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgdG91Y2hlc1xuICAgICAqIEByZXR1cm4ge051bWJlcn0gc2NhbGVcbiAgICAgKi9cbiAgICBnZXRTY2FsZTogZnVuY3Rpb24gZ2V0U2NhbGUoc3RhcnQsIGVuZCkge1xuICAgICAgICAvLyBuZWVkIHR3byBmaW5nZXJzLi4uXG4gICAgICAgIGlmKHN0YXJ0Lmxlbmd0aCA+PSAyICYmIGVuZC5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGlzdGFuY2UoZW5kWzBdLCBlbmRbMV0pIC8gdGhpcy5nZXREaXN0YW5jZShzdGFydFswXSwgc3RhcnRbMV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxjdWxhdGUgdGhlIHJvdGF0aW9uIGRlZ3JlZXMgYmV0d2VlbiB0d28gdG91Y2hMaXN0c1xuICAgICAqIEBtZXRob2QgZ2V0Um90YXRpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBzdGFydCBhcnJheSBvZiB0b3VjaGVzXG4gICAgICogQHBhcmFtIHtBcnJheX0gZW5kIGFycmF5IG9mIHRvdWNoZXNcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHJvdGF0aW9uXG4gICAgICovXG4gICAgZ2V0Um90YXRpb246IGZ1bmN0aW9uIGdldFJvdGF0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgLy8gbmVlZCB0d28gZmluZ2Vyc1xuICAgICAgICBpZihzdGFydC5sZW5ndGggPj0gMiAmJiBlbmQubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEFuZ2xlKGVuZFsxXSwgZW5kWzBdKSAtIHRoaXMuZ2V0QW5nbGUoc3RhcnRbMV0sIHN0YXJ0WzBdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZmluZCBvdXQgaWYgdGhlIGRpcmVjdGlvbiBpcyB2ZXJ0aWNhbCAgICpcbiAgICAgKiBAbWV0aG9kIGlzVmVydGljYWxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIG1hdGNoZXMgYERJUkVDVElPTl9VUHxET1dOYFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IGlzX3ZlcnRpY2FsXG4gICAgICovXG4gICAgaXNWZXJ0aWNhbDogZnVuY3Rpb24gaXNWZXJ0aWNhbChkaXJlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGlvbiA9PSBESVJFQ1RJT05fVVAgfHwgZGlyZWN0aW9uID09IERJUkVDVElPTl9ET1dOO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgY3NzIHByb3BlcnRpZXMgd2l0aCB0aGVpciBwcmVmaXhlc1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3RvZ2dsZT10cnVlXVxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgc2V0UHJlZml4ZWRDc3M6IGZ1bmN0aW9uIHNldFByZWZpeGVkQ3NzKGVsZW1lbnQsIHByb3AsIHZhbHVlLCB0b2dnbGUpIHtcbiAgICAgICAgdmFyIHByZWZpeGVzID0gWycnLCAnV2Via2l0JywgJ01veicsICdPJywgJ21zJ107XG4gICAgICAgIHByb3AgPSBVdGlscy50b0NhbWVsQ2FzZShwcm9wKTtcblxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwID0gcHJvcDtcbiAgICAgICAgICAgIC8vIHByZWZpeGVzXG4gICAgICAgICAgICBpZihwcmVmaXhlc1tpXSkge1xuICAgICAgICAgICAgICAgIHAgPSBwcmVmaXhlc1tpXSArIHAuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArIHAuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRlc3QgdGhlIHN0eWxlXG4gICAgICAgICAgICBpZihwIGluIGVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3BdID0gKHRvZ2dsZSA9PSBudWxsIHx8IHRvZ2dsZSkgJiYgdmFsdWUgfHwgJyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdG9nZ2xlIGJyb3dzZXIgZGVmYXVsdCBiZWhhdmlvciBieSBzZXR0aW5nIGNzcyBwcm9wZXJ0aWVzLlxuICAgICAqIGB1c2VyU2VsZWN0PSdub25lJ2AgYWxzbyBzZXRzIGBlbGVtZW50Lm9uc2VsZWN0c3RhcnRgIHRvIGZhbHNlXG4gICAgICogYHVzZXJEcmFnPSdub25lJ2AgYWxzbyBzZXRzIGBlbGVtZW50Lm9uZHJhZ3N0YXJ0YCB0byBmYWxzZVxuICAgICAqXG4gICAgICogQG1ldGhvZCB0b2dnbGVCZWhhdmlvclxuICAgICAqIEBwYXJhbSB7SHRtbEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt0b2dnbGU9dHJ1ZV1cbiAgICAgKi9cbiAgICB0b2dnbGVCZWhhdmlvcjogZnVuY3Rpb24gdG9nZ2xlQmVoYXZpb3IoZWxlbWVudCwgcHJvcHMsIHRvZ2dsZSkge1xuICAgICAgICBpZighcHJvcHMgfHwgIWVsZW1lbnQgfHwgIWVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgY3NzIHByb3BlcnRpZXNcbiAgICAgICAgVXRpbHMuZWFjaChwcm9wcywgZnVuY3Rpb24odmFsdWUsIHByb3ApIHtcbiAgICAgICAgICAgIFV0aWxzLnNldFByZWZpeGVkQ3NzKGVsZW1lbnQsIHByb3AsIHZhbHVlLCB0b2dnbGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZmFsc2VGbiA9IHRvZ2dsZSAmJiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBhbHNvIHRoZSBkaXNhYmxlIG9uc2VsZWN0c3RhcnRcbiAgICAgICAgaWYocHJvcHMudXNlclNlbGVjdCA9PSAnbm9uZScpIHtcbiAgICAgICAgICAgIGVsZW1lbnQub25zZWxlY3RzdGFydCA9IGZhbHNlRm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYW5kIGRpc2FibGUgb25kcmFnc3RhcnRcbiAgICAgICAgaWYocHJvcHMudXNlckRyYWcgPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm9uZHJhZ3N0YXJ0ID0gZmFsc2VGbjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjb252ZXJ0IGEgc3RyaW5nIHdpdGggdW5kZXJzY29yZXMgdG8gY2FtZWxDYXNlXG4gICAgICogc28gcHJldmVudF9kZWZhdWx0IGJlY29tZXMgcHJldmVudERlZmF1bHRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAgICogQHJldHVybiB7U3RyaW5nfSBjYW1lbENhc2VTdHJcbiAgICAgKi9cbiAgICB0b0NhbWVsQ2FzZTogZnVuY3Rpb24gdG9DYW1lbENhc2Uoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvW18tXShbYS16XSkvZywgZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIHNbMV0udG9VcHBlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuXG4vKipcbiAqIEBtb2R1bGUgaGFtbWVyXG4gKi9cbi8qKlxuICogQGNsYXNzIEV2ZW50XG4gKiBAc3RhdGljXG4gKi9cbnZhciBFdmVudCA9IEhhbW1lci5ldmVudCA9IHtcbiAgICAvKipcbiAgICAgKiB3aGVuIHRvdWNoIGV2ZW50cyBoYXZlIGJlZW4gZmlyZWQsIHRoaXMgaXMgdHJ1ZVxuICAgICAqIHRoaXMgaXMgdXNlZCB0byBzdG9wIG1vdXNlIGV2ZW50c1xuICAgICAqIEBwcm9wZXJ0eSBwcmV2ZW50X21vdXNlZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBwcmV2ZW50TW91c2VFdmVudHM6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogaWYgRVZFTlRfU1RBUlQgaGFzIGJlZW4gZmlyZWRcbiAgICAgKiBAcHJvcGVydHkgc3RhcnRlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgc3RhcnRlZDogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiB3aGVuIHRoZSBtb3VzZSBpcyBob2xkIGRvd24sIHRoaXMgaXMgdHJ1ZVxuICAgICAqIEBwcm9wZXJ0eSBzaG91bGRfZGV0ZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBzaG91bGREZXRlY3Q6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogc2ltcGxlIGV2ZW50IGJpbmRlciB3aXRoIGEgaG9vayBhbmQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgdHlwZXNcbiAgICAgKiBAbWV0aG9kIG9uXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtob29rXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBob29rLnR5cGVcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24gb24oZWxlbWVudCwgdHlwZSwgaGFuZGxlciwgaG9vaykge1xuICAgICAgICB2YXIgdHlwZXMgPSB0eXBlLnNwbGl0KCcgJyk7XG4gICAgICAgIFV0aWxzLmVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgIFV0aWxzLm9uKGVsZW1lbnQsIHR5cGUsIGhhbmRsZXIpO1xuICAgICAgICAgICAgaG9vayAmJiBob29rKHR5cGUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2ltcGxlIGV2ZW50IHVuYmluZGVyIHdpdGggYSBob29rIGFuZCBzdXBwb3J0IGZvciBtdWx0aXBsZSB0eXBlc1xuICAgICAqIEBtZXRob2Qgb2ZmXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtob29rXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBob29rLnR5cGVcbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uIG9mZihlbGVtZW50LCB0eXBlLCBoYW5kbGVyLCBob29rKSB7XG4gICAgICAgIHZhciB0eXBlcyA9IHR5cGUuc3BsaXQoJyAnKTtcbiAgICAgICAgVXRpbHMuZWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgVXRpbHMub2ZmKGVsZW1lbnQsIHR5cGUsIGhhbmRsZXIpO1xuICAgICAgICAgICAgaG9vayAmJiBob29rKHR5cGUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdGhlIGNvcmUgdG91Y2ggZXZlbnQgaGFuZGxlci5cbiAgICAgKiB0aGlzIGZpbmRzIG91dCBpZiB3ZSBzaG91bGQgdG8gZGV0ZWN0IGdlc3R1cmVzXG4gICAgICogQG1ldGhvZCBvblRvdWNoXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFR5cGUgbWF0Y2hlcyBgRVZFTlRfU1RBUlR8TU9WRXxFTkRgXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEByZXR1cm4gb25Ub3VjaEhhbmRsZXIge0Z1bmN0aW9ufSB0aGUgY29yZSBldmVudCBoYW5kbGVyXG4gICAgICovXG4gICAgb25Ub3VjaDogZnVuY3Rpb24gb25Ub3VjaChlbGVtZW50LCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBvblRvdWNoSGFuZGxlciA9IGZ1bmN0aW9uIG9uVG91Y2hIYW5kbGVyKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3JjVHlwZSA9IGV2LnR5cGUudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBpc1BvaW50ZXIgPSBIYW1tZXIuSEFTX1BPSU5URVJFVkVOVFMsXG4gICAgICAgICAgICAgICAgaXNNb3VzZSA9IFV0aWxzLmluU3RyKHNyY1R5cGUsICdtb3VzZScpLFxuICAgICAgICAgICAgICAgIHRyaWdnZXJUeXBlO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgaW4gYSBtb3VzZWV2ZW50LCBidXQgdGhlcmUgaGFzIGJlZW4gYSB0b3VjaGV2ZW50IHRyaWdnZXJlZCBpbiB0aGlzIHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdlIHdhbnQgdG8gZG8gbm90aGluZy4gc2ltcGx5IGJyZWFrIG91dCBvZiB0aGUgZXZlbnQuXG4gICAgICAgICAgICBpZihpc01vdXNlICYmIHNlbGYucHJldmVudE1vdXNlRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBtb3VzZWJ1dHRvbiBtdXN0IGJlIGRvd25cbiAgICAgICAgICAgIH0gZWxzZSBpZihpc01vdXNlICYmIGV2ZW50VHlwZSA9PSBFVkVOVF9TVEFSVCAmJiBldi5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnByZXZlbnRNb3VzZUV2ZW50cyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlbGYuc2hvdWxkRGV0ZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihpc1BvaW50ZXIgJiYgZXZlbnRUeXBlID09IEVWRU5UX1NUQVJUKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zaG91bGREZXRlY3QgPSAoZXYuYnV0dG9ucyA9PT0gMSB8fCBQb2ludGVyRXZlbnQubWF0Y2hUeXBlKFBPSU5URVJfVE9VQ0gsIGV2KSk7XG4gICAgICAgICAgICAvLyBqdXN0IGEgdmFsaWQgc3RhcnQgZXZlbnQsIGJ1dCBubyBtb3VzZVxuICAgICAgICAgICAgfSBlbHNlIGlmKCFpc01vdXNlICYmIGV2ZW50VHlwZSA9PSBFVkVOVF9TVEFSVCkge1xuICAgICAgICAgICAgICAgIHNlbGYucHJldmVudE1vdXNlRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLnNob3VsZERldGVjdCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcG9pbnRlciBldmVudCBiZWZvcmUgZW50ZXJpbmcgdGhlIGRldGVjdGlvblxuICAgICAgICAgICAgaWYoaXNQb2ludGVyICYmIGV2ZW50VHlwZSAhPSBFVkVOVF9FTkQpIHtcbiAgICAgICAgICAgICAgICBQb2ludGVyRXZlbnQudXBkYXRlUG9pbnRlcihldmVudFR5cGUsIGV2KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2UgYXJlIGluIGEgdG91Y2gvZG93biBzdGF0ZSwgc28gYWxsb3dlZCBkZXRlY3Rpb24gb2YgZ2VzdHVyZXNcbiAgICAgICAgICAgIGlmKHNlbGYuc2hvdWxkRGV0ZWN0KSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlclR5cGUgPSBzZWxmLmRvRGV0ZWN0LmNhbGwoc2VsZiwgZXYsIGV2ZW50VHlwZSwgZWxlbWVudCwgaGFuZGxlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC4uLmFuZCB3ZSBhcmUgZG9uZSB3aXRoIHRoZSBkZXRlY3Rpb25cbiAgICAgICAgICAgIC8vIHNvIHJlc2V0IGV2ZXJ5dGhpbmcgdG8gc3RhcnQgZWFjaCBkZXRlY3Rpb24gdG90YWxseSBmcmVzaFxuICAgICAgICAgICAgaWYodHJpZ2dlclR5cGUgPT0gRVZFTlRfRU5EKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2ZW50TW91c2VFdmVudHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWxmLnNob3VsZERldGVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFBvaW50ZXJFdmVudC5yZXNldCgpO1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBwb2ludGVyZXZlbnQgb2JqZWN0IGFmdGVyIHRoZSBkZXRlY3Rpb25cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoaXNQb2ludGVyICYmIGV2ZW50VHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgICAgICAgICAgICBQb2ludGVyRXZlbnQudXBkYXRlUG9pbnRlcihldmVudFR5cGUsIGV2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uKGVsZW1lbnQsIEVWRU5UX1RZUEVTW2V2ZW50VHlwZV0sIG9uVG91Y2hIYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIG9uVG91Y2hIYW5kbGVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB0aGUgY29yZSBkZXRlY3Rpb24gbWV0aG9kXG4gICAgICogdGhpcyBmaW5kcyBvdXQgd2hhdCBoYW1tZXItdG91Y2gtZXZlbnRzIHRvIHRyaWdnZXJcbiAgICAgKiBAbWV0aG9kIGRvRGV0ZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSBtYXRjaGVzIGBFVkVOVF9TVEFSVHxNT1ZFfEVORGBcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gdHJpZ2dlclR5cGUgbWF0Y2hlcyBgRVZFTlRfU1RBUlR8TU9WRXxFTkRgXG4gICAgICovXG4gICAgZG9EZXRlY3Q6IGZ1bmN0aW9uIGRvRGV0ZWN0KGV2LCBldmVudFR5cGUsIGVsZW1lbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgdmFyIHRvdWNoTGlzdCA9IHRoaXMuZ2V0VG91Y2hMaXN0KGV2LCBldmVudFR5cGUpO1xuICAgICAgICB2YXIgdG91Y2hMaXN0TGVuZ3RoID0gdG91Y2hMaXN0Lmxlbmd0aDtcbiAgICAgICAgdmFyIHRyaWdnZXJUeXBlID0gZXZlbnRUeXBlO1xuICAgICAgICB2YXIgdHJpZ2dlckNoYW5nZSA9IHRvdWNoTGlzdC50cmlnZ2VyOyAvLyB1c2VkIGJ5IGZha2VNdWx0aXRvdWNoIHBsdWdpblxuICAgICAgICB2YXIgY2hhbmdlZExlbmd0aCA9IHRvdWNoTGlzdExlbmd0aDtcblxuICAgICAgICAvLyBhdCBlYWNoIHRvdWNoc3RhcnQtbGlrZSBldmVudCB3ZSB3YW50IGFsc28gd2FudCB0byB0cmlnZ2VyIGEgVE9VQ0ggZXZlbnQuLi5cbiAgICAgICAgaWYoZXZlbnRUeXBlID09IEVWRU5UX1NUQVJUKSB7XG4gICAgICAgICAgICB0cmlnZ2VyQ2hhbmdlID0gRVZFTlRfVE9VQ0g7XG4gICAgICAgIC8vIC4uLnRoZSBzYW1lIGZvciBhIHRvdWNoZW5kLWxpa2UgZXZlbnRcbiAgICAgICAgfSBlbHNlIGlmKGV2ZW50VHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgICAgICAgIHRyaWdnZXJDaGFuZ2UgPSBFVkVOVF9SRUxFQVNFO1xuXG4gICAgICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IHRvdWNoZXMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICAgICAgICAgIGNoYW5nZWRMZW5ndGggPSB0b3VjaExpc3QubGVuZ3RoIC0gKChldi5jaGFuZ2VkVG91Y2hlcykgPyBldi5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggOiAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFmdGVyIHRoZXJlIGFyZSBzdGlsbCB0b3VjaGVzIG9uIHRoZSBzY3JlZW4sXG4gICAgICAgIC8vIHdlIGp1c3Qgd2FudCB0byB0cmlnZ2VyIGEgTU9WRSBldmVudC4gc28gY2hhbmdlIHRoZSBTVEFSVCBvciBFTkQgdG8gYSBNT1ZFXG4gICAgICAgIC8vIGJ1dCBvbmx5IGFmdGVyIGRldGVjdGlvbiBoYXMgYmVlbiBzdGFydGVkLCB0aGUgZmlyc3QgdGltZSB3ZSBhY3R1YWx5IHdhbnQgYSBTVEFSVFxuICAgICAgICBpZihjaGFuZ2VkTGVuZ3RoID4gMCAmJiB0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHRyaWdnZXJUeXBlID0gRVZFTlRfTU9WRTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRldGVjdGlvbiBoYXMgYmVlbiBzdGFydGVkLCB3ZSBrZWVwIHRyYWNrIG9mIHRoaXMsIHNlZSBhYm92ZVxuICAgICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHNvbWUgZXZlbnQgZGF0YSwgc29tZSBiYXNpYyBpbmZvcm1hdGlvblxuICAgICAgICB2YXIgZXZEYXRhID0gdGhpcy5jb2xsZWN0RXZlbnREYXRhKGVsZW1lbnQsIHRyaWdnZXJUeXBlLCB0b3VjaExpc3QsIGV2KTtcblxuICAgICAgICAvLyB0cmlnZ2VyIHRoZSB0cmlnZ2VyVHlwZSBldmVudCBiZWZvcmUgdGhlIGNoYW5nZSAoVE9VQ0gsIFJFTEVBU0UpIGV2ZW50c1xuICAgICAgICAvLyBidXQgdGhlIEVORCBldmVudCBzaG91bGQgYmUgYXQgbGFzdFxuICAgICAgICBpZihldmVudFR5cGUgIT0gRVZFTlRfRU5EKSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoRGV0ZWN0aW9uLCBldkRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJpZ2dlciBhIGNoYW5nZSAoVE9VQ0gsIFJFTEVBU0UpIGV2ZW50LCB0aGlzIG1lYW5zIHRoZSBsZW5ndGggb2YgdGhlIHRvdWNoZXMgY2hhbmdlZFxuICAgICAgICBpZih0cmlnZ2VyQ2hhbmdlKSB7XG4gICAgICAgICAgICBldkRhdGEuY2hhbmdlZExlbmd0aCA9IGNoYW5nZWRMZW5ndGg7XG4gICAgICAgICAgICBldkRhdGEuZXZlbnRUeXBlID0gdHJpZ2dlckNoYW5nZTtcblxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKERldGVjdGlvbiwgZXZEYXRhKTtcblxuICAgICAgICAgICAgZXZEYXRhLmV2ZW50VHlwZSA9IHRyaWdnZXJUeXBlO1xuICAgICAgICAgICAgZGVsZXRlIGV2RGF0YS5jaGFuZ2VkTGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJpZ2dlciB0aGUgRU5EIGV2ZW50XG4gICAgICAgIGlmKHRyaWdnZXJUeXBlID09IEVWRU5UX0VORCkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKERldGVjdGlvbiwgZXZEYXRhKTtcblxuICAgICAgICAgICAgLy8gLi4uYW5kIHdlIGFyZSBkb25lIHdpdGggdGhlIGRldGVjdGlvblxuICAgICAgICAgICAgLy8gc28gcmVzZXQgZXZlcnl0aGluZyB0byBzdGFydCBlYWNoIGRldGVjdGlvbiB0b3RhbGx5IGZyZXNoXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cmlnZ2VyVHlwZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogd2UgaGF2ZSBkaWZmZXJlbnQgZXZlbnRzIGZvciBlYWNoIGRldmljZS9icm93c2VyXG4gICAgICogZGV0ZXJtaW5lIHdoYXQgd2UgbmVlZCBhbmQgc2V0IHRoZW0gaW4gdGhlIEVWRU5UX1RZUEVTIGNvbnN0YW50XG4gICAgICogdGhlIGBvblRvdWNoYCBtZXRob2QgaXMgYmluZCB0byB0aGVzZSBwcm9wZXJ0aWVzLlxuICAgICAqIEBtZXRob2QgZGV0ZXJtaW5lRXZlbnRUeXBlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH0gZXZlbnRzXG4gICAgICovXG4gICAgZGV0ZXJtaW5lRXZlbnRUeXBlczogZnVuY3Rpb24gZGV0ZXJtaW5lRXZlbnRUeXBlcygpIHtcbiAgICAgICAgdmFyIHR5cGVzO1xuICAgICAgICBpZihIYW1tZXIuSEFTX1BPSU5URVJFVkVOVFMpIHtcbiAgICAgICAgICAgIGlmKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgJ3BvaW50ZXJkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgJ3BvaW50ZXJtb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgJ3BvaW50ZXJ1cCBwb2ludGVyY2FuY2VsIGxvc3Rwb2ludGVyY2FwdHVyZSdcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgJ01TUG9pbnRlckRvd24nLFxuICAgICAgICAgICAgICAgICAgICAnTVNQb2ludGVyTW92ZScsXG4gICAgICAgICAgICAgICAgICAgICdNU1BvaW50ZXJVcCBNU1BvaW50ZXJDYW5jZWwgTVNMb3N0UG9pbnRlckNhcHR1cmUnXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKEhhbW1lci5OT19NT1VTRUVWRU5UUykge1xuICAgICAgICAgICAgdHlwZXMgPSBbXG4gICAgICAgICAgICAgICAgJ3RvdWNoc3RhcnQnLFxuICAgICAgICAgICAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgICAgICAgICAgICd0b3VjaGVuZCB0b3VjaGNhbmNlbCdcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAndG91Y2hzdGFydCBtb3VzZWRvd24nLFxuICAgICAgICAgICAgICAgICd0b3VjaG1vdmUgbW91c2Vtb3ZlJyxcbiAgICAgICAgICAgICAgICAndG91Y2hlbmQgdG91Y2hjYW5jZWwgbW91c2V1cCdcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cblxuICAgICAgICBFVkVOVF9UWVBFU1tFVkVOVF9TVEFSVF0gPSB0eXBlc1swXTtcbiAgICAgICAgRVZFTlRfVFlQRVNbRVZFTlRfTU9WRV0gPSB0eXBlc1sxXTtcbiAgICAgICAgRVZFTlRfVFlQRVNbRVZFTlRfRU5EXSA9IHR5cGVzWzJdO1xuICAgICAgICByZXR1cm4gRVZFTlRfVFlQRVM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNyZWF0ZSB0b3VjaExpc3QgZGVwZW5kaW5nIG9uIHRoZSBldmVudFxuICAgICAqIEBtZXRob2QgZ2V0VG91Y2hMaXN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZVxuICAgICAqIEByZXR1cm4ge0FycmF5fSB0b3VjaGVzXG4gICAgICovXG4gICAgZ2V0VG91Y2hMaXN0OiBmdW5jdGlvbiBnZXRUb3VjaExpc3QoZXYsIGV2ZW50VHlwZSkge1xuICAgICAgICAvLyBnZXQgdGhlIGZha2UgcG9pbnRlckV2ZW50IHRvdWNobGlzdFxuICAgICAgICBpZihIYW1tZXIuSEFTX1BPSU5URVJFVkVOVFMpIHtcbiAgICAgICAgICAgIHJldHVybiBQb2ludGVyRXZlbnQuZ2V0VG91Y2hMaXN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZXQgdGhlIHRvdWNobGlzdFxuICAgICAgICBpZihldi50b3VjaGVzKSB7XG4gICAgICAgICAgICBpZihldmVudFR5cGUgPT0gRVZFTlRfTU9WRSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBldi50b3VjaGVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBjb25jYXQgPSBbXS5jb25jYXQoVXRpbHMudG9BcnJheShldi50b3VjaGVzKSwgVXRpbHMudG9BcnJheShldi5jaGFuZ2VkVG91Y2hlcykpO1xuICAgICAgICAgICAgdmFyIHRvdWNoTGlzdCA9IFtdO1xuXG4gICAgICAgICAgICBVdGlscy5lYWNoKGNvbmNhdCwgZnVuY3Rpb24odG91Y2gpIHtcbiAgICAgICAgICAgICAgICBpZihVdGlscy5pbkFycmF5KGlkZW50aWZpZXJzLCB0b3VjaC5pZGVudGlmaWVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2hMaXN0LnB1c2godG91Y2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZGVudGlmaWVycy5wdXNoKHRvdWNoLmlkZW50aWZpZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0b3VjaExpc3Q7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYWtlIGZha2UgdG91Y2hMaXN0IGZyb20gbW91c2UgcG9zaXRpb25cbiAgICAgICAgZXYuaWRlbnRpZmllciA9IDE7XG4gICAgICAgIHJldHVybiBbZXZdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjb2xsZWN0IGJhc2ljIGV2ZW50IGRhdGFcbiAgICAgKiBAbWV0aG9kIGNvbGxlY3RFdmVudERhdGFcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSBtYXRjaGVzIGBFVkVOVF9TVEFSVHxNT1ZFfEVORGBcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB0b3VjaGVzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICogQHJldHVybiB7T2JqZWN0fSBldlxuICAgICAqL1xuICAgIGNvbGxlY3RFdmVudERhdGE6IGZ1bmN0aW9uIGNvbGxlY3RFdmVudERhdGEoZWxlbWVudCwgZXZlbnRUeXBlLCB0b3VjaGVzLCBldikge1xuICAgICAgICAvLyBmaW5kIG91dCBwb2ludGVyVHlwZVxuICAgICAgICB2YXIgcG9pbnRlclR5cGUgPSBQT0lOVEVSX1RPVUNIO1xuICAgICAgICBpZihVdGlscy5pblN0cihldi50eXBlLCAnbW91c2UnKSB8fCBQb2ludGVyRXZlbnQubWF0Y2hUeXBlKFBPSU5URVJfTU9VU0UsIGV2KSkge1xuICAgICAgICAgICAgcG9pbnRlclR5cGUgPSBQT0lOVEVSX01PVVNFO1xuICAgICAgICB9IGVsc2UgaWYoUG9pbnRlckV2ZW50Lm1hdGNoVHlwZShQT0lOVEVSX1BFTiwgZXYpKSB7XG4gICAgICAgICAgICBwb2ludGVyVHlwZSA9IFBPSU5URVJfUEVOO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNlbnRlcjogVXRpbHMuZ2V0Q2VudGVyKHRvdWNoZXMpLFxuICAgICAgICAgICAgdGltZVN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgdGFyZ2V0OiBldi50YXJnZXQsXG4gICAgICAgICAgICB0b3VjaGVzOiB0b3VjaGVzLFxuICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudFR5cGUsXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGUsXG4gICAgICAgICAgICBzcmNFdmVudDogZXYsXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogcHJldmVudCB0aGUgYnJvd3NlciBkZWZhdWx0IGFjdGlvbnNcbiAgICAgICAgICAgICAqIG1vc3RseSB1c2VkIHRvIGRpc2FibGUgc2Nyb2xsaW5nIG9mIHRoZSBicm93c2VyXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3JjRXZlbnQgPSB0aGlzLnNyY0V2ZW50O1xuICAgICAgICAgICAgICAgIHNyY0V2ZW50LnByZXZlbnRNYW5pcHVsYXRpb24gJiYgc3JjRXZlbnQucHJldmVudE1hbmlwdWxhdGlvbigpO1xuICAgICAgICAgICAgICAgIHNyY0V2ZW50LnByZXZlbnREZWZhdWx0ICYmIHNyY0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHN0b3AgYnViYmxpbmcgdGhlIGV2ZW50IHVwIHRvIGl0cyBwYXJlbnRzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHN0b3BQcm9wYWdhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcmNFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaW1tZWRpYXRlbHkgc3RvcCBnZXN0dXJlIGRldGVjdGlvblxuICAgICAgICAgICAgICogbWlnaHQgYmUgdXNlZnVsIGFmdGVyIGEgc3dpcGUgd2FzIGRldGVjdGVkXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzdG9wRGV0ZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRGV0ZWN0aW9uLnN0b3BEZXRlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5cbi8qKlxuICogQG1vZHVsZSBoYW1tZXJcbiAqXG4gKiBAY2xhc3MgUG9pbnRlckV2ZW50XG4gKiBAc3RhdGljXG4gKi9cbnZhciBQb2ludGVyRXZlbnQgPSBIYW1tZXIuUG9pbnRlckV2ZW50ID0ge1xuICAgIC8qKlxuICAgICAqIGhvbGRzIGFsbCBwb2ludGVycywgYnkgYGlkZW50aWZpZXJgXG4gICAgICogQHByb3BlcnR5IHBvaW50ZXJzXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBwb2ludGVyczoge30sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgdGhlIHBvaW50ZXJzIGFzIGFuIGFycmF5XG4gICAgICogQG1ldGhvZCBnZXRUb3VjaExpc3RcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gdG91Y2hsaXN0XG4gICAgICovXG4gICAgZ2V0VG91Y2hMaXN0OiBmdW5jdGlvbiBnZXRUb3VjaExpc3QoKSB7XG4gICAgICAgIHZhciB0b3VjaGxpc3QgPSBbXTtcbiAgICAgICAgLy8gd2UgY2FuIHVzZSBmb3JFYWNoIHNpbmNlIHBvaW50ZXJFdmVudHMgb25seSBpcyBpbiBJRTEwXG4gICAgICAgIFV0aWxzLmVhY2godGhpcy5wb2ludGVycywgZnVuY3Rpb24ocG9pbnRlcikge1xuICAgICAgICAgICAgdG91Y2hsaXN0LnB1c2gocG9pbnRlcik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdG91Y2hsaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIGEgcG9pbnRlclxuICAgICAqIEBtZXRob2QgdXBkYXRlUG9pbnRlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFR5cGUgbWF0Y2hlcyBgRVZFTlRfU1RBUlR8TU9WRXxFTkRgXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50ZXJFdmVudFxuICAgICAqL1xuICAgIHVwZGF0ZVBvaW50ZXI6IGZ1bmN0aW9uIHVwZGF0ZVBvaW50ZXIoZXZlbnRUeXBlLCBwb2ludGVyRXZlbnQpIHtcbiAgICAgICAgaWYoZXZlbnRUeXBlID09IEVWRU5UX0VORCB8fCAoZXZlbnRUeXBlICE9IEVWRU5UX0VORCAmJiBwb2ludGVyRXZlbnQuYnV0dG9ucyAhPT0gMSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBvaW50ZXJzW3BvaW50ZXJFdmVudC5wb2ludGVySWRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9pbnRlckV2ZW50LmlkZW50aWZpZXIgPSBwb2ludGVyRXZlbnQucG9pbnRlcklkO1xuICAgICAgICAgICAgdGhpcy5wb2ludGVyc1twb2ludGVyRXZlbnQucG9pbnRlcklkXSA9IHBvaW50ZXJFdmVudDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjaGVjayBpZiBldiBtYXRjaGVzIHBvaW50ZXJ0eXBlXG4gICAgICogQG1ldGhvZCBtYXRjaFR5cGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcG9pbnRlclR5cGUgbWF0Y2hlcyBgUE9JTlRFUl9NT1VTRXxUT1VDSHxQRU5gXG4gICAgICogQHBhcmFtIHtQb2ludGVyRXZlbnR9IGV2XG4gICAgICovXG4gICAgbWF0Y2hUeXBlOiBmdW5jdGlvbiBtYXRjaFR5cGUocG9pbnRlclR5cGUsIGV2KSB7XG4gICAgICAgIGlmKCFldi5wb2ludGVyVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHB0ID0gZXYucG9pbnRlclR5cGUsXG4gICAgICAgICAgICB0eXBlcyA9IHt9O1xuXG4gICAgICAgIHR5cGVzW1BPSU5URVJfTU9VU0VdID0gKHB0ID09PSAoZXYuTVNQT0lOVEVSX1RZUEVfTU9VU0UgfHwgUE9JTlRFUl9NT1VTRSkpO1xuICAgICAgICB0eXBlc1tQT0lOVEVSX1RPVUNIXSA9IChwdCA9PT0gKGV2Lk1TUE9JTlRFUl9UWVBFX1RPVUNIIHx8IFBPSU5URVJfVE9VQ0gpKTtcbiAgICAgICAgdHlwZXNbUE9JTlRFUl9QRU5dID0gKHB0ID09PSAoZXYuTVNQT0lOVEVSX1RZUEVfUEVOIHx8IFBPSU5URVJfUEVOKSk7XG4gICAgICAgIHJldHVybiB0eXBlc1twb2ludGVyVHlwZV07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlc2V0IHRoZSBzdG9yZWQgcG9pbnRlcnNcbiAgICAgKiBAbWV0aG9kIHJlc2V0XG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uIHJlc2V0TGlzdCgpIHtcbiAgICAgICAgdGhpcy5wb2ludGVycyA9IHt9O1xuICAgIH1cbn07XG5cblxuLyoqXG4gKiBAbW9kdWxlIGhhbW1lclxuICpcbiAqIEBjbGFzcyBEZXRlY3Rpb25cbiAqIEBzdGF0aWNcbiAqL1xudmFyIERldGVjdGlvbiA9IEhhbW1lci5kZXRlY3Rpb24gPSB7XG4gICAgLy8gY29udGFpbnMgYWxsIHJlZ2lzdHJlZCBIYW1tZXIuZ2VzdHVyZXMgaW4gdGhlIGNvcnJlY3Qgb3JkZXJcbiAgICBnZXN0dXJlczogW10sXG5cbiAgICAvLyBkYXRhIG9mIHRoZSBjdXJyZW50IEhhbW1lci5nZXN0dXJlIGRldGVjdGlvbiBzZXNzaW9uXG4gICAgY3VycmVudDogbnVsbCxcblxuICAgIC8vIHRoZSBwcmV2aW91cyBIYW1tZXIuZ2VzdHVyZSBzZXNzaW9uIGRhdGFcbiAgICAvLyBpcyBhIGZ1bGwgY2xvbmUgb2YgdGhlIHByZXZpb3VzIGdlc3R1cmUuY3VycmVudCBvYmplY3RcbiAgICBwcmV2aW91czogbnVsbCxcblxuICAgIC8vIHdoZW4gdGhpcyBiZWNvbWVzIHRydWUsIG5vIGdlc3R1cmVzIGFyZSBmaXJlZFxuICAgIHN0b3BwZWQ6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogc3RhcnQgSGFtbWVyLmdlc3R1cmUgZGV0ZWN0aW9uXG4gICAgICogQG1ldGhvZCBzdGFydERldGVjdFxuICAgICAqIEBwYXJhbSB7SGFtbWVyLkluc3RhbmNlfSBpbnN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RGF0YVxuICAgICAqL1xuICAgIHN0YXJ0RGV0ZWN0OiBmdW5jdGlvbiBzdGFydERldGVjdChpbnN0LCBldmVudERhdGEpIHtcbiAgICAgICAgLy8gYWxyZWFkeSBidXN5IHdpdGggYSBIYW1tZXIuZ2VzdHVyZSBkZXRlY3Rpb24gb24gYW4gZWxlbWVudFxuICAgICAgICBpZih0aGlzLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGhvbGRzIGN1cnJlbnQgc2Vzc2lvblxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB7XG4gICAgICAgICAgICBpbnN0OiBpbnN0LCAvLyByZWZlcmVuY2UgdG8gSGFtbWVySW5zdGFuY2Ugd2UncmUgd29ya2luZyBmb3JcbiAgICAgICAgICAgIHN0YXJ0RXZlbnQ6IFV0aWxzLmV4dGVuZCh7fSwgZXZlbnREYXRhKSwgLy8gc3RhcnQgZXZlbnREYXRhIGZvciBkaXN0YW5jZXMsIHRpbWluZyBldGNcbiAgICAgICAgICAgIGxhc3RFdmVudDogZmFsc2UsIC8vIGxhc3QgZXZlbnREYXRhXG4gICAgICAgICAgICBsYXN0Q2FsY0V2ZW50OiBmYWxzZSwgLy8gbGFzdCBldmVudERhdGEgZm9yIGNhbGN1bGF0aW9ucy5cbiAgICAgICAgICAgIGZ1dHVyZUNhbGNFdmVudDogZmFsc2UsIC8vIGxhc3QgZXZlbnREYXRhIGZvciBjYWxjdWxhdGlvbnMuXG4gICAgICAgICAgICBsYXN0Q2FsY0RhdGE6IHt9LCAvLyBsYXN0IGxhc3RDYWxjRGF0YVxuICAgICAgICAgICAgbmFtZTogJycgLy8gY3VycmVudCBnZXN0dXJlIHdlJ3JlIGluL2RldGVjdGVkLCBjYW4gYmUgJ3RhcCcsICdob2xkJyBldGNcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRldGVjdChldmVudERhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW1tZXIuZ2VzdHVyZSBkZXRlY3Rpb25cbiAgICAgKiBAbWV0aG9kIGRldGVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudERhdGFcbiAgICAgKiBAcmV0dXJuIHthbnl9XG4gICAgICovXG4gICAgZGV0ZWN0OiBmdW5jdGlvbiBkZXRlY3QoZXZlbnREYXRhKSB7XG4gICAgICAgIGlmKCF0aGlzLmN1cnJlbnQgfHwgdGhpcy5zdG9wcGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBleHRlbmQgZXZlbnQgZGF0YSB3aXRoIGNhbGN1bGF0aW9ucyBhYm91dCBzY2FsZSwgZGlzdGFuY2UgZXRjXG4gICAgICAgIGV2ZW50RGF0YSA9IHRoaXMuZXh0ZW5kRXZlbnREYXRhKGV2ZW50RGF0YSk7XG5cbiAgICAgICAgLy8gaGFtbWVyIGluc3RhbmNlIGFuZCBpbnN0YW5jZSBvcHRpb25zXG4gICAgICAgIHZhciBpbnN0ID0gdGhpcy5jdXJyZW50Lmluc3QsXG4gICAgICAgICAgICBpbnN0T3B0aW9ucyA9IGluc3Qub3B0aW9ucztcblxuICAgICAgICAvLyBjYWxsIEhhbW1lci5nZXN0dXJlIGhhbmRsZXJzXG4gICAgICAgIFV0aWxzLmVhY2godGhpcy5nZXN0dXJlcywgZnVuY3Rpb24gdHJpZ2dlckdlc3R1cmUoZ2VzdHVyZSkge1xuICAgICAgICAgICAgLy8gb25seSB3aGVuIHRoZSBpbnN0YW5jZSBvcHRpb25zIGhhdmUgZW5hYmxlZCB0aGlzIGdlc3R1cmVcbiAgICAgICAgICAgIGlmKCF0aGlzLnN0b3BwZWQgJiYgaW5zdC5lbmFibGVkICYmIGluc3RPcHRpb25zW2dlc3R1cmUubmFtZV0pIHtcbiAgICAgICAgICAgICAgICBnZXN0dXJlLmhhbmRsZXIuY2FsbChnZXN0dXJlLCBldmVudERhdGEsIGluc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAvLyBzdG9yZSBhcyBwcmV2aW91cyBldmVudCBldmVudFxuICAgICAgICBpZih0aGlzLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5sYXN0RXZlbnQgPSBldmVudERhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBpZihldmVudERhdGEuZXZlbnRUeXBlID09IEVWRU5UX0VORCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wRGV0ZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXZlbnREYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjbGVhciB0aGUgSGFtbWVyLmdlc3R1cmUgdmFyc1xuICAgICAqIHRoaXMgaXMgY2FsbGVkIG9uIGVuZERldGVjdCwgYnV0IGNhbiBhbHNvIGJlIHVzZWQgd2hlbiBhIGZpbmFsIEhhbW1lci5nZXN0dXJlIGhhcyBiZWVuIGRldGVjdGVkXG4gICAgICogdG8gc3RvcCBvdGhlciBIYW1tZXIuZ2VzdHVyZXMgZnJvbSBiZWluZyBmaXJlZFxuICAgICAqIEBtZXRob2Qgc3RvcERldGVjdFxuICAgICAqL1xuICAgIHN0b3BEZXRlY3Q6IGZ1bmN0aW9uIHN0b3BEZXRlY3QoKSB7XG4gICAgICAgIC8vIGNsb25lIGN1cnJlbnQgZGF0YSB0byB0aGUgc3RvcmUgYXMgdGhlIHByZXZpb3VzIGdlc3R1cmVcbiAgICAgICAgLy8gdXNlZCBmb3IgdGhlIGRvdWJsZSB0YXAgZ2VzdHVyZSwgc2luY2UgdGhpcyBpcyBhbiBvdGhlciBnZXN0dXJlIGRldGVjdCBzZXNzaW9uXG4gICAgICAgIHRoaXMucHJldmlvdXMgPSBVdGlscy5leHRlbmQoe30sIHRoaXMuY3VycmVudCk7XG5cbiAgICAgICAgLy8gcmVzZXQgdGhlIGN1cnJlbnRcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2FsY3VsYXRlIHZlbG9jaXR5LCBhbmdsZSBhbmQgZGlyZWN0aW9uXG4gICAgICogQG1ldGhvZCBnZXRWZWxvY2l0eURhdGFcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2VudGVyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhVGltZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFZXG4gICAgICovXG4gICAgZ2V0Q2FsY3VsYXRlZERhdGE6IGZ1bmN0aW9uIGdldENhbGN1bGF0ZWREYXRhKGV2LCBjZW50ZXIsIGRlbHRhVGltZSwgZGVsdGFYLCBkZWx0YVkpIHtcbiAgICAgICAgdmFyIGN1ciA9IHRoaXMuY3VycmVudCxcbiAgICAgICAgICAgIHJlY2FsYyA9IGZhbHNlLFxuICAgICAgICAgICAgY2FsY0V2ID0gY3VyLmxhc3RDYWxjRXZlbnQsXG4gICAgICAgICAgICBjYWxjRGF0YSA9IGN1ci5sYXN0Q2FsY0RhdGE7XG5cbiAgICAgICAgaWYoY2FsY0V2ICYmIGV2LnRpbWVTdGFtcCAtIGNhbGNFdi50aW1lU3RhbXAgPiBIYW1tZXIuQ0FMQ1VMQVRFX0lOVEVSVkFMKSB7XG4gICAgICAgICAgICBjZW50ZXIgPSBjYWxjRXYuY2VudGVyO1xuICAgICAgICAgICAgZGVsdGFUaW1lID0gZXYudGltZVN0YW1wIC0gY2FsY0V2LnRpbWVTdGFtcDtcbiAgICAgICAgICAgIGRlbHRhWCA9IGV2LmNlbnRlci5jbGllbnRYIC0gY2FsY0V2LmNlbnRlci5jbGllbnRYO1xuICAgICAgICAgICAgZGVsdGFZID0gZXYuY2VudGVyLmNsaWVudFkgLSBjYWxjRXYuY2VudGVyLmNsaWVudFk7XG4gICAgICAgICAgICByZWNhbGMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX1RPVUNIIHx8IGV2LmV2ZW50VHlwZSA9PSBFVkVOVF9SRUxFQVNFKSB7XG4gICAgICAgICAgICBjdXIuZnV0dXJlQ2FsY0V2ZW50ID0gZXY7XG4gICAgICAgIH1cblxuICAgICAgICBpZighY3VyLmxhc3RDYWxjRXZlbnQgfHwgcmVjYWxjKSB7XG4gICAgICAgICAgICBjYWxjRGF0YS52ZWxvY2l0eSA9IFV0aWxzLmdldFZlbG9jaXR5KGRlbHRhVGltZSwgZGVsdGFYLCBkZWx0YVkpO1xuICAgICAgICAgICAgY2FsY0RhdGEuYW5nbGUgPSBVdGlscy5nZXRBbmdsZShjZW50ZXIsIGV2LmNlbnRlcik7XG4gICAgICAgICAgICBjYWxjRGF0YS5kaXJlY3Rpb24gPSBVdGlscy5nZXREaXJlY3Rpb24oY2VudGVyLCBldi5jZW50ZXIpO1xuXG4gICAgICAgICAgICBjdXIubGFzdENhbGNFdmVudCA9IGN1ci5mdXR1cmVDYWxjRXZlbnQgfHwgZXY7XG4gICAgICAgICAgICBjdXIuZnV0dXJlQ2FsY0V2ZW50ID0gZXY7XG4gICAgICAgIH1cblxuICAgICAgICBldi52ZWxvY2l0eVggPSBjYWxjRGF0YS52ZWxvY2l0eS54O1xuICAgICAgICBldi52ZWxvY2l0eVkgPSBjYWxjRGF0YS52ZWxvY2l0eS55O1xuICAgICAgICBldi5pbnRlcmltQW5nbGUgPSBjYWxjRGF0YS5hbmdsZTtcbiAgICAgICAgZXYuaW50ZXJpbURpcmVjdGlvbiA9IGNhbGNEYXRhLmRpcmVjdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZXh0ZW5kIGV2ZW50RGF0YSBmb3IgSGFtbWVyLmdlc3R1cmVzXG4gICAgICogQG1ldGhvZCBleHRlbmRFdmVudERhdGFcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgZXh0ZW5kRXZlbnREYXRhOiBmdW5jdGlvbiBleHRlbmRFdmVudERhdGEoZXYpIHtcbiAgICAgICAgdmFyIGN1ciA9IHRoaXMuY3VycmVudCxcbiAgICAgICAgICAgIHN0YXJ0RXYgPSBjdXIuc3RhcnRFdmVudCxcbiAgICAgICAgICAgIGxhc3RFdiA9IGN1ci5sYXN0RXZlbnQgfHwgc3RhcnRFdjtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHN0YXJ0IHRvdWNobGlzdCB0byBjYWxjdWxhdGUgdGhlIHNjYWxlL3JvdGF0aW9uXG4gICAgICAgIGlmKGV2LmV2ZW50VHlwZSA9PSBFVkVOVF9UT1VDSCB8fCBldi5ldmVudFR5cGUgPT0gRVZFTlRfUkVMRUFTRSkge1xuICAgICAgICAgICAgc3RhcnRFdi50b3VjaGVzID0gW107XG4gICAgICAgICAgICBVdGlscy5lYWNoKGV2LnRvdWNoZXMsIGZ1bmN0aW9uKHRvdWNoKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRFdi50b3VjaGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRYOiB0b3VjaC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRZOiB0b3VjaC5jbGllbnRZXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWx0YVRpbWUgPSBldi50aW1lU3RhbXAgLSBzdGFydEV2LnRpbWVTdGFtcCxcbiAgICAgICAgICAgIGRlbHRhWCA9IGV2LmNlbnRlci5jbGllbnRYIC0gc3RhcnRFdi5jZW50ZXIuY2xpZW50WCxcbiAgICAgICAgICAgIGRlbHRhWSA9IGV2LmNlbnRlci5jbGllbnRZIC0gc3RhcnRFdi5jZW50ZXIuY2xpZW50WTtcblxuICAgICAgICB0aGlzLmdldENhbGN1bGF0ZWREYXRhKGV2LCBsYXN0RXYuY2VudGVyLCBkZWx0YVRpbWUsIGRlbHRhWCwgZGVsdGFZKTtcblxuICAgICAgICBVdGlscy5leHRlbmQoZXYsIHtcbiAgICAgICAgICAgIHN0YXJ0RXZlbnQ6IHN0YXJ0RXYsXG5cbiAgICAgICAgICAgIGRlbHRhVGltZTogZGVsdGFUaW1lLFxuICAgICAgICAgICAgZGVsdGFYOiBkZWx0YVgsXG4gICAgICAgICAgICBkZWx0YVk6IGRlbHRhWSxcblxuICAgICAgICAgICAgZGlzdGFuY2U6IFV0aWxzLmdldERpc3RhbmNlKHN0YXJ0RXYuY2VudGVyLCBldi5jZW50ZXIpLFxuICAgICAgICAgICAgYW5nbGU6IFV0aWxzLmdldEFuZ2xlKHN0YXJ0RXYuY2VudGVyLCBldi5jZW50ZXIpLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiBVdGlscy5nZXREaXJlY3Rpb24oc3RhcnRFdi5jZW50ZXIsIGV2LmNlbnRlciksXG4gICAgICAgICAgICBzY2FsZTogVXRpbHMuZ2V0U2NhbGUoc3RhcnRFdi50b3VjaGVzLCBldi50b3VjaGVzKSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiBVdGlscy5nZXRSb3RhdGlvbihzdGFydEV2LnRvdWNoZXMsIGV2LnRvdWNoZXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBldjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVnaXN0ZXIgbmV3IGdlc3R1cmVcbiAgICAgKiBAbWV0aG9kIHJlZ2lzdGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdlc3R1cmUgb2JqZWN0LCBzZWUgYGdlc3R1cmVzL2AgZm9yIGRvY3VtZW50YXRpb25cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gZ2VzdHVyZXNcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24gcmVnaXN0ZXIoZ2VzdHVyZSkge1xuICAgICAgICAvLyBhZGQgYW4gZW5hYmxlIGdlc3R1cmUgb3B0aW9ucyBpZiB0aGVyZSBpcyBubyBnaXZlblxuICAgICAgICB2YXIgb3B0aW9ucyA9IGdlc3R1cmUuZGVmYXVsdHMgfHwge307XG4gICAgICAgIGlmKG9wdGlvbnNbZ2VzdHVyZS5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvcHRpb25zW2dlc3R1cmUubmFtZV0gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZXh0ZW5kIEhhbW1lciBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgSGFtbWVyLmdlc3R1cmUgb3B0aW9uc1xuICAgICAgICBVdGlscy5leHRlbmQoSGFtbWVyLmRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcblxuICAgICAgICAvLyBzZXQgaXRzIGluZGV4XG4gICAgICAgIGdlc3R1cmUuaW5kZXggPSBnZXN0dXJlLmluZGV4IHx8IDEwMDA7XG5cbiAgICAgICAgLy8gYWRkIEhhbW1lci5nZXN0dXJlIHRvIHRoZSBsaXN0XG4gICAgICAgIHRoaXMuZ2VzdHVyZXMucHVzaChnZXN0dXJlKTtcblxuICAgICAgICAvLyBzb3J0IHRoZSBsaXN0IGJ5IGluZGV4XG4gICAgICAgIHRoaXMuZ2VzdHVyZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICBpZihhLmluZGV4IDwgYi5pbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGEuaW5kZXggPiBiLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VzdHVyZXM7XG4gICAgfVxufTtcblxuXG4vKipcbiAqIEBtb2R1bGUgaGFtbWVyXG4gKi9cblxuLyoqXG4gKiBjcmVhdGUgbmV3IGhhbW1lciBpbnN0YW5jZVxuICogYWxsIG1ldGhvZHMgc2hvdWxkIHJldHVybiB0aGUgaW5zdGFuY2UgaXRzZWxmLCBzbyBpdCBpcyBjaGFpbmFibGUuXG4gKlxuICogQGNsYXNzIEluc3RhbmNlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gb3B0aW9ucyBhcmUgbWVyZ2VkIHdpdGggYEhhbW1lci5kZWZhdWx0c2BcbiAqIEByZXR1cm4ge0hhbW1lci5JbnN0YW5jZX1cbiAqL1xuSGFtbWVyLkluc3RhbmNlID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIHNldHVwIEhhbW1lckpTIHdpbmRvdyBldmVudHMgYW5kIHJlZ2lzdGVyIGFsbCBnZXN0dXJlc1xuICAgIC8vIHRoaXMgYWxzbyBzZXRzIHVwIHRoZSBkZWZhdWx0IG9wdGlvbnNcbiAgICBzZXR1cCgpO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGVsZW1lbnRcbiAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBlbmFibGVkXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBvcHRpb25zLCBtZXJnZWQgd2l0aCB0aGUgZGVmYXVsdHNcbiAgICAgKiBvcHRpb25zIHdpdGggYW4gXyBhcmUgY29udmVydGVkIHRvIGNhbWVsQ2FzZVxuICAgICAqIEBwcm9wZXJ0eSBvcHRpb25zXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBVdGlscy5lYWNoKG9wdGlvbnMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zW25hbWVdO1xuICAgICAgICBvcHRpb25zW1V0aWxzLnRvQ2FtZWxDYXNlKG5hbWUpXSA9IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vcHRpb25zID0gVXRpbHMuZXh0ZW5kKFV0aWxzLmV4dGVuZCh7fSwgSGFtbWVyLmRlZmF1bHRzKSwgb3B0aW9ucyB8fCB7fSk7XG5cbiAgICAvLyBhZGQgc29tZSBjc3MgdG8gdGhlIGVsZW1lbnQgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIGRvaW5nIGl0cyBuYXRpdmUgYmVoYXZvaXJcbiAgICBpZih0aGlzLm9wdGlvbnMuYmVoYXZpb3IpIHtcbiAgICAgICAgVXRpbHMudG9nZ2xlQmVoYXZpb3IodGhpcy5lbGVtZW50LCB0aGlzLm9wdGlvbnMuYmVoYXZpb3IsIHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGV2ZW50IHN0YXJ0IGhhbmRsZXIgb24gdGhlIGVsZW1lbnQgdG8gc3RhcnQgdGhlIGRldGVjdGlvblxuICAgICAqIEBwcm9wZXJ0eSBldmVudFN0YXJ0SGFuZGxlclxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5ldmVudFN0YXJ0SGFuZGxlciA9IEV2ZW50Lm9uVG91Y2goZWxlbWVudCwgRVZFTlRfU1RBUlQsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIGlmKHNlbGYuZW5hYmxlZCAmJiBldi5ldmVudFR5cGUgPT0gRVZFTlRfU1RBUlQpIHtcbiAgICAgICAgICAgIERldGVjdGlvbi5zdGFydERldGVjdChzZWxmLCBldik7XG4gICAgICAgIH0gZWxzZSBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfVE9VQ0gpIHtcbiAgICAgICAgICAgIERldGVjdGlvbi5kZXRlY3QoZXYpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBrZWVwIGEgbGlzdCBvZiB1c2VyIGV2ZW50IGhhbmRsZXJzIHdoaWNoIG5lZWRzIHRvIGJlIHJlbW92ZWQgd2hlbiBjYWxsaW5nICdkaXNwb3NlJ1xuICAgICAqIEBwcm9wZXJ0eSBldmVudEhhbmRsZXJzXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHRoaXMuZXZlbnRIYW5kbGVycyA9IFtdO1xufTtcblxuSGFtbWVyLkluc3RhbmNlLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBiaW5kIGV2ZW50cyB0byB0aGUgaW5zdGFuY2VcbiAgICAgKiBAbWV0aG9kIG9uXG4gICAgICogQGNoYWluYWJsZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBnZXN0dXJlcyBtdWx0aXBsZSBnZXN0dXJlcyBieSBzcGxpdHRpbmcgd2l0aCBhIHNwYWNlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGVyLmV2IGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbiBvbkV2ZW50KGdlc3R1cmVzLCBoYW5kbGVyKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgRXZlbnQub24oc2VsZi5lbGVtZW50LCBnZXN0dXJlcywgaGFuZGxlciwgZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgc2VsZi5ldmVudEhhbmRsZXJzLnB1c2goeyBnZXN0dXJlOiB0eXBlLCBoYW5kbGVyOiBoYW5kbGVyIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVuYmluZCBldmVudHMgdG8gdGhlIGluc3RhbmNlXG4gICAgICogQG1ldGhvZCBvZmZcbiAgICAgKiBAY2hhaW5hYmxlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGdlc3R1cmVzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqL1xuICAgIG9mZjogZnVuY3Rpb24gb2ZmRXZlbnQoZ2VzdHVyZXMsIGhhbmRsZXIpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIEV2ZW50Lm9mZihzZWxmLmVsZW1lbnQsIGdlc3R1cmVzLCBoYW5kbGVyLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBVdGlscy5pbkFycmF5KHsgZ2VzdHVyZTogdHlwZSwgaGFuZGxlcjogaGFuZGxlciB9KTtcbiAgICAgICAgICAgIGlmKGluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZXZlbnRIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHRyaWdnZXIgZ2VzdHVyZSBldmVudFxuICAgICAqIEBtZXRob2QgdHJpZ2dlclxuICAgICAqIEBjaGFpbmFibGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ2VzdHVyZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbZXZlbnREYXRhXVxuICAgICAqL1xuICAgIHRyaWdnZXI6IGZ1bmN0aW9uIHRyaWdnZXJFdmVudChnZXN0dXJlLCBldmVudERhdGEpIHtcbiAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAgICAgaWYoIWV2ZW50RGF0YSkge1xuICAgICAgICAgICAgZXZlbnREYXRhID0ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjcmVhdGUgRE9NIGV2ZW50XG4gICAgICAgIHZhciBldmVudCA9IEhhbW1lci5ET0NVTUVOVC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGdlc3R1cmUsIHRydWUsIHRydWUpO1xuICAgICAgICBldmVudC5nZXN0dXJlID0gZXZlbnREYXRhO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgb24gdGhlIHRhcmdldCBpZiBpdCBpcyBpbiB0aGUgaW5zdGFuY2UgZWxlbWVudCxcbiAgICAgICAgLy8gdGhpcyBpcyBmb3IgZXZlbnQgZGVsZWdhdGlvbiB0cmlja3NcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgIGlmKFV0aWxzLmhhc1BhcmVudChldmVudERhdGEudGFyZ2V0LCBlbGVtZW50KSkge1xuICAgICAgICAgICAgZWxlbWVudCA9IGV2ZW50RGF0YS50YXJnZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZW5hYmxlIG9mIGRpc2FibGUgaGFtbWVyLmpzIGRldGVjdGlvblxuICAgICAqIEBtZXRob2QgZW5hYmxlXG4gICAgICogQGNoYWluYWJsZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gc3RhdGVcbiAgICAgKi9cbiAgICBlbmFibGU6IGZ1bmN0aW9uIGVuYWJsZShzdGF0ZSkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBzdGF0ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRpc3Bvc2UgdGhpcyBoYW1tZXIgaW5zdGFuY2VcbiAgICAgKiBAbWV0aG9kIGRpc3Bvc2VcbiAgICAgKiBAcmV0dXJuIHtOdWxsfVxuICAgICAqL1xuICAgIGRpc3Bvc2U6IGZ1bmN0aW9uIGRpc3Bvc2UoKSB7XG4gICAgICAgIHZhciBpLCBlaDtcblxuICAgICAgICAvLyB1bmRvIGFsbCBjaGFuZ2VzIG1hZGUgYnkgc3RvcF9icm93c2VyX2JlaGF2aW9yXG4gICAgICAgIFV0aWxzLnRvZ2dsZUJlaGF2aW9yKHRoaXMuZWxlbWVudCwgdGhpcy5vcHRpb25zLmJlaGF2aW9yLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gdW5iaW5kIGFsbCBjdXN0b20gZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgZm9yKGkgPSAtMTsgKGVoID0gdGhpcy5ldmVudEhhbmRsZXJzWysraV0pOykge1xuICAgICAgICAgICAgVXRpbHMub2ZmKHRoaXMuZWxlbWVudCwgZWguZ2VzdHVyZSwgZWguaGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMgPSBbXTtcblxuICAgICAgICAvLyB1bmJpbmQgdGhlIHN0YXJ0IGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIEV2ZW50Lm9mZih0aGlzLmVsZW1lbnQsIEVWRU5UX1RZUEVTW0VWRU5UX1NUQVJUXSwgdGhpcy5ldmVudFN0YXJ0SGFuZGxlcik7XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufTtcblxuXG4vKipcbiAqIEBtb2R1bGUgZ2VzdHVyZXNcbiAqL1xuLyoqXG4gKiBNb3ZlIHdpdGggeCBmaW5nZXJzIChkZWZhdWx0IDEpIGFyb3VuZCBvbiB0aGUgcGFnZS5cbiAqIFByZXZlbnRpbmcgdGhlIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciBpcyBhIGdvb2Qgd2F5IHRvIGltcHJvdmUgZmVlbCBhbmQgd29ya2luZy5cbiAqIGBgYGBcbiAqICBoYW1tZXJ0aW1lLm9uKFwiZHJhZ1wiLCBmdW5jdGlvbihldikge1xuICogICAgY29uc29sZS5sb2coZXYpO1xuICogICAgZXYuZ2VzdHVyZS5wcmV2ZW50RGVmYXVsdCgpO1xuICogIH0pO1xuICogYGBgYFxuICpcbiAqIEBjbGFzcyBEcmFnXG4gKiBAc3RhdGljXG4gKi9cbi8qKlxuICogQGV2ZW50IGRyYWdcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBkcmFnc3RhcnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBkcmFnZW5kXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuLyoqXG4gKiBAZXZlbnQgZHJhcGxlZnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBkcmFncmlnaHRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBkcmFndXBcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBkcmFnZG93blxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICovXG4oZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB0cmlnZ2VyZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGRyYWdHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgICAgIHZhciBjdXIgPSBEZXRlY3Rpb24uY3VycmVudDtcblxuICAgICAgICAvLyBtYXggdG91Y2hlc1xuICAgICAgICBpZihpbnN0Lm9wdGlvbnMuZHJhZ01heFRvdWNoZXMgPiAwICYmXG4gICAgICAgICAgICBldi50b3VjaGVzLmxlbmd0aCA+IGluc3Qub3B0aW9ucy5kcmFnTWF4VG91Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoKGV2LmV2ZW50VHlwZSkge1xuICAgICAgICAgICAgY2FzZSBFVkVOVF9TVEFSVDpcbiAgICAgICAgICAgICAgICB0cmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFVkVOVF9NT1ZFOlxuICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIGRpc3RhbmNlIHdlIG1vdmVkIGlzIHRvbyBzbWFsbCB3ZSBza2lwIHRoaXMgZ2VzdHVyZVxuICAgICAgICAgICAgICAgIC8vIG9yIHdlIGNhbiBiZSBhbHJlYWR5IGluIGRyYWdnaW5nXG4gICAgICAgICAgICAgICAgaWYoZXYuZGlzdGFuY2UgPCBpbnN0Lm9wdGlvbnMuZHJhZ01pbkRpc3RhbmNlICYmXG4gICAgICAgICAgICAgICAgICAgIGN1ci5uYW1lICE9IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzdGFydENlbnRlciA9IGN1ci5zdGFydEV2ZW50LmNlbnRlcjtcblxuICAgICAgICAgICAgICAgIC8vIHdlIGFyZSBkcmFnZ2luZyFcbiAgICAgICAgICAgICAgICBpZihjdXIubmFtZSAhPSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1ci5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaWYoaW5zdC5vcHRpb25zLmRyYWdEaXN0YW5jZUNvcnJlY3Rpb24gJiYgZXYuZGlzdGFuY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIGEgZHJhZyBpcyB0cmlnZ2VyZWQsIHNldCB0aGUgZXZlbnQgY2VudGVyIHRvIGRyYWdNaW5EaXN0YW5jZSBwaXhlbHMgZnJvbSB0aGUgb3JpZ2luYWwgZXZlbnQgY2VudGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2l0aG91dCB0aGlzIGNvcnJlY3Rpb24sIHRoZSBkcmFnZ2VkIGRpc3RhbmNlIHdvdWxkIGp1bXBzdGFydCBhdCBkcmFnTWluRGlzdGFuY2UgcGl4ZWxzIGluc3RlYWQgb2YgYXQgMC5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0IG1pZ2h0IGJlIHVzZWZ1bCB0byBzYXZlIHRoZSBvcmlnaW5hbCBzdGFydCBwb2ludCBzb21ld2hlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYWN0b3IgPSBNYXRoLmFicyhpbnN0Lm9wdGlvbnMuZHJhZ01pbkRpc3RhbmNlIC8gZXYuZGlzdGFuY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDZW50ZXIucGFnZVggKz0gZXYuZGVsdGFYICogZmFjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDZW50ZXIucGFnZVkgKz0gZXYuZGVsdGFZICogZmFjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDZW50ZXIuY2xpZW50WCArPSBldi5kZWx0YVggKiBmYWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydENlbnRlci5jbGllbnRZICs9IGV2LmRlbHRhWSAqIGZhY3RvcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVjYWxjdWxhdGUgZXZlbnQgZGF0YSB1c2luZyBuZXcgc3RhcnQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ID0gRGV0ZWN0aW9uLmV4dGVuZEV2ZW50RGF0YShldik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBsb2NrIGRyYWcgdG8gYXhpcz9cbiAgICAgICAgICAgICAgICBpZihjdXIubGFzdEV2ZW50LmRyYWdMb2NrVG9BeGlzIHx8XG4gICAgICAgICAgICAgICAgICAgICggaW5zdC5vcHRpb25zLmRyYWdMb2NrVG9BeGlzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Lm9wdGlvbnMuZHJhZ0xvY2tNaW5EaXN0YW5jZSA8PSBldi5kaXN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICBldi5kcmFnTG9ja1RvQXhpcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8ga2VlcCBkaXJlY3Rpb24gb24gdGhlIGF4aXMgdGhhdCB0aGUgZHJhZyBnZXN0dXJlIHN0YXJ0ZWQgb25cbiAgICAgICAgICAgICAgICB2YXIgbGFzdERpcmVjdGlvbiA9IGN1ci5sYXN0RXZlbnQuZGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGlmKGV2LmRyYWdMb2NrVG9BeGlzICYmIGxhc3REaXJlY3Rpb24gIT09IGV2LmRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBpZihVdGlscy5pc1ZlcnRpY2FsKGxhc3REaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5kaXJlY3Rpb24gPSAoZXYuZGVsdGFZIDwgMCkgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2LmRpcmVjdGlvbiA9IChldi5kZWx0YVggPCAwKSA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgdGltZSwgdHJpZ2dlciBkcmFnc3RhcnQgZXZlbnRcbiAgICAgICAgICAgICAgICBpZighdHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3QudHJpZ2dlcihuYW1lICsgJ3N0YXJ0JywgZXYpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgZXZlbnRzXG4gICAgICAgICAgICAgICAgaW5zdC50cmlnZ2VyKG5hbWUsIGV2KTtcbiAgICAgICAgICAgICAgICBpbnN0LnRyaWdnZXIobmFtZSArIGV2LmRpcmVjdGlvbiwgZXYpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGlzVmVydGljYWwgPSBVdGlscy5pc1ZlcnRpY2FsKGV2LmRpcmVjdGlvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBibG9jayB0aGUgYnJvd3NlciBldmVudHNcbiAgICAgICAgICAgICAgICBpZigoaW5zdC5vcHRpb25zLmRyYWdCbG9ja1ZlcnRpY2FsICYmIGlzVmVydGljYWwpIHx8XG4gICAgICAgICAgICAgICAgICAgIChpbnN0Lm9wdGlvbnMuZHJhZ0Jsb2NrSG9yaXpvbnRhbCAmJiAhaXNWZXJ0aWNhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRVZFTlRfUkVMRUFTRTpcbiAgICAgICAgICAgICAgICBpZih0cmlnZ2VyZWQgJiYgZXYuY2hhbmdlZExlbmd0aCA8PSBpbnN0Lm9wdGlvbnMuZHJhZ01heFRvdWNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdC50cmlnZ2VyKG5hbWUgKyAnZW5kJywgZXYpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRVZFTlRfRU5EOlxuICAgICAgICAgICAgICAgIHRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgSGFtbWVyLmdlc3R1cmVzLkRyYWcgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGluZGV4OiA1MCxcbiAgICAgICAgaGFuZGxlcjogZHJhZ0dlc3R1cmUsXG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIG1pbmltYWwgbW92ZW1lbnQgdGhhdCBoYXZlIHRvIGJlIG1hZGUgYmVmb3JlIHRoZSBkcmFnIGV2ZW50IGdldHMgdHJpZ2dlcmVkXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgZHJhZ01pbkRpc3RhbmNlXG4gICAgICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgICAgICogQGRlZmF1bHQgMTBcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZHJhZ01pbkRpc3RhbmNlOiAxMCxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTZXQgZHJhZ0Rpc3RhbmNlQ29ycmVjdGlvbiB0byB0cnVlIHRvIG1ha2UgdGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBkcmFnXG4gICAgICAgICAgICAgKiBiZSBjYWxjdWxhdGVkIGZyb20gd2hlcmUgdGhlIGRyYWcgd2FzIHRyaWdnZXJlZCwgbm90IGZyb20gd2hlcmUgdGhlIHRvdWNoIHN0YXJ0ZWQuXG4gICAgICAgICAgICAgKiBVc2VmdWwgdG8gYXZvaWQgYSBqZXJrLXN0YXJ0aW5nIGRyYWcsIHdoaWNoIGNhbiBtYWtlIGZpbmUtYWRqdXN0bWVudHNcbiAgICAgICAgICAgICAqIHRocm91Z2ggZHJhZ2dpbmcgZGlmZmljdWx0LCBhbmQgYmUgdmlzdWFsbHkgdW5hcHBlYWxpbmcuXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgZHJhZ0Rpc3RhbmNlQ29ycmVjdGlvblxuICAgICAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRyYWdEaXN0YW5jZUNvcnJlY3Rpb246IHRydWUsXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogc2V0IDAgZm9yIHVubGltaXRlZCwgYnV0IHRoaXMgY2FuIGNvbmZsaWN0IHdpdGggdHJhbnNmb3JtXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgZHJhZ01heFRvdWNoZXNcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCAxXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRyYWdNYXhUb3VjaGVzOiAxLFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHByZXZlbnQgZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yIHdoZW4gZHJhZ2dpbmcgb2NjdXJzXG4gICAgICAgICAgICAgKiBiZSBjYXJlZnVsIHdpdGggaXQsIGl0IG1ha2VzIHRoZSBlbGVtZW50IGEgYmxvY2tpbmcgZWxlbWVudFxuICAgICAgICAgICAgICogd2hlbiB5b3UgYXJlIHVzaW5nIHRoZSBkcmFnIGdlc3R1cmUsIGl0IGlzIGEgZ29vZCBwcmFjdGljZSB0byBzZXQgdGhpcyB0cnVlXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgZHJhZ0Jsb2NrSG9yaXpvbnRhbFxuICAgICAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkcmFnQmxvY2tIb3Jpem9udGFsOiBmYWxzZSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBzYW1lIGFzIGBkcmFnQmxvY2tIb3Jpem9udGFsYCwgYnV0IGZvciB2ZXJ0aWNhbCBtb3ZlbWVudFxuICAgICAgICAgICAgICogQHByb3BlcnR5IGRyYWdCbG9ja1ZlcnRpY2FsXG4gICAgICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRyYWdCbG9ja1ZlcnRpY2FsOiBmYWxzZSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBkcmFnTG9ja1RvQXhpcyBrZWVwcyB0aGUgZHJhZyBnZXN0dXJlIG9uIHRoZSBheGlzIHRoYXQgaXQgc3RhcnRlZCBvbixcbiAgICAgICAgICAgICAqIEl0IGRpc2FsbG93cyB2ZXJ0aWNhbCBkaXJlY3Rpb25zIGlmIHRoZSBpbml0aWFsIGRpcmVjdGlvbiB3YXMgaG9yaXpvbnRhbCwgYW5kIHZpY2UgdmVyc2EuXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgZHJhZ0xvY2tUb0F4aXNcbiAgICAgICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZHJhZ0xvY2tUb0F4aXM6IGZhbHNlLFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGRyYWcgbG9jayBvbmx5IGtpY2tzIGluIHdoZW4gZGlzdGFuY2UgPiBkcmFnTG9ja01pbkRpc3RhbmNlXG4gICAgICAgICAgICAgKiBUaGlzIHdheSwgbG9ja2luZyBvY2N1cnMgb25seSB3aGVuIHRoZSBkaXN0YW5jZSBoYXMgYmVjb21lIGxhcmdlIGVub3VnaCB0byByZWxpYWJseSBkZXRlcm1pbmUgdGhlIGRpcmVjdGlvblxuICAgICAgICAgICAgICogQHByb3BlcnR5IGRyYWdMb2NrTWluRGlzdGFuY2VcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCAyNVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkcmFnTG9ja01pbkRpc3RhbmNlOiAyNVxuICAgICAgICB9XG4gICAgfTtcbn0pKCdkcmFnJyk7XG5cbi8qKlxuICogQG1vZHVsZSBnZXN0dXJlc1xuICovXG4vKipcbiAqIHRyaWdnZXIgYSBzaW1wbGUgZ2VzdHVyZSBldmVudCwgc28geW91IGNhbiBkbyBhbnl0aGluZyBpbiB5b3VyIGhhbmRsZXIuXG4gKiBvbmx5IHVzYWJsZSBpZiB5b3Uga25vdyB3aGF0IHlvdXIgZG9pbmcuLi5cbiAqXG4gKiBAY2xhc3MgR2VzdHVyZVxuICogQHN0YXRpY1xuICovXG4vKipcbiAqIEBldmVudCBnZXN0dXJlXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuSGFtbWVyLmdlc3R1cmVzLkdlc3R1cmUgPSB7XG4gICAgbmFtZTogJ2dlc3R1cmUnLFxuICAgIGluZGV4OiAxMzM3LFxuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIHJlbGVhc2VHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUsIGV2KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEBtb2R1bGUgZ2VzdHVyZXNcbiAqL1xuLyoqXG4gKiBUb3VjaCBzdGF5cyBhdCB0aGUgc2FtZSBwbGFjZSBmb3IgeCB0aW1lXG4gKlxuICogQGNsYXNzIEhvbGRcbiAqIEBzdGF0aWNcbiAqL1xuLyoqXG4gKiBAZXZlbnQgaG9sZFxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICovXG4oZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB0aW1lcjtcblxuICAgIGZ1bmN0aW9uIGhvbGRHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gaW5zdC5vcHRpb25zLFxuICAgICAgICAgICAgY3VycmVudCA9IERldGVjdGlvbi5jdXJyZW50O1xuXG4gICAgICAgIHN3aXRjaChldi5ldmVudFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgRVZFTlRfU1RBUlQ6XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgZ2VzdHVyZSBzbyB3ZSBjYW4gY2hlY2sgaW4gdGhlIHRpbWVvdXQgaWYgaXQgc3RpbGwgaXNcbiAgICAgICAgICAgICAgICBjdXJyZW50Lm5hbWUgPSBuYW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRpbWVyIGFuZCBpZiBhZnRlciB0aGUgdGltZW91dCBpdCBzdGlsbCBpcyBob2xkLFxuICAgICAgICAgICAgICAgIC8vIHdlIHRyaWdnZXIgdGhlIGhvbGQgZXZlbnRcbiAgICAgICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnQgJiYgY3VycmVudC5uYW1lID09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QudHJpZ2dlcihuYW1lLCBldik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBvcHRpb25zLmhvbGRUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFVkVOVF9NT1ZFOlxuICAgICAgICAgICAgICAgIGlmKGV2LmRpc3RhbmNlID4gb3B0aW9ucy5ob2xkVGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEVWRU5UX1JFTEVBU0U6XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEhhbW1lci5nZXN0dXJlcy5Ib2xkID0ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBpbmRleDogMTAsXG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBob2xkVGltZW91dFxuICAgICAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IDUwMFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBob2xkVGltZW91dDogNTAwLFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIG1vdmVtZW50IGFsbG93ZWQgd2hpbGUgaG9sZGluZ1xuICAgICAgICAgICAgICogQHByb3BlcnR5IGhvbGRUaHJlc2hvbGRcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCAyXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGhvbGRUaHJlc2hvbGQ6IDJcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlcjogaG9sZEdlc3R1cmVcbiAgICB9O1xufSkoJ2hvbGQnKTtcblxuLyoqXG4gKiBAbW9kdWxlIGdlc3R1cmVzXG4gKi9cbi8qKlxuICogd2hlbiBhIHRvdWNoIGlzIGJlaW5nIHJlbGVhc2VkIGZyb20gdGhlIHBhZ2VcbiAqXG4gKiBAY2xhc3MgUmVsZWFzZVxuICogQHN0YXRpY1xuICovXG4vKipcbiAqIEBldmVudCByZWxlYXNlXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuSGFtbWVyLmdlc3R1cmVzLlJlbGVhc2UgPSB7XG4gICAgbmFtZTogJ3JlbGVhc2UnLFxuICAgIGluZGV4OiBJbmZpbml0eSxcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiByZWxlYXNlR2VzdHVyZShldiwgaW5zdCkge1xuICAgICAgICBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfUkVMRUFTRSkge1xuICAgICAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSwgZXYpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBAbW9kdWxlIGdlc3R1cmVzXG4gKi9cbi8qKlxuICogdHJpZ2dlcnMgc3dpcGUgZXZlbnRzIHdoZW4gdGhlIGVuZCB2ZWxvY2l0eSBpcyBhYm92ZSB0aGUgdGhyZXNob2xkXG4gKiBmb3IgYmVzdCB1c2FnZSwgc2V0IGBwcmV2ZW50RGVmYXVsdGAgKG9uIHRoZSBkcmFnIGdlc3R1cmUpIHRvIGB0cnVlYFxuICogYGBgYFxuICogIGhhbW1lcnRpbWUub24oXCJkcmFnbGVmdCBzd2lwZWxlZnRcIiwgZnVuY3Rpb24oZXYpIHtcbiAqICAgIGNvbnNvbGUubG9nKGV2KTtcbiAqICAgIGV2Lmdlc3R1cmUucHJldmVudERlZmF1bHQoKTtcbiAqICB9KTtcbiAqIGBgYGBcbiAqXG4gKiBAY2xhc3MgU3dpcGVcbiAqIEBzdGF0aWNcbiAqL1xuLyoqXG4gKiBAZXZlbnQgc3dpcGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBzd2lwZWxlZnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBzd2lwZXJpZ2h0XG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuLyoqXG4gKiBAZXZlbnQgc3dpcGV1cFxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKi9cbi8qKlxuICogQGV2ZW50IHN3aXBlZG93blxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKi9cbkhhbW1lci5nZXN0dXJlcy5Td2lwZSA9IHtcbiAgICBuYW1lOiAnc3dpcGUnLFxuICAgIGluZGV4OiA0MCxcbiAgICBkZWZhdWx0czoge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHN3aXBlTWluVG91Y2hlc1xuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKiBAZGVmYXVsdCAxXG4gICAgICAgICAqL1xuICAgICAgICBzd2lwZU1pblRvdWNoZXM6IDEsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzd2lwZU1heFRvdWNoZXNcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgKi9cbiAgICAgICAgc3dpcGVNYXhUb3VjaGVzOiAxLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBob3Jpem9udGFsIHN3aXBlIHZlbG9jaXR5XG4gICAgICAgICAqIEBwcm9wZXJ0eSBzd2lwZVZlbG9jaXR5WFxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKiBAZGVmYXVsdCAwLjZcbiAgICAgICAgICovXG4gICAgICAgIHN3aXBlVmVsb2NpdHlYOiAwLjYsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHZlcnRpY2FsIHN3aXBlIHZlbG9jaXR5XG4gICAgICAgICAqIEBwcm9wZXJ0eSBzd2lwZVZlbG9jaXR5WVxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgKiBAZGVmYXVsdCAwLjZcbiAgICAgICAgICovXG4gICAgICAgIHN3aXBlVmVsb2NpdHlZOiAwLjZcbiAgICB9LFxuXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gc3dpcGVHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgICAgIGlmKGV2LmV2ZW50VHlwZSA9PSBFVkVOVF9SRUxFQVNFKSB7XG4gICAgICAgICAgICB2YXIgdG91Y2hlcyA9IGV2LnRvdWNoZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBpbnN0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIG1heCB0b3VjaGVzXG4gICAgICAgICAgICBpZih0b3VjaGVzIDwgb3B0aW9ucy5zd2lwZU1pblRvdWNoZXMgfHxcbiAgICAgICAgICAgICAgICB0b3VjaGVzID4gb3B0aW9ucy5zd2lwZU1heFRvdWNoZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIGRpc3RhbmNlIHdlIG1vdmVkIGlzIHRvbyBzbWFsbCB3ZSBza2lwIHRoaXMgZ2VzdHVyZVxuICAgICAgICAgICAgLy8gb3Igd2UgY2FuIGJlIGFscmVhZHkgaW4gZHJhZ2dpbmdcbiAgICAgICAgICAgIGlmKGV2LnZlbG9jaXR5WCA+IG9wdGlvbnMuc3dpcGVWZWxvY2l0eVggfHxcbiAgICAgICAgICAgICAgICBldi52ZWxvY2l0eVkgPiBvcHRpb25zLnN3aXBlVmVsb2NpdHlZKSB7XG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBzd2lwZSBldmVudHNcbiAgICAgICAgICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lLCBldik7XG4gICAgICAgICAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArIGV2LmRpcmVjdGlvbiwgZXYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBAbW9kdWxlIGdlc3R1cmVzXG4gKi9cbi8qKlxuICogU2luZ2xlIHRhcCBhbmQgYSBkb3VibGUgdGFwIG9uIGEgcGxhY2VcbiAqXG4gKiBAY2xhc3MgVGFwXG4gKiBAc3RhdGljXG4gKi9cbi8qKlxuICogQGV2ZW50IHRhcFxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKi9cbi8qKlxuICogQGV2ZW50IGRvdWJsZXRhcFxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICovXG4oZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoYXNNb3ZlZCA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gdGFwR2VzdHVyZShldiwgaW5zdCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IGluc3Qub3B0aW9ucyxcbiAgICAgICAgICAgIGN1cnJlbnQgPSBEZXRlY3Rpb24uY3VycmVudCxcbiAgICAgICAgICAgIHByZXYgPSBEZXRlY3Rpb24ucHJldmlvdXMsXG4gICAgICAgICAgICBzaW5jZVByZXYsXG4gICAgICAgICAgICBkaWREb3VibGVUYXA7XG5cbiAgICAgICAgc3dpdGNoKGV2LmV2ZW50VHlwZSkge1xuICAgICAgICAgICAgY2FzZSBFVkVOVF9TVEFSVDpcbiAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEVWRU5UX01PVkU6XG4gICAgICAgICAgICAgICAgaGFzTW92ZWQgPSBoYXNNb3ZlZCB8fCAoZXYuZGlzdGFuY2UgPiBvcHRpb25zLnRhcE1heERpc3RhbmNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFVkVOVF9FTkQ6XG4gICAgICAgICAgICAgICAgaWYoIVV0aWxzLmluU3RyKGV2LnNyY0V2ZW50LnR5cGUsICdjYW5jZWwnKSAmJiBldi5kZWx0YVRpbWUgPCBvcHRpb25zLnRhcE1heFRpbWUgJiYgIWhhc01vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzIGdlc3R1cmUsIGZvciB0aGUgZG91YmxlIHRhcCBzaW5jZSB0aGVzZSBhcmUgdHdvIGRpZmZlcmVudCBnZXN0dXJlIGRldGVjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgc2luY2VQcmV2ID0gcHJldiAmJiBwcmV2Lmxhc3RFdmVudCAmJiBldi50aW1lU3RhbXAgLSBwcmV2Lmxhc3RFdmVudC50aW1lU3RhbXA7XG4gICAgICAgICAgICAgICAgICAgIGRpZERvdWJsZVRhcCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGRvdWJsZSB0YXBcbiAgICAgICAgICAgICAgICAgICAgaWYocHJldiAmJiBwcmV2Lm5hbWUgPT0gbmFtZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKHNpbmNlUHJldiAmJiBzaW5jZVByZXYgPCBvcHRpb25zLmRvdWJsZVRhcEludGVydmFsKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZXYuZGlzdGFuY2UgPCBvcHRpb25zLmRvdWJsZVRhcERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LnRyaWdnZXIoJ2RvdWJsZXRhcCcsIGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZERvdWJsZVRhcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBkbyBhIHNpbmdsZSB0YXBcbiAgICAgICAgICAgICAgICAgICAgaWYoIWRpZERvdWJsZVRhcCB8fCBvcHRpb25zLnRhcEFsd2F5cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QudHJpZ2dlcihjdXJyZW50Lm5hbWUsIGV2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEhhbW1lci5nZXN0dXJlcy5UYXAgPSB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGluZGV4OiAxMDAsXG4gICAgICAgIGhhbmRsZXI6IHRhcEdlc3R1cmUsXG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIG1heCB0aW1lIG9mIGEgdGFwLCB0aGlzIGlzIGZvciB0aGUgc2xvdyB0YXBwZXJzXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgdGFwTWF4VGltZVxuICAgICAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IDI1MFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0YXBNYXhUaW1lOiAyNTAsXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogbWF4IGRpc3RhbmNlIG9mIG1vdmVtZW50IG9mIGEgdGFwLCB0aGlzIGlzIGZvciB0aGUgc2xvdyB0YXBwZXJzXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgdGFwTWF4RGlzdGFuY2VcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0YXBNYXhEaXN0YW5jZTogMTAsXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogYWx3YXlzIHRyaWdnZXIgdGhlIGB0YXBgIGV2ZW50LCBldmVuIHdoaWxlIGRvdWJsZS10YXBwaW5nXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgdGFwQWx3YXlzXG4gICAgICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICAgICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGFwQWx3YXlzOiB0cnVlLFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIG1heCBkaXN0YW5jZSBiZXR3ZWVuIHR3byB0YXBzXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgZG91YmxlVGFwRGlzdGFuY2VcbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCAyMFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkb3VibGVUYXBEaXN0YW5jZTogMjAsXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogbWF4IHRpbWUgYmV0d2VlbiB0d28gdGFwc1xuICAgICAgICAgICAgICogQHByb3BlcnR5IGRvdWJsZVRhcEludGVydmFsXG4gICAgICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgICAgICogQGRlZmF1bHQgMzAwXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRvdWJsZVRhcEludGVydmFsOiAzMDBcbiAgICAgICAgfVxuICAgIH07XG59KSgndGFwJyk7XG5cbi8qKlxuICogQG1vZHVsZSBnZXN0dXJlc1xuICovXG4vKipcbiAqIHdoZW4gYSB0b3VjaCBpcyBiZWluZyB0b3VjaGVkIGF0IHRoZSBwYWdlXG4gKlxuICogQGNsYXNzIFRvdWNoXG4gKiBAc3RhdGljXG4gKi9cbi8qKlxuICogQGV2ZW50IHRvdWNoXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuSGFtbWVyLmdlc3R1cmVzLlRvdWNoID0ge1xuICAgIG5hbWU6ICd0b3VjaCcsXG4gICAgaW5kZXg6IC1JbmZpbml0eSxcbiAgICBkZWZhdWx0czoge1xuICAgICAgICAvKipcbiAgICAgICAgICogY2FsbCBwcmV2ZW50RGVmYXVsdCBhdCB0b3VjaHN0YXJ0LCBhbmQgbWFrZXMgdGhlIGVsZW1lbnQgYmxvY2tpbmcgYnkgZGlzYWJsaW5nIHRoZSBzY3JvbGxpbmcgb2YgdGhlIHBhZ2UsXG4gICAgICAgICAqIGJ1dCBpdCBpbXByb3ZlcyBnZXN0dXJlcyBsaWtlIHRyYW5zZm9ybWluZyBhbmQgZHJhZ2dpbmcuXG4gICAgICAgICAqIGJlIGNhcmVmdWwgd2l0aCB1c2luZyB0aGlzLCBpdCBjYW4gYmUgdmVyeSBhbm5veWluZyBmb3IgdXNlcnMgdG8gYmUgc3R1Y2sgb24gdGhlIHBhZ2VcbiAgICAgICAgICogQHByb3BlcnR5IHByZXZlbnREZWZhdWx0XG4gICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgcHJldmVudERlZmF1bHQ6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBkaXNhYmxlIG1vdXNlIGV2ZW50cywgc28gb25seSB0b3VjaCAob3IgcGVuISkgaW5wdXQgdHJpZ2dlcnMgZXZlbnRzXG4gICAgICAgICAqIEBwcm9wZXJ0eSBwcmV2ZW50TW91c2VcbiAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBwcmV2ZW50TW91c2U6IGZhbHNlXG4gICAgfSxcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiB0b3VjaEdlc3R1cmUoZXYsIGluc3QpIHtcbiAgICAgICAgaWYoaW5zdC5vcHRpb25zLnByZXZlbnRNb3VzZSAmJiBldi5wb2ludGVyVHlwZSA9PSBQT0lOVEVSX01PVVNFKSB7XG4gICAgICAgICAgICBldi5zdG9wRGV0ZWN0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihpbnN0Lm9wdGlvbnMucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfVE9VQ0gpIHtcbiAgICAgICAgICAgIGluc3QudHJpZ2dlcigndG91Y2gnLCBldik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEBtb2R1bGUgZ2VzdHVyZXNcbiAqL1xuLyoqXG4gKiBVc2VyIHdhbnQgdG8gc2NhbGUgb3Igcm90YXRlIHdpdGggMiBmaW5nZXJzXG4gKiBQcmV2ZW50aW5nIHRoZSBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3IgaXMgYSBnb29kIHdheSB0byBpbXByb3ZlIGZlZWwgYW5kIHdvcmtpbmcuIFRoaXMgY2FuIGJlIGRvbmUgd2l0aCB0aGVcbiAqIGBwcmV2ZW50RGVmYXVsdGAgb3B0aW9uLlxuICpcbiAqIEBjbGFzcyBUcmFuc2Zvcm1cbiAqIEBzdGF0aWNcbiAqL1xuLyoqXG4gKiBAZXZlbnQgdHJhbnNmb3JtXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuLyoqXG4gKiBAZXZlbnQgdHJhbnNmb3Jtc3RhcnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCB0cmFuc2Zvcm1lbmRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCBwaW5jaGluXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqL1xuLyoqXG4gKiBAZXZlbnQgcGluY2hvdXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG4vKipcbiAqIEBldmVudCByb3RhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICovXG5cbi8qKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqL1xuKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdHJpZ2dlcmVkID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1HZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgICAgIHN3aXRjaChldi5ldmVudFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgRVZFTlRfU1RBUlQ6XG4gICAgICAgICAgICAgICAgdHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRVZFTlRfTU9WRTpcbiAgICAgICAgICAgICAgICAvLyBhdCBsZWFzdCBtdWx0aXRvdWNoXG4gICAgICAgICAgICAgICAgaWYoZXYudG91Y2hlcy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc2NhbGVUaHJlc2hvbGQgPSBNYXRoLmFicygxIC0gZXYuc2NhbGUpO1xuICAgICAgICAgICAgICAgIHZhciByb3RhdGlvblRocmVzaG9sZCA9IE1hdGguYWJzKGV2LnJvdGF0aW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIGRpc3RhbmNlIHdlIG1vdmVkIGlzIHRvbyBzbWFsbCB3ZSBza2lwIHRoaXMgZ2VzdHVyZVxuICAgICAgICAgICAgICAgIC8vIG9yIHdlIGNhbiBiZSBhbHJlYWR5IGluIGRyYWdnaW5nXG4gICAgICAgICAgICAgICAgaWYoc2NhbGVUaHJlc2hvbGQgPCBpbnN0Lm9wdGlvbnMudHJhbnNmb3JtTWluU2NhbGUgJiZcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb25UaHJlc2hvbGQgPCBpbnN0Lm9wdGlvbnMudHJhbnNmb3JtTWluUm90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHdlIGFyZSB0cmFuc2Zvcm1pbmchXG4gICAgICAgICAgICAgICAgRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBmaXJzdCB0aW1lLCB0cmlnZ2VyIGRyYWdzdGFydCBldmVudFxuICAgICAgICAgICAgICAgIGlmKCF0cmlnZ2VyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdC50cmlnZ2VyKG5hbWUgKyAnc3RhcnQnLCBldik7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaW5zdC50cmlnZ2VyKG5hbWUsIGV2KTsgLy8gYmFzaWMgdHJhbnNmb3JtIGV2ZW50XG5cbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHJvdGF0ZSBldmVudFxuICAgICAgICAgICAgICAgIGlmKHJvdGF0aW9uVGhyZXNob2xkID4gaW5zdC5vcHRpb25zLnRyYW5zZm9ybU1pblJvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3QudHJpZ2dlcigncm90YXRlJywgZXYpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgcGluY2ggZXZlbnRcbiAgICAgICAgICAgICAgICBpZihzY2FsZVRocmVzaG9sZCA+IGluc3Qub3B0aW9ucy50cmFuc2Zvcm1NaW5TY2FsZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0LnRyaWdnZXIoJ3BpbmNoJywgZXYpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0LnRyaWdnZXIoJ3BpbmNoJyArIChldi5zY2FsZSA8IDEgPyAnaW4nIDogJ291dCcpLCBldik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEVWRU5UX1JFTEVBU0U6XG4gICAgICAgICAgICAgICAgaWYodHJpZ2dlcmVkICYmIGV2LmNoYW5nZWRMZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3QudHJpZ2dlcihuYW1lICsgJ2VuZCcsIGV2KTtcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgSGFtbWVyLmdlc3R1cmVzLlRyYW5zZm9ybSA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgaW5kZXg6IDQ1LFxuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBtaW5pbWFsIHNjYWxlIGZhY3Rvciwgbm8gc2NhbGUgaXMgMSwgem9vbWluIGlzIHRvIDAgYW5kIHpvb21vdXQgdW50aWwgaGlnaGVyIHRoZW4gMVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHRyYW5zZm9ybU1pblNjYWxlXG4gICAgICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAgICAgICAgICogQGRlZmF1bHQgMC4wMVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0cmFuc2Zvcm1NaW5TY2FsZTogMC4wMSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByb3RhdGlvbiBpbiBkZWdyZWVzXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkgdHJhbnNmb3JtTWluUm90YXRpb25cbiAgICAgICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAgICAgKiBAZGVmYXVsdCAxXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRyYW5zZm9ybU1pblJvdGF0aW9uOiAxXG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlcjogdHJhbnNmb3JtR2VzdHVyZVxuICAgIH07XG59KSgndHJhbnNmb3JtJyk7XG5cbi8qKlxuICogQG1vZHVsZSBoYW1tZXJcbiAqL1xuXG4vLyBBTUQgZXhwb3J0XG5pZih0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEhhbW1lcjtcbiAgICB9KTtcbi8vIGNvbW1vbmpzIGV4cG9ydFxufSBlbHNlIGlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIYW1tZXI7XG4vLyBicm93c2VyIGV4cG9ydFxufSBlbHNlIHtcbiAgICB3aW5kb3cuSGFtbWVyID0gSGFtbWVyO1xufVxuXG59KSh3aW5kb3cpOyIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJcbi8qKlxuICogaXNBcnJheVxuICovXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiB0b1N0cmluZ1xuICovXG5cbnZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBgdmFsYFxuICogaXMgYW4gYXJyYXkuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgaXNBcnJheShbXSk7XG4gKiAgICAgICAgLy8gPiB0cnVlXG4gKiAgICAgICAgaXNBcnJheShhcmd1bWVudHMpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqICAgICAgICBpc0FycmF5KCcnKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKlxuICogQHBhcmFtIHttaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiAhISB2YWwgJiYgJ1tvYmplY3QgQXJyYXldJyA9PSBzdHIuY2FsbCh2YWwpO1xufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXX0=
(1)
});

