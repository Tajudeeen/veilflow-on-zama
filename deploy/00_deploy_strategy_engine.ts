import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { DeployFunction } from "hardhat-deploy/types";

const deployStrategyEngine: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("StrategyEngine", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: hre.network.name === "sepolia" ? 2 : 1
  });
};

export default deployStrategyEngine;
deployStrategyEngine.tags = ["StrategyEngine"];
