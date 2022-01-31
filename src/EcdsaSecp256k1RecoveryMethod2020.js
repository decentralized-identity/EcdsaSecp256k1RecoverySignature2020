'use strict';
const base64url = require("base64url");
const ES256KR = require("./ES256K-R");

class EcdsaSecp256k1RecoveryMethod2020 {
  /**
   * @param {KeyPairOptions} options - The options to use.
   * @param {string} options.id - The key ID.
   * @param {string} options.controller - The key controller.
   * @param {string} options.publicKeyJwk - The JWK encoded Public Key.
   * @param {string} options.privateKeyJwk - The JWK Private Key.
   * @param {string} options.publicKeyHex - The hex encoded compressed Public Key.
   * @param {string} options.privateKeyHex - The hex encoded compressed Private Key.
   * @param {string} options.ethereumAddress - The checksum encoded Ethereum Address.
   * @param {string} options.blockchainAccountId - The checksum encoded Blockchain Account ID.
   */
  constructor(options = {}) {
    Object.keys(options).forEach((k) => {
      this[k] = options[k];
    });
    if (options.type !== "EcdsaSecp256k1RecoveryMethod2020") {
      throw new Error(
        "EcdsaSecp256k1RecoveryMethod2020 is only supported type."
      );
    }
  }

  /**
   * Returns the public key.
   *
   * @returns {string | object} The public key.
   */
  get publicKey() {
    if (this.publicKeyJwk) {
      return this.publicKeyJwk;
    }
    if (this.publicKeyHex) {
      return this.publicKeyHex;
    }
  }

  /**
   * Returns a private key.
   *
   * @returns {string | object} The private key.
   */
  get privateKey() {
    if (this.privateKeyJwk) {
      return this.privateKeyJwk;
    }
    if (this.privateKeyHex) {
      return this.privateKeyHex;
    }
  }

  /**
   * Returns a signer object for use with jsonld-signatures.
   *
   * @returns {{sign: Function}} A signer for the json-ld block.
   */
  signer() {
    return joseSignerFactory(this);
  }

  /**
   * Returns a verifier object for use with jsonld-signatures.
   *
   * @returns {{verify: Function}} Used to verify jsonld-signatures.
   */
  verifier() {
    return joseVerifierFactory(this);
  }

  /**
   * Adds a public key base to a public key node.
   *
   * @param {Object} publicKeyNode - The public key node in a jsonld-signature.
   * @param {string} publicKeyNode.publicKeyJwk - JWK Public Key for
   *   jsonld-signatures.
   * @param {string} publicKeyNode.publicKeyHex - Hex Public Key for
   *   jsonld-signatures.
   * @param {string} publicKeyNode.ethereumAddress - ethereumAddress for
   *   jsonld-signatures.
   * @param {string} publicKeyNode.blockchainAccountId - blockchainAccountId for
   *   jsonld-signatures.
   *
   * @returns {Object} A PublicKeyNode in a block.
   */
  addEncodedPublicKey(publicKeyNode) {
    if (this.publicKeyJwk) {
      publicKeyNode.publicKeyJwk = this.publicKeyJwk;
    }
    if (this.publicKeyHex) {
      publicKeyNode.publicKeyHex = this.publicKeyHex;
    }
    if (this.ethereumAddress) {
      publicKeyNode.ethereumAddress = this.ethereumAddress;
    }
    if (this.blockchainAccountId) {
      publicKeyNode.blockchainAccountId = this.blockchainAccountId;
    }
    return publicKeyNode;
  }

  static async from(options) {
    return new EcdsaSecp256k1RecoveryMethod2020(options);
  }

  /**
   * Contains the public key for the KeyPair
   * and other information that json-ld Signatures can use to form a proof.
   * @param {Object} [options={}] - Needs either a controller or owner.
   * @param {string} [options.controller=this.controller]  - DID of the
   * person/entity controlling this key pair.
   *
   * @returns {Object} A public node with
   * information used in verification methods by signatures.
   */
  publicNode({ controller = this.controller } = {}) {
    const publicNode = {
      id: this.id,
      type: this.type,
    };
    if (controller) {
      publicNode.controller = controller;
    }
    this.addEncodedPublicKey(publicNode); // Subclass-specific
    return publicNode;
  }
}

/**
 * @ignore
 * Returns an object with an async sign function.
 * The sign function is bound to the KeyPair
 * and then returned by the KeyPair's signer method.
 * @param {EcdsaSecp256k1RecoveryMethod2020} key - An EcdsaSecp256k1RecoveryMethod2020.
 *
 * @returns {{sign: Function}} An object with an async function sign
 * using the private key passed in.
 */
function joseSignerFactory(vm) {
  if (!vm.privateKeyJwk && !vm.privateKeyHex) {
    return {
      async sign() {
        throw new Error("No private vm to sign with.");
      },
    };
  }

  return {
    async sign({ data }) {
      const header = {
        alg: "ES256K-R",
        b64: false,
        crit: ["b64"],
      };
      const toBeSigned = Buffer.from(data.buffer, data.byteOffset, data.length);
      return ES256KR.signDetached(toBeSigned, vm, header);
    },
  };
}

/**
 * @ignore
 * Returns an object with an async verify function.
 * The verify function is bound to the KeyPair
 * and then returned by the KeyPair's verifier method.
 * @param {EcdsaSecp256k1RecoveryMethod2020} key - An EcdsaSecp256k1RecoveryMethod2020.
 *
 * @returns {{verify: Function}} An async verifier specific
 * to the key passed in.
 */
const joseVerifierFactory = (vm) => {
  if (
    vm.publicKeyJwk === undefined &&
    vm.publicKeyHex === undefined &&
    vm.blockchainAccountId === undefined &&
    vm.ethereumAddress === undefined
  ) {
    return {
      async verify() {
        throw new Error("No vm to verify with.");
      },
    };
  }

  return {
    async verify({ data, signature }) {
      const alg = "ES256K-R";
      const type = "EcdsaSecp256k1RecoveryMethod2020";
      const [encodedHeader, encodedSignature] = signature.split("..");
      let header;
      try {
        header = JSON.parse(base64url.decode(encodedHeader));
      } catch (e) {
        throw new Error("Could not parse JWS header; " + e);
      }
      if (!(header && typeof header === "object")) {
        throw new Error("Invalid JWS header.");
      }

      if (header.alg !== alg) {
        throw new Error(
          `Invalid JWS header, expected ${header.alg} === ${alg}.`
        );
      }

      // confirm header matches all expectations
      if (
        !(
          header.alg === alg &&
          header.b64 === false &&
          Array.isArray(header.crit) &&
          header.crit.length === 1 &&
          header.crit[0] === "b64"
        ) &&
        Object.keys(header).length === 3
      ) {
        throw new Error(
          `Invalid JWS header parameters ${JSON.stringify(header)} for ${type}.`
        );
      }

      let verified = false;

      const payload = Buffer.from(data.buffer, data.byteOffset, data.length);

      try {
        verified = ES256KR.verifyDetached(signature, payload, vm);
      } catch (e) {
        console.error("An error occurred when verifying signature: ", e);
      }
      return verified;
    },
  };
};

module.exports = EcdsaSecp256k1RecoveryMethod2020;
