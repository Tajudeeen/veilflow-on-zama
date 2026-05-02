# VeilFlow

VeilFlow is a Private Strategy Engine for onchain finance using Zama's fhEVM on Sepolia.

> Onchain finance today exposes actions. VeilFlow protects intent.

This is not a trading dashboard. It is a confidential decision layer: users submit encrypted strategy inputs, the contract evaluates the strategy with FHE, and only the final decision outcome is returned.

## Why FHE

Public DeFi makes strategy visible. Risk tolerance, allocation preference, and trigger thresholds can leak before execution, creating front-running risk and turning private mandates into public signals. That is a structural blocker for institutions and serious operators.

Fully Homomorphic Encryption changes the primitive. VeilFlow computes over encrypted values with Zama's fhEVM:

- strategy inputs are encrypted before submission
- branch conditions run over encrypted types
- the contract never decrypts sensitive strategy state
- the UI only shows the outcome, not the submitted intent

## Flow

```text
User wallet
  -> encrypts risk, allocation, trigger with Zama relayer SDK
  -> submitStrategy(ciphertexts, proof)
  -> evaluateStrategy() with encrypted conditionals
  -> executeStrategy() stores encrypted decision
  -> user decrypts only the decision result
```

## Contract

`contracts/StrategyEngine.sol` keeps the flow intentionally small:

- `submitStrategy(...)` stores encrypted `risk`, `allocation`, and `condition`
- `evaluateStrategy()` uses encrypted comparison and `FHE.select`
- `executeStrategy()` produces an encrypted decision code
- no plaintext strategy values are stored or emitted

Decision codes:

- `2`: stage private allocation
- `3`: execute private allocation

## Setup

```bash
npm install
cp .env.example .env.local
cp .env.example .env
```

Set:

```bash
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://...
```

Compile and test:

```bash
npm run compile
npm test
```

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

Copy the deployed `StrategyEngine` address into `.env.local`:

```bash
NEXT_PUBLIC_STRATEGY_ENGINE_ADDRESS=0x...
```

Run the UI:

```bash
npm run dev
```

Open `http://localhost:3000` with a Sepolia-funded wallet.

## Demo Script

1. Open VeilFlow.
2. Set risk, allocation, and trigger values.
3. Click `Encrypt & Submit`.
4. Confirm the three Sepolia transactions: submit, evaluate, execute.
5. The UI decrypts and displays only the result.

The sensitive strategy stays private throughout the demo. The chain sees ciphertext handles, proofs, and execution steps, not the user's financial intent.
