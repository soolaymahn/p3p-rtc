export async function initEncryption() {
  console.log({ sjcl: window.sjcl });
}

/* Encrypt a message */
export function sjclEncrypt(plaintext, password, salt) {
  if (plaintext === "") {
    return;
  }
  if (password.length === 0) {
    return;
  }

  var p = {
    adata: "",
    iter: 1000,
    mode: "CCM",
    ts: 64,
    ks: 128,
    iv: [],
    salt,
  };
  return window.sjcl.encrypt(password, plaintext, p, {});
}

/* Decrypt a message */
export function sjclDecrypt(ciphertext, password, salt) {
  var key;

  if (ciphertext.length === 0) {
    return;
  }

  ciphertext = window.sjcl.codec.base64.toBits(ciphertext);
  if (key.length === 0) {
    if (password.length) {
      key = doPbkdf2(128, salt, password);
    }
  }
  var aes = new window.sjcl.cipher.aes(key);

  try {
    return window.sjcl.codec.utf8String.fromBits(
      window.sjcl.mode["CCM"].decrypt(aes, ciphertext, [], "", "64")
    );
  } catch (e) {
    return;
  }
}

function doPbkdf2(keysize, salt, password) {
  var p = {
    iter: 1000,
    salt,
  };

  if (password.length === 0) {
    return;
  }

  p = window.sjcl.misc.cachedPbkdf2(password, p);
  return p.key.slice(0, keysize / 32);
}
