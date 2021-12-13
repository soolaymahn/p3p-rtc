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
    v: 1,
    iter: 1e4,
    ks: 128,
    ts: 64,
    mode: "ccm",
    adata: "",
    cipher: "aes",
    salt,
    iv: [-477891566, -640649796, 1381343517, 817002527],
  };
  var rp = {};
  return window.sjcl.encrypt(password, plaintext, p, rp);
}

/* Decrypt a message */
export function sjclDecrypt(ciphertext, password) {
  var rp;

  if (ciphertext.length === 0) {
    return;
  }

  try {
    return sjcl.decrypt(password, ciphertext, {}, rp);
  } catch (e) {
    console.log(e);
    return;
  }
}
