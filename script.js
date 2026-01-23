// ===== OneX Staking Frontend Script =====

// 1️⃣ Contract Address (Polygon Mainnet)
const contractAddress = "0x2129fE3E81bedBb85D65760896b8d14Cfafb403a";

// 2️⃣ ABI (तू दिलेला exact ABI)
const abi = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[],"name":"MIN_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"earned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

// 3️⃣ Global vars
let provider, signer, contract, user;

// 4️⃣ Connect Wallet
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask install kara");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  user = await signer.getAddress();
  contract = new ethers.Contract(contractAddress, abi, signer);

  document.getElementById("connectBtn").innerText = "Connected";
  loadData();
}

// 5️⃣ Load balances & rewards
async function loadData() {
  const decimals = await contract.decimals();
  const bal = await contract.balanceOf(user);
  const rewards = await contract.earned(user);

  document.getElementById("userBalance").innerText =
    ethers.utils.formatUnits(bal, decimals);

  document.getElementById("rewardAmount").innerText =
    ethers.utils.formatUnits(rewards, decimals);
}

// 6️⃣ Stake function
async function stakeTokens() {
  const amount = document.getElementById("stakeInput").value;
  if (!amount || amount < 10000) {
    alert("Minimum 10,000 ONEX stake kara");
    return;
  }

  const decimals = await contract.decimals();
  const weiAmount = ethers.utils.parseUnits(amount, decimals);

  const tx = await contract.stake(weiAmount);
  await tx.wait();

  alert("Stake successful");
  loadData();
}

// 7️⃣ Claim rewards
async function claimRewards() {
  const tx = await contract.claimReward();
  await tx.wait();

  alert("Rewards claimed");
  loadData();
}

// 8️⃣ Unstake all
async function unstakeAll() {
  const decimals = await contract.decimals();
  const bal = await contract.balanceOf(user);

  const tx = await contract.unstake(bal);
  await tx.wait();

  alert("Unstaked successfully");
  loadData();
}

// 9️⃣ Button bindings
document.getElementById("connectBtn").onclick = connectWallet;
document.getElementById("stakeBtn").onclick = stakeTokens;
document.getElementById("claimBtn").onclick = claimRewards;
document.getElementById("unstakeBtn").onclick = unstakeAll;