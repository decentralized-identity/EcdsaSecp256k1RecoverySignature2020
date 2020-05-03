import React from "react";
import logo from "./logo.svg";
import "./App.css";

import jsigs from "jsonld-signatures";

import {
  EcdsaSecp256k1RecoveryMethod2020,
  EcdsaSecp256k1RecoverySignature2020,
} from "@transmute/lds-ecdsa-secp256k1-recovery2020";

const { AssertionProofPurpose } = jsigs.purposes;

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

let key = {
  id: "did:example:123#key-0",
  type: "EcdsaSecp256k1RecoveryMethod2020",
  controller: "did:example:123",
  privateKeyJwk,
  publicKeyJwk,
};

const suite3 = new EcdsaSecp256k1RecoverySignature2020({
  key: new EcdsaSecp256k1RecoveryMethod2020(key),
});

const exampleDoc = {
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

function App() {
  React.useEffect(() => {
    (async () => {
      console.log("test");
      const signed = await jsigs.sign(
        { ...exampleDoc },
        {
          compactProof: false,
          // documentLoader,
          purpose: new AssertionProofPurpose(),
          suite: suite3,
        }
      );
      // console.log(JSON.stringify(signed, null, 2));
      const res = await jsigs.verify(signed, {
        suite: suite3,
        compactProof: false,
        // documentLoader,
        purpose: new AssertionProofPurpose({
          controller: {
            id: "did:example:123",
            assertionMethod: [key],
          },
        }),
      });
      console.log(JSON.stringify(res, null, 2));
      if (!res.verified) {
        alert("fail");
      }
    })();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
