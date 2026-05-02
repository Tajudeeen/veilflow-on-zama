import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";

const privateKey = process.env.PRIVATE_KEY;
const mnemonic = process.env.MNEMONIC ?? "test test test test test test test test test test test junk";

const sepoliaRpc =
  process.env.SEPOLIA_RPC_URL ??
  (process.env.INFURA_API_KEY ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}` : undefined);

if (!sepoliaRpc) {
  throw new Error("Missing SEPOLIA_RPC_URL. Add an Alchemy or Infura Sepolia RPC URL to your .env file.");
}

const accounts = privateKey ? [privateKey] : { mnemonic };

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    sepolia: {
      url: sepoliaRpc,
      chainId: 11155111,
      accounts
    }
  }
};

export default config;
