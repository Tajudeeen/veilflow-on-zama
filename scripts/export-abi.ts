import fs from "node:fs";
import path from "node:path";

const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "StrategyEngine.sol", "StrategyEngine.json");
const outDir = path.join(process.cwd(), "lib", "abi");
const outPath = path.join(outDir, "StrategyEngine.json");

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(artifact.abi, null, 2)}\n`);

console.log(`Wrote ${outPath}`);
