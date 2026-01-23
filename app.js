let web3;
let contract;
let user;

const CONTRACT_ADDRESS = "0x2129fE3E81bedBb85D65760896b8d14Cfafb403a";
const POLYGON_CHAIN_ID = 137;

const ABI = [
  {"inputs":[],"name":"decimals","outputs":[{"type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"type":"uint256"}],"name":"stake","stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"type":"uint256"}],"name":"unstake","stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimReward","stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"type":"address"}],"name":"balanceOf","outputs":[{"type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"type":"address"}],"name":"earned","outputs":[{"type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"type":"address"}],"name":"stakes","outputs":[
    {"name":"amount","type":"uint256"},
    {"name":"rewardPerTokenPaid","type":"uint256"},
    {"name":"rewards","type":"uint256"}
  ],"stateMutability":"view","type":"function"}
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask install kar");
    return;
  }

  web3 = new Web3(window.ethereum);
  const chainId = await web3.eth.getChainId();

  if (chainId !== POLYGON_CHAIN_ID) {
    document.getElementById("networkWarning").style.display = "block";
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }]
    });
    return;
  }

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  user = accounts[0];

  contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  document.getElementById("connectBtn").innerText = "Connected";
  enableUI(true);
  refreshData();
}

async function refreshData() {
  const decimals = await contract.methods.decimals().call();
  const base = BigInt(10) ** BigInt(decimals);

  const wallet = await contract.methods.balanceOf(user).call();
  const reward = await contract.methods.earned(user).call();
  const stakeInfo = await contract.methods.stakes(user).call();

  document.getElementById("walletBalance").innerText =
    (BigInt(wallet) / base).toString();

  document.getElementById("rewardAmount").innerText =
    (BigInt(reward) / base).toString();

  document.getElementById("stakedAmount").innerText =
    (BigInt(stakeInfo.amount) / base).toString();
}

async function stakeTokens() {
  const amount = document.getElementById("stakeInput").value;
  if (amount < 10000) {
    alert("Minimum 10,000 ONEX");
    return;
  }

  const decimals = await contract.methods.decimals().call();
  const weiAmount =
    (BigInt(amount) * (BigInt(10) ** BigInt(decimals))).toString();

  await contract.methods.stake(weiAmount).send({ from: user });
  refreshData();
}

async function claimRewards() {
  await contract.methods.claimReward().send({ from: user });
  refreshData();
}

async function unstakeAll() {
  if (!confirm("Unstake all tokens?")) return;

  const stakeInfo = await contract.methods.stakes(user).call();
  await contract.methods.unstake(stakeInfo.amount).send({ from: user });
  refreshData();
}

function enableUI(enable) {
  document.getElementById("stakeBtn").disabled = !enable;
  document.getElementById("claimBtn").disabled = !enable;
  document.getElementById("unstakeBtn").disabled = !enable;
}

/* BUTTON EVENTS */
document.getElementById("connectBtn").onclick = connectWallet;
document.getElementById("stakeBtn").onclick = stakeTokens;
document.getElementById("claimBtn").onclick = claimRewards;
document.getElementById("unstakeBtn").onclick = unstakeAll;