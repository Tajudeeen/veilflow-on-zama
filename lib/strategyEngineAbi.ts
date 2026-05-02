export const strategyEngineAbi = [
  {
    type: "function",
    name: "submitStrategy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "risk", type: "bytes32" },
      { name: "allocation", type: "bytes32" },
      { name: "condition", type: "bytes32" },
      { name: "inputProof", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "evaluateStrategy",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "executeStrategy",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "encryptedDecisionOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }]
  },
  {
    type: "function",
    name: "getStrategyMeta",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "step", type: "uint8" },
      { name: "updatedAt", type: "uint64" }
    ]
  }
] as const;
