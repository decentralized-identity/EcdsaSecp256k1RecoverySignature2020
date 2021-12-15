const fs = require("fs");
const path = require("path");
const jsonld = require("jsonld");

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, filename), 'utf8'));
}

const recovery2020_0_0 = readJson("../../../lds-ecdsa-secp256k1-recovery2020-0.0.jsonld");
const recovery2020_2_0 = readJson("../../../lds-ecdsa-secp256k1-recovery2020-2.0.jsonld");

const contexts = {
  "https://www.w3.org/ns/did/v1": require("./contexts/did-core-v1.json"),
  "https://www.w3.org/2018/credentials/v1": require("./contexts/credentials-v1.json"),
  "https://w3c-ccg.github.io/vc-examples/covid-19/v1/v1.jsonld": require("./contexts/covid-19.json"),
  "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld": recovery2020_0_0,
  "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-2.0.jsonld": recovery2020_2_0,
  "https://w3id.org/security/suites/secp256k1recovery-2020/v1": recovery2020_0_0,
  "https://w3id.org/security/suites/secp256k1recovery-2020/v2": recovery2020_2_0,
};

const customLoader = (url) => {
  const context = contexts[url];

  if (context) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: context, // this is the actual document that was loaded
      documentUrl: url, // this is the actual context URL after redirects
    };
  }

  if (url.split("#")[0] === "did:example:123") {
    return {
      contextUrl: null, // this is for a context via a link header
      document: require("../../../docs/unlockedDID.json"), // this is the actual document that was loaded
      documentUrl: url, // this is the actual context URL after redirects
    };
  }
  console.error("Unable to resolve locally " + url);
  throw new Error("Unable to resolve locally " + url);
  // return jsonld.documentLoaders.node()(url);
};

module.exports = customLoader;
