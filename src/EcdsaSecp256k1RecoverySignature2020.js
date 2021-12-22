const {
  suites: { LinkedDataSignature },
} = require("jsonld-signatures");

const jsonld = require("jsonld");

const LDKeyClass = require("./EcdsaSecp256k1RecoveryMethod2020");

class EcdsaSecp256k1RecoverySignature2020 extends LinkedDataSignature {
  /**
   * @param linkedDataSigantureType {string} The name of the signature suite.
   * @param linkedDataSignatureVerificationKeyType {string} The name verification key type for the signature suite.
   *
   * @param [LDKeyClass] {LDKeyClass} provided by subclass or subclass
   *   overrides `getVerificationMethod`.
   *
   *
   * This parameter is required for signing:
   *
   * @param [signer] {function} an optional signer.
   *
   * @param [proofSignatureKey] {string} the property in the proof that will contain the signature.
   * @param [date] {string|Date} signing date to use if not passed.
   * @param [key] {LDKeyPair} an optional crypto-ld KeyPair.
   * @param [useNativeCanonize] {boolean} true to use a native canonize
   *   algorithm.
   */
  constructor({
    alg,
    signer,
    key,
    proofSignatureKey,
    date,
    useNativeCanonize,
  } = {}) {
    super({
      type: "EcdsaSecp256k1RecoverySignature2020",
      contextUrl: "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
      LDKeyClass,
      alg,
      date,
      useNativeCanonize,
    });
    this.signer = signer;
    this.LDKeyClass = LDKeyClass;
    this.proofSignatureKey = proofSignatureKey || "jws";

    if (key) {
      const publicKey = key.publicNode();
      this.verificationMethod = publicKey.id;
      this.key = key;
      if (typeof key.signer === "function") {
        this.signer = key.signer();
      }
      if (typeof key.verifier === "function") {
        this.verifier = key.verifier(key, this.alg, this.type);
      }
    }
  }

  /**
   * @param verifyData {Uint8Array}.
   * @param proof {object}
   *
   * @returns {Promise<{object}>} the proof containing the signature value.
   */
  async sign({ verifyData, proof }) {
    if (!(this.signer && typeof this.signer.sign === "function")) {
      throw new Error("A signer API has not been specified.");
    }

    proof[this.proofSignatureKey] = await this.signer.sign({
      data: verifyData,
    });
    return proof;
  }

  /**
   * @param verifyData {Uint8Array}.
   * @param verificationMethod {object}.
   * @param document {object} the document the proof applies to.
   * @param proof {object} the proof to be verified.
   * @param purpose {ProofPurpose}
   * @param documentLoader {function}
   * @param expansionMap {function}
   *
   * @returns {Promise<{boolean}>} Resolves with the verification result.
   */
  async verifySignature({ verifyData, verificationMethod, proof }) {
    let { verifier } = this;
    if (!verifier) {
      const key = await this.LDKeyClass.from(verificationMethod);
      verifier = key.verifier(key, this.alg, this.type);
    }
    return await verifier.verify({
      data: Buffer.from(verifyData),
      signature: proof[this.proofSignatureKey],
    });
  }

  async assertVerificationMethod({ verificationMethod }) {
    if (
      !jsonld.hasValue(
        verificationMethod,
        "type",
        "EcdsaSecp256k1RecoveryMethod2020"
      )
    ) {
      throw new Error(
        `Invalid key type. Key type must be "EcdsaSecp256k1RecoveryMethod2020".`
      );
    }
  }

  async getVerificationMethod({ proof, documentLoader }) {
    if (this.key) {
      return this.key.publicNode();
    }
    // replaces:
    // const verificationMethod = await super.getVerificationMethod({
    //   proof,
    //   documentLoader,
    // });
    // Because hard coding security contexts prevents extension using base class
    // https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/LinkedDataSignature.js#L233
    let controller = (await documentLoader(proof.verificationMethod)).document;
    const verificationMethod = await jsonld.frame(
      controller,
      {
        "@context": [
          "https://w3id.org/security/v2",
          "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
        ],
        "@embed": "@always",
        id: proof.verificationMethod,
      },
      { documentLoader, compactToRelative: false }
    );
    await this.assertVerificationMethod({ verificationMethod });
    return verificationMethod;
  }

  async matchProof({ proof, document, purpose, documentLoader, expansionMap }) {
    if (
      !(await super.matchProof({
        proof,
        document,
        purpose,
        documentLoader,
        expansionMap,
      }))
    ) {
      return false;
    }
    if (!this.key) {
      // no key specified, so assume this suite matches and it can be retrieved
      return true;
    }

    let { verificationMethod } = proof;
    if (!verificationMethod) {
      verificationMethod = proof.creator;
    }
    // only match if the key specified matches the one in the proof
    if (typeof verificationMethod === "object") {
      return verificationMethod.id === this.key.id;
    }
    return verificationMethod === this.key.id;
  }
}

module.exports = EcdsaSecp256k1RecoverySignature2020;
