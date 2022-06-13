# Dodo Miner Agent

## Description

This agent detects transaction which about the dodo miner

## Supported Chains

- Polygon,Bsc,Arbitrum

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Trigger an alarm when the dodo miner address have a withdrawal event, then query the reward token balance of the reward vault.
  - Severity is always set to "Info" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

## Test Data
npm run tx 0xdb504e56d2be6156072f15c449c204897084356814dcf167e737ab00f6eab652
