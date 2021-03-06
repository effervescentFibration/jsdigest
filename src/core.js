function factorMAC( MAC, FN, DIGEST, BLOCK ) {
  return function ( size, data, key ) {
    if ( 'number' !== typeof size ) {
      key = data;
      data = size;
      size = DIGEST;
    }
    
    size = Math.max( 0, Math.min( DIGEST, size ) );
    
    var result;

    if ( null == key ) {
      result = FN( toBuffer(data) );
    } else {
      result = MAC( FN, BLOCK, toBuffer(data), toBuffer(key) );
    }
    
    return Encoder( crop( size, result, false ) );
  };
}

function isBuffer( obj ) {
  return '[object Array]' === Object.prototype.toString.call( obj );
}

function toBuffer( input, format ) {
  if ( isBuffer( input ) )
    return input.slice();

  if ( format === 'hex' )
    return parseHex( input );

  return utf8( input );
}

function parseHex( input ) {
  var result = [];

  while ( input.length >= 2 ) {
    result.push(parseInt(input.substr(0, 2), 16));
    input = input.substr(2);
  }

  // when containing a single, trailing digit,
  // fill in further trialing `0`
  if ( input.length ) {
    result.push(parseInt(input + '0', 16 ));
  }

  return result;
}

function utf8( input ) {
  var i, code,
    length = input.length,
    result = [];
  
  for ( i = 0; i < length; i++ ) {
    code = input.charCodeAt(i);
    
    if ( code < 0x80 ) {
      result.push( code );
    } else if ( code < 0x800 ) {
      result.push( 0xc0 + ( ( code >> 6 ) & 0x1f ) );
      result.push( 0x80 + ( ( code >> 0 ) & 0x3f ) );
    } else {
      result.push( 0xe0 + ( ( code >> 12 ) & 0x0f ) );
      result.push( 0x80 + ( ( code >>  6 ) & 0x3f ) );
      result.push( 0x80 + ( ( code >>  0 ) & 0x3f ) );
    }
  }
  
  return result;
}

function hmac( fn, block, data, key ) {
  var i,
      ipad = [],
      opad = [];
  
  if ( key.length > block )
    key = fn( key );
  
  for ( i = 0; i < block; i++ ) {
    ipad[i] = ( key[i] || 0x00 ) ^ 0x36;
    opad[i] = ( key[i] || 0x00 ) ^ 0x5c;
  }
  
  return fn( opad.concat( fn( ipad.concat( data ) ) ) );
}

function crop( size, hash, righty ) {
  var length = Math.floor( ( size + 7 ) / 8 ),
      remain = size % 8;
  
  if ( righty ) {
    hash = hash.slice( hash.length - length );
  } else {
    hash = hash.slice( 0, length );
  }
  
  if ( remain > 0 ) {
    hash[ length - 1 ] &= ( 0xff << ( 8 - remain ) ) & 0xff;
  }
  
  return hash;
}

self.toBuffer = toBuffer;

self.toArray = function ( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i++ ) {
    output.push( input.charCodeAt(i) & 0xff );
  }
  
  return output;
};
