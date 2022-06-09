const {
  Finding, FindingType, FindingSeverity,createTransactionEvent,
} = require('forta-agent');

const {
  REWARD_TOKEN,
  REWARD_VAULT,
} = require("./constants");

const mockBalance = 10**18;


// mock the JsonRpcBatchProvider and Contract constructors
jest.mock('ethers', () => ({
  Contract: jest.fn(),
  providers: {
    JsonRpcBatchProvider: jest.fn(),
  },
  ...jest.requireActual('ethers'),
}));
// import the rest of the ethers.js module
const ethers = require('ethers');

/* handler import */
const { handleTransaction } = require('./agent');

/* handler tests */
describe('dodo vault address token monitoring', () => {
  describe('handleTransaction', () => {
    var mockProvider = jest.fn();
    var mockTokenContract = {
      balanceOf: jest.fn(),
      transfer: jest.fn()
    };

    var resetMocks = function () {
      mockProvider.mockReset();
      mockTokenContract.balanceOf.mockReset();
    };

    const logsMatchTransferEventAddressMatch = [{
      address: '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        ethers.constants.HashZero,
        ethers.constants.HashZero,
      ],
      data: `xxxxx`,
    }];

    beforeEach(async () => {
      resetMocks();
      mockTokenContract.balanceOf.mockReturnValue(mockBalance);
    });

    it('returns empty findings for the amount greater than the minimum amount', async () => {
      // supply ethers.Contract mock with correct mock contract objects to return
      ethers.Contract = jest.fn()
          .mockImplementationOnce(() => mockTokenContract);
      mockTokenContract.balanceOf.mockReturnValue(10**28);
      const receipt = {
        logs: logsMatchTransferEventAddressMatch,
      };
      const txEvent = createTransactionEvent({receipt})
      // this will determine that the Flash included an amount of 100 tokens of token0
      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });


    it('returns 1 findings for the amount less than the minimum amount', async () => {
      const receipt = {
        logs: logsMatchTransferEventAddressMatch,
      };
      const txEvent = createTransactionEvent({receipt})

      ethers.Contract = jest.fn()
          .mockImplementationOnce(() => mockTokenContract);

      const findings = await handleTransaction(txEvent);
      const expectedFindings = [
        Finding.fromObject({
          name: 'DODO miner vault contract reward token less than 25,000,000',
          description: `DODO miner vault contract reward token less than 25,000,000, the amount is 1`,
          alertId: 'DODO-Miner-Vault-Token-Less-Than-BaseAmount',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: 'DODO',
          metadata: {
            vaultAddress: REWARD_VAULT.toString(),
            rewardToken: REWARD_TOKEN.toString(),
            tokenBalance: "1"
          },
        }),
      ];
      expect(findings).toStrictEqual(expectedFindings);
    });
  });
});
