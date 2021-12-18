const jsigs = require("jsonld-signatures");
const { AssertionProofPurpose } = jsigs.purposes;
const EcdsaSecp256k1RecoveryMethod2020 = require("../EcdsaSecp256k1RecoveryMethod2020");
const EcdsaSecp256k1RecoverySignature2020 = require("../EcdsaSecp256k1RecoverySignature2020");

const doc = {
  "@context": [
    {
      schema: "http://schema.org/",
      name: "schema:name",
      homepage: "schema:url",
      image: "schema:image",
    },
  ],
  name: "Manu Sporny",
  homepage: "https://manu.sporny.org/",
  image: "https://manu.sporny.org/images/manu.png",
};

const unclockedDID = require("../../docs/unlockedDID.json");

const { documentLoader } = require("./__fixtures__");
let vm1 = new EcdsaSecp256k1RecoveryMethod2020(unclockedDID.verificationMethod[0]);

let suiteWithKey = new EcdsaSecp256k1RecoverySignature2020({
  key: vm1,
});

let suiteWithoutKey = new EcdsaSecp256k1RecoverySignature2020({});

describe("sanity", () => {
  it("can sign and verify", async () => {
    const signed = await jsigs.sign(doc, {
      compactProof: false,
      documentLoader: documentLoader,
      purpose: new AssertionProofPurpose(),
      suite: suiteWithKey,
    });
    expect(signed.proof).toBeDefined();
    const result = await jsigs.verify(signed, {
      compactProof: false,
      documentLoader: documentLoader,
      purpose: new AssertionProofPurpose(),
      suite: suiteWithoutKey,
    });
    expect(result.verified).toBeTruthy();
  });
});
