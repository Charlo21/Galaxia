/**
 * Galaxia wallet network policy: Sepolia-only (chainId 11155111).
 * MAINNET_BLOCKED is always enforced — Ethereum mainnet (1) is rejected.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.GalaxiaNetwork = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SEPOLIA_CHAIN_ID = 11155111;
  var MAINNET_CHAIN_ID = 1;
  var MAINNET_BLOCKED = true;
  var SEPOLIA_RPC_URL = 'https://rpc.sepolia.org';
  var SEPOLIA_HEX = '0xaa36a7';

  function normalizeChainId(chainId) {
    if (typeof chainId === 'string') {
      return chainId.startsWith('0x') || chainId.startsWith('0X')
        ? parseInt(chainId, 16)
        : parseInt(chainId, 10);
    }
    return Number(chainId);
  }

  function isSepolia(chainId) {
    return normalizeChainId(chainId) === SEPOLIA_CHAIN_ID;
  }

  function isMainnet(chainId) {
    return normalizeChainId(chainId) === MAINNET_CHAIN_ID;
  }

  /**
   * Returns null when the chain is allowed (Sepolia).
   * Returns a reason string when blocked (mainnet or any other network).
   */
  function getNetworkBlockReason(chainId) {
    var id = normalizeChainId(chainId);
    if (Number.isNaN(id)) {
      return 'Unknown network. Switch to Ethereum Sepolia (chainId 11155111).';
    }
    if (MAINNET_BLOCKED && isMainnet(id)) {
      return 'MAINNET_BLOCKED: Ethereum mainnet is not allowed. Switch to Sepolia (chainId 11155111).';
    }
    if (!isSepolia(id)) {
      return (
        'Network mismatch: connected to chainId ' +
        id +
        '. This app is Sepolia-only (chainId 11155111).'
      );
    }
    return null;
  }

  function assertSepoliaOrThrow(chainId) {
    var reason = getNetworkBlockReason(chainId);
    if (reason) {
      var err = new Error(reason);
      err.code = isMainnet(chainId) ? 'MAINNET_BLOCKED' : 'NETWORK_MISMATCH';
      throw err;
    }
  }

  function showNetworkMismatchPrompt(message) {
    if (typeof document === 'undefined') return;

    var existing = document.getElementById('network-mismatch-prompt');
    if (existing) {
      existing.textContent = message;
      existing.hidden = false;
      return existing;
    }

    var el = document.createElement('div');
    el.id = 'network-mismatch-prompt';
    el.setAttribute('role', 'alert');
    el.style.cssText = [
      'position:fixed',
      'top:12px',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:10000',
      'max-width:min(560px,92vw)',
      'padding:12px 16px',
      'background:#3b1111',
      'color:#ffd7d7',
      'border:1px solid #c0392b',
      'border-radius:8px',
      'font:14px/1.4 system-ui,sans-serif',
      'box-shadow:0 4px 16px rgba(0,0,0,0.35)',
      'text-align:center'
    ].join(';');
    el.textContent = message;
    document.body.appendChild(el);
    return el;
  }

  function hideNetworkMismatchPrompt() {
    if (typeof document === 'undefined') return;
    var el = document.getElementById('network-mismatch-prompt');
    if (el) el.hidden = true;
  }

  function updateWalletStatus(message, color) {
    if (typeof document === 'undefined') return;
    var status = document.getElementById('wallet-status');
    if (status) {
      status.textContent = message;
      if (color) status.style.color = color;
    }
  }

  async function getProviderChainId(ethereum) {
    var raw = await ethereum.request({ method: 'eth_chainId' });
    return normalizeChainId(raw);
  }

  async function requestSepolia(ethereum) {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_HEX }]
      });
    } catch (switchError) {
      // 4902 = chain not added to wallet
      if (switchError && (switchError.code === 4902 || switchError.code === '4902')) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_HEX,
              chainName: 'Sepolia',
              nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: [SEPOLIA_RPC_URL],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }
          ]
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Connect wallet only on Sepolia. Blocks mainnet and shows a visible mismatch prompt.
   * Returns { account, chainId } on success.
   */
  async function connectSepoliaWallet(ethereum) {
    if (!ethereum) {
      throw new Error('No Ethereum provider. Install MetaMask (or another wallet) to connect.');
    }

    var accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    var account = accounts && accounts[0];
    if (!account) {
      throw new Error('No account returned from wallet.');
    }

    var chainId = await getProviderChainId(ethereum);
    var reason = getNetworkBlockReason(chainId);
    if (reason) {
      showNetworkMismatchPrompt(reason);
      updateWalletStatus(reason, '#e74c3c');
      try {
        await requestSepolia(ethereum);
        chainId = await getProviderChainId(ethereum);
        reason = getNetworkBlockReason(chainId);
      } catch (e) {
        // Keep the mismatch prompt; do not treat as connected.
        throw new Error(reason);
      }
      if (reason) {
        throw new Error(reason);
      }
    }

    hideNetworkMismatchPrompt();
    return { account: account, chainId: chainId, rpcUrl: SEPOLIA_RPC_URL };
  }

  function attachChainListeners(ethereum, onMismatch, onSepolia) {
    if (!ethereum || typeof ethereum.on !== 'function') return function () {};

    function handleChainChanged(chainId) {
      var reason = getNetworkBlockReason(chainId);
      if (reason) {
        showNetworkMismatchPrompt(reason);
        updateWalletStatus(reason, '#e74c3c');
        if (typeof onMismatch === 'function') onMismatch(reason, normalizeChainId(chainId));
      } else {
        hideNetworkMismatchPrompt();
        if (typeof onSepolia === 'function') onSepolia(normalizeChainId(chainId));
      }
    }

    ethereum.on('chainChanged', handleChainChanged);
    return function detach() {
      if (typeof ethereum.removeListener === 'function') {
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }

  return {
    SEPOLIA_CHAIN_ID: SEPOLIA_CHAIN_ID,
    MAINNET_CHAIN_ID: MAINNET_CHAIN_ID,
    MAINNET_BLOCKED: MAINNET_BLOCKED,
    SEPOLIA_RPC_URL: SEPOLIA_RPC_URL,
    SEPOLIA_HEX: SEPOLIA_HEX,
    normalizeChainId: normalizeChainId,
    isSepolia: isSepolia,
    isMainnet: isMainnet,
    getNetworkBlockReason: getNetworkBlockReason,
    assertSepoliaOrThrow: assertSepoliaOrThrow,
    showNetworkMismatchPrompt: showNetworkMismatchPrompt,
    hideNetworkMismatchPrompt: hideNetworkMismatchPrompt,
    connectSepoliaWallet: connectSepoliaWallet,
    requestSepolia: requestSepolia,
    attachChainListeners: attachChainListeners,
    getProviderChainId: getProviderChainId
  };
});
