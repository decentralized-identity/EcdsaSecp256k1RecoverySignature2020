#### [View on GitHub](https://github.com/decentralized-identity/EcdsaSecp256k1RecoverySignature2020)

> JSON-LD 1.1 is being formally specified in the W3C JSON-LD Working Group. To participate in this work, please join the W3C and then [join the Working Group](https://www.w3.org/2018/json-ld-wg/).

- [Latest JSON-LD Context](https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld)

### Suite Details

Per [ld-signatures](https://w3c-ccg.github.io/ld-signatures/#signature-suites), this Signature Suite defines the following:

```json
{
  "id": "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoverySignature2020",
  "type": "SignatureSuite",
  "canonicalizationAlgorithm": "https://w3id.org/security#URDNA2015",
  "digestAlgorithm": "https://www.ietf.org/assignments/jwa-parameters#SHA256",
  "signatureAlgorithm": "https://tools.ietf.org/html/rfc4880#section-11.4"
}
```

## Examples

- [Signed DID Document](https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/docs/unlockedDID.json)
- [Signed Credential](https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/docs/verifiableCredential.json)

### Terminology

<h4 id="publicKeyJwk"><a href="#publicKeyJwk">publicKeyJwk</a></h4>

A jwk secp256k1 public key.

```json
{
  "id": "did:example:123#vm-1",
  "controller": "did:example:123",
  "type": "EcdsaSecp256k1RecoveryMethod2020",
  "publicKeyJwk": {
    "crv": "secp256k1",
    "kid": "JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw",
    "kty": "EC",
    "x": "dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A",
    "y": "36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA"
  }
}
```

<h4 id="privateKeyJwk"><a href="#privateKeyJwk">privateKeyJwk</a></h4>

A jwk secp256k1 private key.

```json
{
  "id": "did:example:123#vm-1",
  "controller": "did:example:123",
  "type": "EcdsaSecp256k1RecoveryMethod2020",
  "privateKeyJwk": {
    "crv": "secp256k1",
    "d": "rhYFsBPF9q3-uZThy7B3c4LDF_8wnozFUAEm5LLC4Zw",
    "kid": "JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw",
    "kty": "EC",
    "x": "dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A",
    "y": "36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA"
  }
}
```

<h4 id="publicKeyHex"><a href="#publicKeyHex">publicKeyHex</a></h4>

A hex encoded secp256k1 compressed public key.

```json
{
  "id": "did:example:123#key-0",
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "publicKeyHex": "027560af3387d375e3342a6968179ef3c6d04f5d33b2b611cf326d4708badd7770"
}
```

<h4 id="privateKeyHex"><a href="#privateKeyHex">privateKeyHex</a></h4>

A hex encoded secp256k1 compressed private key.

```json
{
  "id": "did:example:123#key-0",
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "publicKeyHex": "278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f"
}
```

<h4 id="ethereumAddress"><a href="#ethereumAddress">ethereumAddress</a></h4>

A hex encoded ethereumAddress address.

```json
{
  "id": "did:example:123#key-0",
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "ethereumAddress": "0x89a932207c485f85226d86f7cd486a89a24fcc12"
}
```

<h4 id="blockchainAccountId"><a href="#blockchainAccountId">blockchainAccountId</a></h4>

A [blockchain account ID](https://w3c-ccg.github.io/security-vocab/#blockchainAccountId) according to [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md).

```json
{
  "id": "did:example:123#key-0",
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "blockchainAccountId": "eip155:1:0x89a932207c485f85226d86f7cd486a89a24fcc12"
}
```

<h4 id="ES256K-R"><a href="#ES256K-R">ES256K-R</a></h4>

This suite uses detached JWS using alg "ES256K-R" an unregistered, experimental ECDSA over secp256k1 with encoded recovery bit. Please review the details below.

- [Detached JWS RFC 7515](https://tools.ietf.org/html/rfc7515#appendix-F)
- [ES256-K](https://tools.ietf.org/html/draft-ietf-cose-webauthn-algorithms-04#section-3.2)

ES256K-R is just ES256K with the recovery bit appended... making the signature 65 bytes instead of 64.

The recovery bit is used to extract the public key from the signature. See [here](https://github.com/bitjson/bitcoin-ts/blob/90848d9/src/lib/crypto/secp256k1-types.ts#L220).

^ please recommend a better source for describing ecdsa secp256k1 recoverable signature format.

The detached JWS must have the following header:

```json
{
  "alg": "ES256K-R",
  "b64": false,
  "crit": ["b64"]
}
```

This is what a proof with `EcdsaSecp256k1RecoverySignature2020` looks like:

```json
{
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "created": "2020-04-11T21:07:06Z",
  "verificationMethod": "did:example:123#vm-3",
  "proofPurpose": "assertionMethod",
  "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..pp9eiLCMfN4EfSB3cbl3UxJ4TtgUaTfByDaaB6IZbXsnvIy5AUIFjbgaiFNtq9-3f8mP7foD_HXpjrdWZfzlwAE"
}
```
