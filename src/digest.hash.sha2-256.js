/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  SHA (c) 2006 The Internet Society
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  function sha2(data, hash, part) {
    var a, b, c, d, e, f, g, h, i, t, tmp1, tmp2, w, x,
      bytes, bitHi, bitLo,
      padlen, padding,
      K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
      ];
    
    function rotr(x, n) {
      return ((x >>> n) | (x << (32 - n)));
    }
    
    function shr(x, n) {
      return x >>> n;
    }
    
    function merge(input) {
      var i, j, output = [];
      for (i = 0, j = 0; j < input.length; i += 1, j = (i * 4)) {
        output[i] = 
          ((input[j + 0] & 0xff) << 24) |
          ((input[j + 1] & 0xff) << 16) |
          ((input[j + 2] & 0xff) <<  8) |
          ((input[j + 3] & 0xff) <<  0);
      }
      return output;
    }
    
    function split(input) {
      var i, output = [];
      for (i = 0; i < input.length; i += 1) {
        output.push((input[i] >> 24) & 0xff);
        output.push((input[i] >> 16) & 0xff);
        output.push((input[i] >>  8) & 0xff);
        output.push((input[i] >>  0) & 0xff);
      }
      return output;
    }
    
    function bSig0(x) {
      return rotr(x,  2) ^ rotr(x, 13) ^ rotr(x, 22);
    }
    function bSig1(x) {
      return rotr(x,  6) ^ rotr(x, 11) ^ rotr(x, 25);
    }
    function sSig0(x) {
      return rotr(x,  7) ^ rotr(x, 18) ^ shr(x,  3);
    }
    function sSig1(x) {
      return rotr(x, 17) ^ rotr(x, 19) ^ shr(x, 10);
    }
    
    function ch(x, y, z) {
      return (x & y) ^ ((~x) & z);
    }
    function maj(x, y, z) {
      return (x & y) ^ (x & z) ^ (y & z);
    }
    
    // pad data
    bytes = data.length;
    bitLo = (bytes * 8) & 0xffffffff;
    bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
    
    padding = '\x80';
    padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
    while (padding.length < padlen) {
      padding += '\x00';
    }
    
    data += padding;
    x = merge(Digest.Encoder(data).single()).concat([bitHi, bitLo]);
    
    for (i = 0, w = []; i < x.length; i += 16) {
      a = hash[0];
      b = hash[1];
      c = hash[2];
      d = hash[3];
      e = hash[4];
      f = hash[5];
      g = hash[6];
      h = hash[7];
      
      for (t = 0; t < 64; t += 1) {
        if (t < 16) {
          w[t] = x[i + t];
        } else {
          w[t] = sSig1(w[t - 2]) + w[t - 7] + sSig0(w[t - 15]) + w[t - 16];
        }
        
        tmp1 = h + bSig1(e) + ch(e, f, g) + K[t] + w[t];
        tmp2 = bSig0(a) + maj(a, b, c);
        h = g;
        g = f;
        f = e;
        e = d + tmp1;
        d = c;
        c = b;
        b = a;
        a = tmp1 + tmp2;
      }
      
      hash[0] += a;
      hash[1] += b;
      hash[2] += c;
      hash[3] += d;
      hash[4] += e;
      hash[5] += f;
      hash[6] += g;
      hash[7] += h;
    }
    
    return Digest.Encoder(split(hash.slice(0, part)));
  }
  
  this.Digest.fn.sha224 = function sha224(data, ansi) {
    if ('string' !== typeof data) {
      throw new Error('Data must be a String');
    }
    
    // single-byte encode data, either UTF-8 or truncated
    data = Digest.Encoder(data)[true === ansi ? 'ansi' : 'unicode']();
    
    var HASH = [
      0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
      0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
    ];
    
    return sha2(data, HASH, 7);
  };
  
  this.Digest.fn.sha256 = function sha256(data, ansi) {
    if ('string' !== typeof data) {
      throw new Error('Data must be a String');
    }
    
    // single-byte encode data, either UTF-8 or truncated
    data = Digest.Encoder(data)[true === ansi ? 'ansi' : 'unicode']();
    
    var HASH = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    
    return sha2(data, HASH, 8);
  };
  
}());