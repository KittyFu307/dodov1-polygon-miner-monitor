const { Finding, FindingSeverity, FindingType, getJsonRpcUrl} = require("forta-agent");
const BigNumber = require('bignumber.js');
const {abi: dodoTokenAbi} = require('../abi/DodoToken.json');
const ethers = require('ethers');

const {
    TRANSFER,
    REWARD_TOKEN,
    REWARD_VAULT,
    MINIMUM_AMOUNT,
    DODO_DECIMAL
} = require("./constants");


const handleTransaction = async (txEvent) => {
    const findings = [];
    const dodoTokenTransfers = txEvent.filterEvent(TRANSFER, REWARD_TOKEN);
    if(!dodoTokenTransfers.length) return findings;
    const provider = new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl());
    const tokenContract = new ethers.Contract(REWARD_TOKEN, dodoTokenAbi, provider);
    const balanceOf = await tokenContract.balanceOf(REWARD_VAULT);
    const value = new BigNumber(balanceOf.toString()).div((new BigNumber(10)).pow(DODO_DECIMAL));
    if(new BigNumber(MINIMUM_AMOUNT).gt(value)) {
        const finding = Finding.fromObject({
            name: 'DODO miner vault contract reward token less than 25,000,000',
            description: `DODO miner vault contract reward token less than 25,000,000, the amount is ${value}`,
            alertId: 'DODO-Miner-Vault-Token-Less-Than-BaseAmount',
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
    }
    return findings;
}
module.exports = {
    handleTransaction,
};
