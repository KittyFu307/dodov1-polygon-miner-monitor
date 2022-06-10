const { Finding, FindingSeverity, FindingType, getJsonRpcUrl} = require("forta-agent");
const BigNumber = require('bignumber.js');
const {abi: dodoTokenAbi} = require('../abi/DodoToken.json');
const ethers = require('ethers');

const {
    REWARD_TOKEN,
    REWARD_VAULT,
    DODO_DECIMAL,
    WITHDRAW,
    MINER_ADDRESS
} = require("./constants");


const handleTransaction = async (txEvent) => {
    const findings = [];
    const dodoTokenMiner = txEvent.filterEvent(WITHDRAW, MINER_ADDRESS);
    if(!dodoTokenMiner.length) return findings;
    const provider = new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl());
    const tokenContract = new ethers.Contract(REWARD_TOKEN, dodoTokenAbi, provider);
    const balanceOf = await tokenContract.balanceOf(REWARD_VAULT);
    const value = new BigNumber(balanceOf.toString()).div((new BigNumber(10)).pow(DODO_DECIMAL));
    const finding = Finding.fromObject({
        name: 'DODO V1 miner Polygon：The reward token balance of reward vault on polygon',
        description: `The reward token address is ${REWARD_TOKEN},the reward vault address is ${REWARD_VAULT},the amount is ${value}`,
        alertId: 'DODO-V1-Miner-Vault-Token-Polygon',
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: 'DODO',
        metadata: {
            vaultAddress: REWARD_VAULT.toString(),
            rewardToken: REWARD_TOKEN.toString(),
            tokenBalance: value.toString(),

        },
    });
    findings.push(finding);
    return findings;
}
module.exports = {
    handleTransaction,
};
