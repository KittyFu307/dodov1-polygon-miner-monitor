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
    };

    var resetMocks = function () {
      mockProvider.mockReset();
      mockTokenContract.balanceOf.mockReset();
    };

    const logsMatchTransferEventAddressMatch = [{
      address: '0xB14dA65459DB957BCEec86a79086036dEa6fc3AD',
      topics: [
        '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568',
        ethers.constants.HashZero,
        ethers.constants.HashZero,
      ],
      data: `xxxxx`,
    }];

    const logsNoMatchTransferEventAddressMatch = [{
      address: '0xB14dA65459DB957BCEec86a79086036dEa6fc3AD',
      topics: [
        '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15',
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
      ethers.Contract = jest.fn()
          .mockImplementationOnce(() => mockTokenContract);
      mockTokenContract.balanceOf.mockReturnValue(10**28);
      const receipt = {
        logs: logsNoMatchTransferEventAddressMatch,
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
          name: 'DODO V1 miner Polygon：The reward token balance of reward vault on polygon',
          description: `The reward token balance of reward vault on polygon, the amount is 1`,
          alertId: 'DODO-V1-Miner-Vault-Token-Polygon',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: 'DODO',
          metadata: {
            vaultAddress: REWARD_VAULT.toString(),
            rewardToken: REWARD_TOKEN.toString(),
            tokenBalance: '1',
          },
        }),
      ];
      expect(findings).toStrictEqual(expectedFindings);
    });
  });
});
