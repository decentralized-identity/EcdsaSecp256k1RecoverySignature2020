const { signDetached, verifyDetached } = require("../ES256K-R");

const header = {
  alg: "ES256K-R",
  b64: false,
  crit: ["b64"],
};

const data = new Uint8Array([128]);
const payload = Buffer.from(data.buffer, data.byteOffset, data.length);

describe("ES256K-R", () => {
  it("publicKeyJwk: sign & verify", async () => {
    const privateKeyJwk = {
      crv: "secp256k1",
      d: "rhYFsBPF9q3-uZThy7B3c4LDF_8wnozFUAEm5LLC4Zw",
      kid: "JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw",
      kty: "EC",
      x: "dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A",
      y: "36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA",
    };
    const publicKeyJwk = {
      crv: "secp256k1",
      kid: "JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw",
      kty: "EC",
      x: "dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A",
      y: "36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA",
    };
    const vm = {
      id: "did:example:123#vm-1",
      controller: "did:example:123",
      publicKeyJwk,
      privateKeyJwk,
    };
    // console.log(JSON.stringify(vm, null, 2));

    const detached = await signDetached(payload, vm, header);
    const result = await verifyDetached(detached, payload, vm);
    expect(result).toBe(true);
  });

  it("publicKeyHex: sign & verify", async () => {
    const privateKeyHex =
      "ae1605b013c5f6adfeb994e1cbb0777382c317ff309e8cc5500126e4b2c2e19c";
    const publicKeyHex =
      "027560af3387d375e3342a6968179ef3c6d04f5d33b2b611cf326d4708badd7770";
    const vm = {
      id: "did:example:123#vm-2",
      controller: "did:example:123",
      publicKeyHex,
      privateKeyHex,
    };
    // console.log(JSON.stringify(vm, null, 2));

    const detached = await signDetached(payload, vm, header);
    const result = await verifyDetached(detached, payload, vm);
    expect(result).toBe(true);
  });

  it("ethereumAddress: sign & verify", async () => {
    const privateKeyHex =
      "278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f";
    const ethereumAddress = "0xF3beAC30C498D9E26865F34fCAa57dBB935b0D74";
    const vm = {
      id: "did:example:123#vm-3",
      controller: "did:example:123",
      ethereumAddress,
      privateKeyHex,
    };
    // console.log(JSON.stringify(vm, null, 2));

    const detached = await signDetached(payload, vm, header);
    const result = await verifyDetached(detached, payload, vm);
    expect(result).toBe(true);
  });

  it("blockchainAccountId: sign & verify", async () => {
    const privateKeyHex =
      "0b622f72d0cb4f6d7eebfb9d97375aec891c9836fcf813310069cfffdc7811d6";
    const blockchainAccountId = "eip155:1:0xa136D6b820E41858b57b0136514e75f4174ceA5f";
    const vm = {
      id: "did:example:123#vm-4",
      controller: "did:example:123",
      blockchainAccountId,
      privateKeyHex,
    };
    // console.log(JSON.stringify(vm, null, 2));

    const detached = await signDetached(payload, vm, header);
    const result = await verifyDetached(detached, payload, vm);
    expect(result).toBe(true);
  });
});
