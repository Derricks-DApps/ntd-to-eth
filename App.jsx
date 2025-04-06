import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./utils/contract";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [rate, setRate] = useState(null);
  const [ntdInput, setNtdInput] = useState("");
  const [ethResult, setEthResult] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        await _provider.send("eth_requestAccounts", []);
        const _signer = _provider.getSigner();
        const _contract = new ethers.Contract(contractAddress, contractABI, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);

        const currentRate = await _contract.getRate();
        setRate(currentRate.toString());
      }
    };
    init();
  }, []);

  const handleConvert = async () => {
    if (!ntdInput || !contract) return;
    const eth = await contract.getEthAmount(ntdInput);
    setEthResult(ethers.utils.formatEther(eth));
  };

  const handleSend = async () => {
    if (!contract) return;
    const recipient = prompt("Enter recipient address:");
    const tx = await contract.convertAndSend(recipient, ntdInput);
    await tx.wait();
    alert("Sent ETH!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">NTD → ETH Converter</h1>

      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <p className="mb-2">📈 Current Rate: 1 ETH = {rate} NTD</p>

        <input
          type="number"
          placeholder="Enter NTD amount"
          value={ntdInput}
          onChange={(e) => setNtdInput(e.target.value)}
          className="w-full p-2 rounded mb-4 text-black"
        />

        <button
          onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded mb-2"
        >
          Calculate ETH
        </button>

        {ethResult && (
          <div className="mb-4">
            💰 ETH to send: <strong>{ethResult}</strong>
          </div>
        )}

        <button
          onClick={handleSend}
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded"
        >
          Send ETH (owner only)
        </button>
      </div>
    </div>
  );
}

export default App;
