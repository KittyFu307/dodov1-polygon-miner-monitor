const { Finding, FindingSeverity, FindingType, getJsonRpcUrl} = require("forta-agent");
const BigNumber = require('bignumber.js');
const {abi: dodoTokenAbi} = require('../abi/DodoToken.json');
const ethers = require('ethers');
const {
    DODO_DECIMAL,
    WITHDRAW_V1,
    WITHDRAW_V2,
    BSC_REWARD_TOKEN,
    ARBITRUM_REWARD_TOKEN,
    POLYGON_REWARD_TOKEN,
    //REWARD VAULT
    BSC_REWARD_VAULT_V1,
    BSC_REWARD_VAULT_V2,
    ARBITRUM_REWARD_VAULT_V1,
    ARBITRUM_REWARD_VAULT_V2,
    POLYGON_REWARD_VAULT_V1,
    POLYGON_REWARD_VAULT_V2,
    // //MINER
    POLYGON_MINER_ADDRESS_V1,
    POLYGON_MINER_ADDRESS_V2,
    BSC_MINER_ADDRESS_V1,
    BSC_MINER_ADDRESS_V2,
    ARBITRUM_MINER_ADDRESS_V1,
    ARBITRUM_MINER_ADDRESS_V2,
} = require("./constants");

const provider = new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl());
var minerAddressV1;
var minerAddressV2;
var rewardToken;
var rewardVaultV1;
var rewardVaultV2;
var chainId;
async function initialize() {
    let network = await provider.getNetwork();
    chainId = network.chainId;
    if(chainId === 137){
        minerAddressV1 = POLYGON_MINER_ADDRESS_V1;
        minerAddressV2 = POLYGON_MINER_ADDRESS_V2;
        rewardToken = POLYGON_REWARD_TOKEN;
        rewardVaultV1 = POLYGON_REWARD_VAULT_V1;
        rewardVaultV2 = POLYGON_REWARD_VAULT_V2;
    } else if (network.chainId === 42161) {
        minerAddressV1 = ARBITRUM_MINER_ADDRESS_V1;
        minerAddressV2 = ARBITRUM_MINER_ADDRESS_V2;
        rewardToken = ARBITRUM_REWARD_TOKEN;
        rewardVaultV1 = ARBITRUM_REWARD_VAULT_V1;
        rewardVaultV2 = ARBITRUM_REWARD_VAULT_V2;
    }else {
        minerAddressV1 = BSC_MINER_ADDRESS_V1;
        minerAddressV2 = BSC_MINER_ADDRESS_V2;
        rewardToken = BSC_REWARD_TOKEN;
        rewardVaultV1 = BSC_REWARD_VAULT_V1;
        rewardVaultV2 = BSC_REWARD_VAULT_V2;
    }
}
const handleTransaction = async (txEvent) => {
    const findings = [];
    const dodoTokenMinerV1 = txEvent.filterEvent(WITHDRAW_V1, minerAddressV1);
    const dodoTokenMinerV2 = txEvent.filterEvent(WITHDRAW_V2, minerAddressV2);
    if(!dodoTokenMinerV1.length && !dodoTokenMinerV2.length) return findings;
    const provider = new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl());
    const tokenContract = new ethers.Contract(rewardToken, dodoTokenAbi, provider);
    let balanceOf;
    if(!dodoTokenMinerV1.length) {
        balanceOf = await tokenContract.balanceOf(rewardVaultV2);
    } else {
        balanceOf = await tokenContract.balanceOf(rewardVaultV1)
    }
    const value = new BigNumber(balanceOf.toString()).div((new BigNumber(10)).pow(DODO_DECIMAL));
    const finding = Finding.fromObject({
        name: 'DODO miner：The reward token balance of reward vault',
        description: `The reward token address is ${rewardToken},the amount is ${value}, the chain Id is ${chainId}`,
        alertId: 'DODO-Miner-Vault-Token',
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: 'DODO',
        metadata: {
            rewardToken: rewardToken.toString(),
            tokenBalance: value.toString(),
        },
    });
    findings.push(finding);
    return findings;
}
module.exports = {
    initialize,
    handleTransaction,
};
