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

### Terminology

<h4 id="publicKeyHex"><a href="#publicKeyHex">publicKeyHex</a></h4>

A hex encoded secp256k1 compressed public key.

#### Example:

```json
{
  "id": "did:example:123#key-0",
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "publicKeyHex": "027560af3387d375e3342a6968179ef3c6d04f5d33b2b611cf326d4708badd7770"
}
```

<h4 id="ethereumAddress"><a href="#ethereumAddress">ethereumAddress</a></h4>

A hex encoded ethereumAddress address.

#### Example:

```json
{
  "id": "did:example:123#key-0",
  "type": "EcdsaSecp256k1RecoverySignature2020",
  "ethereumAddress": "0x89a932207c485f85226d86f7cd486a89a24fcc12"
}
```

