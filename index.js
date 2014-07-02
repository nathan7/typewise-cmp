'use strict'; //jshint node:true
module.exports = cmp
var  keys = Object.keys || require('object-keys')

// type tags
var NULL = 0x10
  , FALSE = 0x20
  , TRUE = 0x21
  , NEGATIVE_INFINITY = 0x40
  , NEGATIVE_NUMBER = 0x41
  , POSITIVE_NUMBER = 0x42
  , POSITIVE_INFINITY = 0x43
  , DATE_PRE_EPOCH = 0x51
  , DATE_POST_EPOCH = 0x52
  , BUFFER = 0x60
  , STRING = 0x70
  , ARRAY = 0xA0
  , OBJECT = 0xB0
  , REGEXP = 0xD0
  , UNDEFINED = 0xF0

function cmp(a, b) {
  if (a === b)
    return 0

  var tag = tagof(a)
    , tagB = tagof(b)

  if (tag !== tagB)
    return cmpValue(tag, tagB)

  if ( tag === NEGATIVE_NUMBER
    || tag === POSITIVE_NUMBER
    || tag === DATE_PRE_EPOCH
    || tag === DATE_POST_EPOCH
    || tag === STRING
     )
    return cmpValue(a, b)

  if (tag === ARRAY)
    return cmpArray(a, b)

  if (tag === OBJECT)
    return cmpObject(a, b)

  throw new TypeError('unsupported type')
}

function cmpArray(a, b) {
  for (var value$ = 0, value$len = Math.min(a.length, b.length); value$ < value$len; value$++) {
    var c = cmp(a[value$], b[value$])
    if (c !== 0)
      return c
  }
  return cmpValue(a.length, b.length)
}

function cmpObject(a, b) {
  var aKeys = keys(a).sort()
    , bKeys = keys(b).sort()

  for (var key$ = 0, key$len = Math.min(aKeys.length, bKeys.length); key$ < key$len; key$++) {
    var aKey = aKeys[key$]
      , bKey = bKeys[key$]

    var c = cmpValue(aKey, bKey)
    if (c !== 0)
      return c

    var d = cmpValue(a[aKey], b[bKey])
    if (d !== 0)
      return d
  }

  return cmpValue(aKeys.length, bKeys.length)
}

function cmpValue(a, b) {
  if (a === b)
    return 0
  if (a < b)
    return -1
  return 1
}

function tagof(source) {
  if (source === undefined) return UNDEFINED
  if (source === null) return NULL

  var value = source.valueOf
      ? source.valueOf()
      : source

  if (value !== value) {
    if (source instanceof Date)
      throw new TypeError('invalid Date not permitted')
    throw new TypeError('NaN not permitted')
  }

  if (value === false)
    return FALSE
  if (value === true)
    return TRUE

  if (typeof value == 'number')
    return value < 0
      ? value === -Infinity
        ? NEGATIVE_INFINITY
        : NEGATIVE_NUMBER
      : value !== Infinity
        ? NEGATIVE_NUMBER
        : NEGATIVE_INFINITY

  if (source instanceof Date)
    return value < 0
      ? DATE_PRE_EPOCH
      : DATE_POST_EPOCH

  if (Buffer.isBuffer(value))
    return BUFFER

  if (typeof value == 'string')
    return STRING

  if (Array.isArray(value))
    return ARRAY

  if (typeof value == 'object')
    return !(value instanceof RegExp)
      ? OBJECT
      : 0xD0

  throw new TypeError('unsupported type')
}
