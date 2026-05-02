import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import hre from "hardhat";

describe("StrategyEngine", function () {
  beforeEach(async function () {
    await hre.deployments.fixture(["StrategyEngine"]);
  });

  it("keeps inputs encrypted and executes a private decision", async function () {
    const [user] = await hre.ethers.getSigners();
    const deployment = await hre.deployments.get("StrategyEngine");
    const engine = await hre.ethers.getContractAt("StrategyEngine", deployment.address);

    const encryptedInput = await hre.fhevm.createEncryptedInput(await engine.getAddress(), user.address);
    encryptedInput.add32(42);
    encryptedInput.add32(68);
    encryptedInput.add32(58);
    const encrypted = await encryptedInput.encrypt();

    await engine.submitStrategy(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.handles[2],
      encrypted.inputProof
    );

    await engine.evaluateStrategy();
    await engine.executeStrategy();

    const handle = await engine.encryptedDecisionOf(user.address);
    const decision = await hre.fhevm.userDecryptEuint(
      FhevmType.euint32,
      handle,
      await engine.getAddress(),
      user
    );

    expect(decision).to.equal(3);
    const [step] = await engine.getStrategyMeta(user.address);
    expect(step).to.equal(3);
  });

  it("privately reduces exposure when the trigger condition is not active", async function () {
    const [user] = await hre.ethers.getSigners();
    const deployment = await hre.deployments.get("StrategyEngine");
    const engine = await hre.ethers.getContractAt("StrategyEngine", deployment.address);

    const encryptedInput = await hre.fhevm.createEncryptedInput(await engine.getAddress(), user.address);
    encryptedInput.add32(15);
    encryptedInput.add32(92);
    encryptedInput.add32(20);
    const encrypted = await encryptedInput.encrypt();

    await engine.submitStrategy(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.handles[2],
      encrypted.inputProof
    );

    await engine.evaluateStrategy();
    await engine.executeStrategy();

    const [step] = await engine.getStrategyMeta(user.address);
    expect(step).to.equal(3);
  });
});
