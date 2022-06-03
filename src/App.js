import './App.css';

import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import {useState, useEffect} from 'react';
import { create } from "ipfs-http-client";
import { mintNFTTx, viewNFTScript } from "./cadence/code.js";

const client = create('https://ipfs.infura.io:5001/api/v0');

fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")

function App() {
  const [user, setUser] = useState();
  const [file, setFile] = useState();

  const [scriptResult, setScriptResult] = useState([]);

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, [])

  const logIn = () => {
    fcl.authenticate();
  }

  const logOut = () => {
    fcl.unauthenticate();
  }

  const mint = async () => {
    const added = await client.add(file);
    const hash = added.path;

    const transactionId = await fcl.send([
      fcl.transaction(mintNFTTx),
      fcl.args([
        fcl.arg(hash, types.String),
        fcl.arg("Holiday NFT", types.String)
      ]),
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(hash);
    console.log(transactionId);
  }

  const view = async () => {
    const result = await fcl.send([
      fcl.script(viewNFTScript),
      fcl.args([
        fcl.arg(user.addr, types.Address)
      ])
    ]).then(fcl.decode);

    console.log(result);
    setScriptResult(result);
  }

  return (
    <div className="App">
      {user && user.addr ? <h1 className="userAddress">{user.addr}</h1> : null }

      <div className="buttons-wrapper-1">
        <button onClick={() => logIn()} id="logIn" className="btns">LogIn</button>
        <button onClick={() => logOut()} id="logOut" className="btns">Logout</button>
      </div>

      <div  className="buttons-wrapper-2">
        <div className="input-wrapper">
          <input className="form-control" type="file" id="formFileMultiple" onChange={(e) => setFile(e.target.files[0])} multiple />
        </div>
        <div className="m-wrapper">
          <button onClick={() => mint()} className="btns mint-btn">Mint HolidayNFT</button>
          <button onClick={() => view()} className="btns view-btn">View HolidayNFT</button>
        </div>
      </div>

        {scriptResult.length !== 0
          ? <div className="img-wrapper">
              <img src={`https://ipfs.infura.io/ipfs/${scriptResult[0]}`}  alt="viewNFT"/>
              <h2>{scriptResult[1]}</h2>
            </div>
          : null
        }
   
    </div>
  );
}

export default App;