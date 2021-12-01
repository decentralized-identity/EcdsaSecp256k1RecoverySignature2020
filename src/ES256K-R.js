const crypto = require("crypto");
const keyto = require("@trust/keyto");
const base64url = require("base64url");
const { binToHex, hexToBin, instantiateSecp256k1 } = require("bitcoin-ts");
const publicKeyToAddress = require("ethereum-public-key-to-address");

const stringify = require("json-stringify-deterministic");
const getKid = (
  jwk
  //: ISecp256k1PrivateKeyJWK | ISecp256k1PublicJWK
) => {
  const copy = { ...jwk }; // as any;
  delete copy.d;
  delete copy.kid;
  delete copy.alg;
  const digest = crypto.createHash("sha256").update(stringify(copy)).digest();

  return base64url.encode(Buffer.from(digest));
};

const compressedHexEncodedPublicKeyLength = 66;

const publicJWKFromPublicKeyHex = async (
  publicKeyHex
  //: string
) => {
  const secp256k1 = await instantiateSecp256k1();
  let key = publicKeyHex;
  if (publicKeyHex.length === compressedHexEncodedPublicKeyLength) {
    key = binToHex(secp256k1.uncompressPublicKey(hexToBin(publicKeyHex)));
  }
  const jwk = {
    ...keyto.from(key, "blk").toJwk("public"),
    crv: "secp256k1",
  };
  const kid = getKid(jwk);

  return {
    ...jwk,
    kid,
  };
};

const privateKeyHexFromJWK = async (
  jwk
  //: ISecp256k1PrivateKeyJWK
) => {
  return keyto
    .from(
      {
        ...jwk,
        crv: "K-256",
      },
      "jwk"
    )
    .toString("blk", "private");
};

const privateJWKFromPrivateKeyHex = async (
  privateKeyHex
  //: string
) => {
  const jwk = {
    ...keyto.from(privateKeyHex, "blk").toJwk("private"),
    crv: "secp256k1",
  };
  const kid = getKid(jwk);
  return {
    ...jwk,
    kid,
  };
};

const privateKeyUInt8ArrayFromJWK = async (
  jwk //: ISecp256k1PrivateKeyJWK
) => {
  const privateKeyHex = await privateKeyHexFromJWK(jwk);
  return hexToBin(privateKeyHex);
};

const publicKeyHexFromJWK = async (
  jwk
  //: ISecp256k1PublicJWK
) => {
  const secp256k1 = await instantiateSecp256k1();
  const uncompressedPublicKey = keyto
    .from(
      {
        ...jwk,
        crv: "K-256",
      },
      "jwk"
    )
    .toString("blk", "public");
  const compressed = secp256k1.compressPublicKey(
    hexToBin(uncompressedPublicKey)
  );
  return binToHex(compressed);
};

const publicKeyUInt8ArrayFromJWK = async (
  jwk
  //: ISecp256k1PublicJWK
) => {
  const publicKeyHex = await publicKeyHexFromJWK(jwk);
  return hexToBin(publicKeyHex);
};

/** Produce a JWS Unencoded Payload per https://tools.ietf.org/html/rfc7797#section-6 */
const signDetached = async (
  // in the case of EcdsaSecp256k1Signature2019 this is the result of createVerifyData
  payload, //: Buffer,
  vm, //: cryto-ld like key....,
  header = {
    alg: "ES256K-R",
    b64: false,
    crit: ["b64"],
  }
) => {
  let privateKeyUInt8Array;
  if (vm.privateKeyJwk) {
    privateKeyUInt8Array = await privateKeyUInt8ArrayFromJWK(vm.privateKeyJwk);
  }
  if (vm.privateKeyHex) {
    privateKeyUInt8Array = await privateKeyUInt8ArrayFromJWK(
      await privateJWKFromPrivateKeyHex(vm.privateKeyHex)
    );
  }

  const secp256k1 = await instantiateSecp256k1();
  const encodedHeader = base64url.encode(JSON.stringify(header));

  const toBeSignedBuffer = Buffer.concat([
    Buffer.from(encodedHeader + ".", "utf8"),
    Buffer.from(payload.buffer, payload.byteOffset, payload.length),
  ]);

  const message = Buffer.from(toBeSignedBuffer);

  const digest = crypto
    .createHash("sha256")
    .update(message)
    .digest()
    .toString("hex");

  const messageHashUInt8Array = hexToBin(digest);

  const { recoveryId, signature } = secp256k1.signMessageHashRecoverableCompact(
    privateKeyUInt8Array,
    messageHashUInt8Array
  );

  const signatureUInt8Array = Buffer.concat([
    Buffer.from(signature),
    Buffer.from(new Uint8Array([recoveryId])),
  ]);
  // console.log(recoveryId);

  // console.log(signatureUInt8Array);
  // const signatureUInt8Array = secp256k1.signMessageHashCompact(
  //   privateKeyUInt8Array,
  //   messageHashUInt8Array
  // );
  // console.log(signatureUInt8Array.length);

  const signatureHex = binToHex(signatureUInt8Array);
  const encodedSignature = base64url.encode(Buffer.from(signatureHex, "hex"));

  return `${encodedHeader}..${encodedSignature}`;
};

const verifyDetached = async (
  jws, //: string,
  payload, //: Buffer,
  vm //: cryto-ld like key....,
) => {
  if (jws.indexOf("..") === -1) {
    throw new JWSVerificationFailed("not a valid rfc7797 jws.");
  }
  const [encodedHeader, encodedSignature] = jws.split("..");
  const header = JSON.parse(base64url.decode(encodedHeader));
  if (header.alg !== "ES256K-R") {
    throw new Error("JWS alg is not signed with ES256K-R.");
  }
  if (
    header.b64 !== false ||
    !header.crit ||
    !header.crit.length ||
    header.crit[0] !== "b64"
  ) {
    throw new Error("JWS Header is not in rfc7797 format (not detached).");
  }

  let publicKeyUInt8Array;
  if (vm.publicKeyJwk) {
    publicKeyUInt8Array = await publicKeyUInt8ArrayFromJWK(vm.publicKeyJwk);
  }
  if (vm.publicKeyHex) {
    publicKeyUInt8Array = await publicKeyUInt8ArrayFromJWK(
      await publicJWKFromPublicKeyHex(vm.publicKeyHex)
    );
  }
  // not a public key...
  // if (vm.ethereumAddress) {
  //   publicKeyUInt8Array = await publicKeyUInt8ArrayFromJWK(
  //     await publicJWKFromPublicKeyHex(vm.publicKeyHex)
  //   );
  // }

  const secp256k1 = await instantiateSecp256k1();
  const toBeSignedBuffer = Buffer.concat([
    Buffer.from(encodedHeader + ".", "utf8"),
    Buffer.from(payload.buffer, payload.byteOffset, payload.length),
  ]);
  const message = Buffer.from(toBeSignedBuffer);

  const digest = crypto
    .createHash("sha256")
    .update(message)
    .digest()
    .toString("hex");
  const messageHashUInt8Array = hexToBin(digest);
  let signatureUInt8Array = hexToBin(
    base64url.toBuffer(encodedSignature).toString("hex")
  );
  if (publicKeyUInt8Array) {
    const verified = secp256k1.verifySignatureCompact(
      signatureUInt8Array,
      publicKeyUInt8Array,
      messageHashUInt8Array
    );
    if (verified) {
      return true;
    }
    throw new Error(
      "Cannot verify detached signature from " + JSON.stringify(vm, null, 2)
    );
  }
  // console.log(signatureUInt8Array.length);
  const recoveryId = signatureUInt8Array[64];

  signatureUInt8Array = signatureUInt8Array.slice(0, 64);
  publicKeyUInt8Array = secp256k1.recoverPublicKeyCompressed(
    signatureUInt8Array,
    recoveryId,
    messageHashUInt8Array
  );

  const computedRecoveredEthereumAddress = publicKeyToAddress(
    Buffer.from(publicKeyUInt8Array)
  );

  if (
    vm.ethereumAddress &&
    vm.ethereumAddress === computedRecoveredEthereumAddress
  ) {
    return true;
  }

  if (vm.blockchainAccountId) {
    const [chainNamespace, chainReference, accountAddress] = vm.blockchainAccountId.split(":");
    if (chainNamespace === 'eip155') {
      if (accountAddress === computedRecoveredEthereumAddress) {
        return true;
      }
    }
  }

  throw new Error("Cannot verify detached signature.");
};

module.exports = {
  publicJWKFromPublicKeyHex,
  privateJWKFromPrivateKeyHex,
  privateKeyHexFromJWK,
  publicKeyHexFromJWK,
  privateKeyUInt8ArrayFromJWK,
  publicKeyUInt8ArrayFromJWK,
  signDetached,
  verifyDetached,
  publicKeyToEthereumAddress: publicKeyToAddress,
};
