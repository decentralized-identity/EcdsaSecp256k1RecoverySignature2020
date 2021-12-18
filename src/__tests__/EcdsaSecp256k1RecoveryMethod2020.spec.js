const base64url = require("base64url");
const EcdsaSecp256k1RecoveryMethod2020 = require("../EcdsaSecp256k1RecoveryMethod2020");
const unclockedDID = require("../../docs/unlockedDID.json");
const data = new Uint8Array([128]);

describe("EcdsaSecp256k1RecoveryMethod2020", () => {
  unclockedDID.verificationMethod.forEach((vm) => {
    describe(vm.id, () => {
      let vm1;
      let signature;
      it("can import from json", () => {
        vm1 = new EcdsaSecp256k1RecoveryMethod2020(vm);
        expect(vm1.id).toBe(vm.id);
        expect(vm1.type).toBe(vm.type);
        expect(vm1.controller).toBe(vm.controller);
      });

      it("sign", async () => {
        const { sign } = vm1.signer();
        expect(typeof sign).toBe("function");
        signature = await sign({ data });
        const [encodedHeader, encodedSignature] = signature.split("..");
        const header = JSON.parse(base64url.decode(encodedHeader));
        expect(header.b64).toBe(false);
        expect(header.crit).toEqual(["b64"]);
        expect(encodedSignature).toBeDefined();
      });

      it("verify", async () => {
        const { verify } = vm1.verifier();
        expect(typeof verify).toBe("function");
        const result = await verify({
          data,
          signature,
        });
        expect(result).toBe(true);
      });
    });
  });
});
