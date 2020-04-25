const jsigs = require("jsonld-signatures");
const vcjs = require("vc-js");
const { AssertionProofPurpose } = jsigs.purposes;
const EcdsaSecp256k1RecoveryMethod2020 = require("../EcdsaSecp256k1RecoveryMethod2020");
const EcdsaSecp256k1RecoverySignature2020 = require("../EcdsaSecp256k1RecoverySignature2020");
const unclockedDID = require("../../docs/unlockedDID.json");
let verifiableCredential = require("../../docs/credential.json");
const data = new Uint8Array([128]);

const { documentLoader } = require("./__fixtures__");

describe("EcdsaSecp256k1RecoverySignature2020", () => {
  unclockedDID.publicKey.forEach((vm) => {
    describe(vm.id, () => {
      let vm1 = new EcdsaSecp256k1RecoveryMethod2020(vm);
      let suite = new EcdsaSecp256k1RecoverySignature2020({
        key: vm1,
      });

      describe("jsigs", () => {
        it("should work as valid signature suite for signing and verifying a document", async () => {
          // We need to do that because jsigs.sign modifies the credential... no bueno
          const signed = await jsigs.sign(unclockedDID, {
            compactProof: false,
            documentLoader: documentLoader,
            purpose: new AssertionProofPurpose(),
            suite,
          });
          expect(signed.proof).toBeDefined();
          const result = await jsigs.verify(signed, {
            compactProof: false,
            documentLoader: documentLoader,
            purpose: new AssertionProofPurpose(),
            suite,
          });
          expect(result.verified).toBeTruthy();
        });
      });

      describe("vc-js", () => {
        it("should work as valid signature suite for issuing and verifying a credential", async () => {
          verifiableCredential = await vcjs.issue({
            credential: verifiableCredential,
            documentLoader: documentLoader,
            compactProof: false,
            suite,
          });
          expect(verifiableCredential.proof).toBeDefined();

          const result = await vcjs.verify({
            credential: verifiableCredential,
            compactProof: false,
            documentLoader: documentLoader,
            purpose: new AssertionProofPurpose(),
            suite,
          });
          // console.log(result);
          // console.log(JSON.stringify(verifiableCredential, null, 2));
          expect(result.verified).toBeTruthy();
        });
      });
    });
  });
});
