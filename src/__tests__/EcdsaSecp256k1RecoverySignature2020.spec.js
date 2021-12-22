const jsigs = require("jsonld-signatures");
const vcjs = require("@digitalbazaar/vc");
const { AssertionProofPurpose } = jsigs.purposes;
const EcdsaSecp256k1RecoveryMethod2020 = require("../EcdsaSecp256k1RecoveryMethod2020");
const EcdsaSecp256k1RecoverySignature2020 = require("../EcdsaSecp256k1RecoverySignature2020");
const unclockedDID = require("../../docs/unlockedDID.json");

let clockedDID = Object.assign({}, unclockedDID);
delete clockedDID.proof

let verifiableCredential = require("../../docs/credential.json");
const staticVerifiableCredential = require("../../docs/verifiableCredential.json");
const data = new Uint8Array([128]);

const { documentLoader } = require("./__fixtures__");

const regenerate = !!process.env.REGENERATE_TEST_VECTORS;

describe("EcdsaSecp256k1RecoverySignature2020", () => {
  unclockedDID.verificationMethod.forEach((vm) => {
    describe(vm.id, () => {
      let vm1 = new EcdsaSecp256k1RecoveryMethod2020(vm);
      let suite = new EcdsaSecp256k1RecoverySignature2020({
        key: vm1,
      });

      describe("jsigs", () => {
        it("should work as valid signature suite for signing and verifying a document", async () => {
          // We need to do that because jsigs.sign modifies the credential... no bueno
          const signed = await jsigs.sign(clockedDID, {
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

          if (!regenerate) {
            // Verify static signed document
            const result = await jsigs.verify(unclockedDID, {
              compactProof: false,
              documentLoader: documentLoader,
              purpose: new AssertionProofPurpose(),
              suite,
            });
            expect(result.verified).toBeTruthy();
          }
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

          const result = await vcjs.verifyCredential({
            credential: verifiableCredential,
            compactProof: false,
            documentLoader: documentLoader,
            purpose: new AssertionProofPurpose(),
            suite,
          });
          expect(result.verified).toBeTruthy();

          if (!regenerate) {
            // Verify static verifiable credential
            const result1 = await vcjs.verifyCredential({
              credential: staticVerifiableCredential,
              compactProof: false,
              documentLoader: documentLoader,
              purpose: new AssertionProofPurpose(),
              suite,
            });
            expect(result.verified).toBeTruthy();
          }
        });
      });
    });
  });

  if (regenerate) {
    describe('Saving regenerated test vectors', () => {
      const fs = require('fs');
      const path = require('path');
      it("to verifiableCredential.json", async () => {
        const vc = JSON.stringify(verifiableCredential, 0, 2);
        const filename = path.join(__dirname, "../../docs/verifiableCredential.json");
        fs.writeFileSync(filename, vc + '\n');
      });
      it("to unlockedDID.json", async () => {
        const doc = JSON.stringify(clockedDID, 0, 2);
        const docFilename = path.join(__dirname, "../../docs/unlockedDID.json");
        fs.writeFileSync(docFilename, doc + '\n');
      });
    })
  }
});
