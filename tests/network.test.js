'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const network = require(path.join(__dirname, '..', 'js', 'network.js'));

describe('GalaxiaNetwork Sepolia policy', () => {
  it('exports MAINNET_BLOCKED as true', () => {
    assert.equal(network.MAINNET_BLOCKED, true);
  });

  it('uses Sepolia chainId 11155111 and public RPC', () => {
    assert.equal(network.SEPOLIA_CHAIN_ID, 11155111);
    assert.equal(network.SEPOLIA_RPC_URL, 'https://rpc.sepolia.org');
    assert.equal(network.SEPOLIA_HEX, '0xaa36a7');
  });

  it('accepts Sepolia decimal and hex chain ids', () => {
    assert.equal(network.isSepolia(11155111), true);
    assert.equal(network.isSepolia('11155111'), true);
    assert.equal(network.isSepolia('0xaa36a7'), true);
    assert.equal(network.getNetworkBlockReason(11155111), null);
  });

  it('blocks Ethereum mainnet with MAINNET_BLOCKED', () => {
    assert.equal(network.isMainnet(1), true);
    assert.equal(network.isMainnet('0x1'), true);
    const reason = network.getNetworkBlockReason(1);
    assert.ok(reason);
    assert.match(reason, /MAINNET_BLOCKED/);
    assert.throws(
      () => network.assertSepoliaOrThrow(1),
      (err) => err.code === 'MAINNET_BLOCKED'
    );
  });

  it('blocks non-Sepolia non-mainnet networks with NETWORK_MISMATCH', () => {
    const reason = network.getNetworkBlockReason(137);
    assert.ok(reason);
    assert.match(reason, /Network mismatch/);
    assert.throws(
      () => network.assertSepoliaOrThrow(137),
      (err) => err.code === 'NETWORK_MISMATCH'
    );
  });
});
