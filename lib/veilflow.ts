import { BrowserProvider, Contract, type Eip1193Provider, type JsonRpcSigner } from "ethers";
import { strategyEngineAbi } from "./strategyEngineAbi";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export type StrategyInput = {
  risk: number;
  allocation: number;
  condition: number;
};

export type VeilFlowResult = {
  address: string;
  transactionHash: string;
  decisionCode: number | null;
};

const SEPOLIA_CHAIN_ID = "0xaa36a7";

function getContractAddress() {
  const address = process.env.NEXT_PUBLIC_STRATEGY_ENGINE_ADDRESS;
  if (!address) {
    throw new Error("NEXT_PUBLIC_STRATEGY_ENGINE_ADDRESS is not configured.");
  }
  return address;
}

async function getSigner(): Promise<JsonRpcSigner> {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or another Sepolia wallet.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: SEPOLIA_CHAIN_ID }]);
  } catch {
    throw new Error("Switch your wallet to Sepolia testnet and try again.");
  }

  return provider.getSigner();
}

async function createFhevmInstance() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or another Sepolia wallet.");
  }

  const sdk = await import("@zama-fhe/relayer-sdk/web");
  await sdk.initSDK();
  return sdk.createInstance({
    ...sdk.SepoliaConfig,
    network: window.ethereum
  });
}

async function decryptDecision(
  instance: any,
  signer: JsonRpcSigner,
  contractAddress: string,
  handle: string
): Promise<number | null> {
  if (!handle || /^0x0+$/.test(handle)) return null;

  const address = await signer.getAddress();
  const keypair = instance.generateKeypair();
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "2";
  const contractAddresses = [contractAddress];
  const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message
  );

  const decrypted = await instance.userDecrypt(
    [{ handle, contractAddress }],
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    address,
    startTimeStamp,
    durationDays
  );

  return Number(decrypted[handle]);
}

export async function runPrivateStrategy(input: StrategyInput): Promise<VeilFlowResult> {
  const contractAddress = getContractAddress();
  const signer = await getSigner();
  const address = await signer.getAddress();
  const instance = await createFhevmInstance();
  const contract = new Contract(contractAddress, strategyEngineAbi, signer);

  const encryptedInput = instance.createEncryptedInput(contractAddress, address);
  encryptedInput.add32(input.risk);
  encryptedInput.add32(input.allocation);
  encryptedInput.add32(input.condition);
  const encrypted = await encryptedInput.encrypt();

  const submitTx = await contract.submitStrategy(
    encrypted.handles[0],
    encrypted.handles[1],
    encrypted.handles[2],
    encrypted.inputProof
  );
  await submitTx.wait();

  const evaluateTx = await contract.evaluateStrategy();
  await evaluateTx.wait();

  const executeTx = await contract.executeStrategy();
  const receipt = await executeTx.wait();

  const decisionHandle = await contract.encryptedDecisionOf(address);
  const decisionCode = await decryptDecision(instance, signer, contractAddress, decisionHandle);

  return {
    address,
    transactionHash: receipt?.hash ?? executeTx.hash,
    decisionCode
  };
}

export function describeDecision(code: number | null) {
  if (code === 3) return "Execute private allocation";
  if (code === 2) return "Stage private allocation";
  return "Encrypted result pending";
}
