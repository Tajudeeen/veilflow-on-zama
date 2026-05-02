// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {
    FHE,
    ebool,
    euint32,
    externalEuint32
} from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title VeilFlow Strategy Engine
/// @notice A confidential decision layer for onchain finance intent.
/// @dev Inputs, branch conditions, and intermediate strategy state stay encrypted.
contract StrategyEngine is ZamaEthereumConfig {
    enum Step {
        Empty,
        Submitted,
        Evaluated,
        Executed
    }

    struct Strategy {
        euint32 risk;
        euint32 allocation;
        euint32 condition;
        euint32 adjustedAllocation;
        euint32 decisionCode;
        Step step;
        uint64 updatedAt;
    }

    mapping(address user => Strategy strategy) private strategies;

    event StrategySubmitted(address indexed user);
    event StrategyEvaluated(address indexed user);
    event StrategyExecuted(address indexed user);

    error StrategyMissing();
    error StrategyNotEvaluated();

    /// @notice Store encrypted strategy parameters supplied by the caller.
    /// @dev The proof binds all encrypted inputs to this contract and caller.
    function submitStrategy(
        externalEuint32 risk,
        externalEuint32 allocation,
        externalEuint32 condition,
        bytes calldata inputProof
    ) external {
        Strategy storage strategy = strategies[msg.sender];

        strategy.risk = FHE.fromExternal(risk, inputProof);
        strategy.allocation = FHE.fromExternal(allocation, inputProof);
        strategy.condition = FHE.fromExternal(condition, inputProof);
        strategy.adjustedAllocation = FHE.asEuint32(0);
        strategy.decisionCode = FHE.asEuint32(0);
        strategy.step = Step.Submitted;
        strategy.updatedAt = uint64(block.timestamp);

        _allowStrategyValues(msg.sender);
        emit StrategySubmitted(msg.sender);
    }

    /// @notice Evaluate the encrypted strategy without revealing inputs or branches.
    /// @dev If risk is high, allocation is halved; if trigger condition fails, exposure is reduced.
    function evaluateStrategy() external {
        Strategy storage strategy = strategies[msg.sender];
        if (strategy.step == Step.Empty) revert StrategyMissing();

        ebool triggerActive = FHE.gt(strategy.condition, 50);
        ebool highRisk = FHE.gt(strategy.risk, 70);

        euint32 conservativeAllocation = FHE.add(FHE.div(strategy.allocation, 2), 1);
        euint32 requestedAllocation = FHE.add(strategy.allocation, 1);
        euint32 riskAdjusted = FHE.select(highRisk, conservativeAllocation, requestedAllocation);
        euint32 inactiveAllocation = FHE.add(FHE.div(requestedAllocation, 4), 1);
        strategy.adjustedAllocation = FHE.select(triggerActive, riskAdjusted, inactiveAllocation);
        strategy.step = Step.Evaluated;
        strategy.updatedAt = uint64(block.timestamp);

        FHE.allowThis(strategy.adjustedAllocation);
        FHE.allow(strategy.adjustedAllocation, msg.sender);
        emit StrategyEvaluated(msg.sender);
    }

    /// @notice Execute a simulated action from the private evaluated strategy.
    /// @dev Decision code remains encrypted: 2 stage, 3 execute.
    function executeStrategy() external {
        Strategy storage strategy = strategies[msg.sender];
        if (strategy.step != Step.Evaluated) revert StrategyNotEvaluated();

        ebool decisive = FHE.gt(strategy.adjustedAllocation, 60);
        euint32 holdCode = FHE.add(FHE.mul(strategy.adjustedAllocation, 0), 1);
        euint32 stageCode = FHE.add(holdCode, 1);
        euint32 executeCode = FHE.add(stageCode, 1);

        strategy.decisionCode = FHE.select(decisive, executeCode, stageCode);
        strategy.step = Step.Executed;
        strategy.updatedAt = uint64(block.timestamp);

        FHE.allowThis(strategy.decisionCode);
        FHE.allow(strategy.decisionCode, msg.sender);
        emit StrategyExecuted(msg.sender);
    }

    /// @notice Return only metadata that does not disclose strategy intent.
    function getStrategyMeta(address user) external view returns (Step step, uint64 updatedAt) {
        Strategy storage strategy = strategies[user];
        return (strategy.step, strategy.updatedAt);
    }

    /// @notice Return the encrypted outcome handle for user-side decryption.
    function encryptedDecisionOf(address user) external view returns (euint32) {
        return strategies[user].decisionCode;
    }

    /// @notice Return the encrypted evaluated allocation handle for audit/demo decryption by the owner.
    function encryptedAdjustedAllocationOf(address user) external view returns (euint32) {
        return strategies[user].adjustedAllocation;
    }

    function _allowStrategyValues(address user) private {
        Strategy storage strategy = strategies[user];

        FHE.allowThis(strategy.risk);
        FHE.allow(strategy.risk, user);

        FHE.allowThis(strategy.allocation);
        FHE.allow(strategy.allocation, user);

        FHE.allowThis(strategy.condition);
        FHE.allow(strategy.condition, user);

        FHE.allowThis(strategy.adjustedAllocation);
        FHE.allow(strategy.adjustedAllocation, user);

        FHE.allowThis(strategy.decisionCode);
        FHE.allow(strategy.decisionCode, user);
    }
}
