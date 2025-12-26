# 🌊 0xBasedApp - The Pulse of the Chain

**Stake $BASED. Pulse Daily. Maximize APY.**


---

## 🎯 **Project Overview**

**BasedStake** combines DeFi reliability with mobile gaming engagement mechanics:
- ✅ **Multi-tier staking pools** (30/60/90 days)
- ✅ **Daily "Pulse" interaction** for APY multipliers
- ✅ **Builder Score integration** from Talent Protocol
- ✅ **Streak mechanics** with Loss Aversion psychology
- ✅ **Farcaster MiniApp** for viral growth
- ✅ **Base mainnet ready** for real transaction volume

### **Key Metrics for Builder Score**
- Transaction volume (every stake, pulse, unstake)
- Fees generated on Base mainnet
- Unique wallet connections
- GitHub contributions (public repo)
- Farcaster MiniApp engagement

---

## 🏗️ **Architecture**

### **Smart Contracts (Solidity)**
Located in `src/lib/contracts.ts` - **You must deploy these to Base mainnet:**

1. **BasedToken.sol** - ERC-20 token
2. **BasedStaking.sol** - Core staking logic with pulse mechanics

**Key Functions:**
- `stake(uint256 amount, uint256 lockPeriod)` - Lock tokens
- `pulse()` - Daily interaction to compound rewards & maintain streak
- `withdraw(uint256 amount)` - Unstake (with penalty if early)
- `getUserStake(address user)` - Fetch stake data
- `getPendingRewards(address user)` - Calculate rewards

### **Frontend (Next.js + OnchainKit + Farcaster)**
- **Base blockchain integration** via OnchainKit
- **Coinbase Smart Wallet** support
- **Farcaster MiniApp** with Quick Auth
- **Builder Score display** from Talent Protocol API
- **Brutalist UI** (Base Blue #0052FF, Black, White)

---

## 🚀 **Deployment Guide**

### **Step 1: Deploy Smart Contracts**

You need to deploy two Solidity contracts to Base mainnet:

#### **1. BasedToken.sol (ERC-20)**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BasedToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("BasedToken", "BASED") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
```

Deploy with:
- Initial Supply: `1000000` (1 million tokens)

#### **2. BasedStaking.sol (Core Logic)**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BasedStaking is ReentrancyGuard {
    IERC20 public token;
    uint256 public constant BASE_APY = 500; // 5%
    uint256 public constant PULSE_COOLDOWN = 20 hours;
    uint256 public constant PULSE_WINDOW_END = 28 hours;

    struct Stake {
        uint256 principal;
        uint256 lockEnd;
        uint256 lastInteraction;
        uint256 streakCount;
    }

    mapping(address => Stake) public stakes;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakes[msg.sender] = Stake({
            principal: amount,
            lockEnd: block.timestamp + lockPeriod,
            lastInteraction: block.timestamp,
            streakCount: 0
        });
    }

    function pulse() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.principal > 0, "No stake");
        require(block.timestamp >= userStake.lastInteraction + PULSE_COOLDOWN, "Cooldown active");
        require(block.timestamp <= userStake.lastInteraction + PULSE_WINDOW_END, "Window expired");

        userStake.lastInteraction = block.timestamp;
        userStake.streakCount++;
        
        // Compound rewards logic here
    }

    function withdraw(uint256 amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.principal >= amount, "Insufficient stake");
        
        uint256 penalty = 0;
        if (block.timestamp < userStake.lockEnd) {
            penalty = amount * 5 / 100; // 5% penalty
        }
        
        userStake.principal -= amount;
        require(token.transfer(msg.sender, amount - penalty), "Transfer failed");
    }

    function getUserStake(address user) external view returns (
        uint256 principal,
        uint256 lockEnd,
        uint256 lastInteraction,
        uint256 streakCount
    ) {
        Stake memory userStake = stakes[user];
        return (userStake.principal, userStake.lockEnd, userStake.lastInteraction, userStake.streakCount);
    }

    function getPendingRewards(address user) external view returns (uint256) {
        // Calculate rewards based on time staked and APY
        return 0; // Implement your reward logic
    }

    function getCurrentAPY(address user) external view returns (uint256) {
        Stake memory userStake = stakes[user];
        uint256 streakMultiplier = 1 + (userStake.streakCount * 1) / 100; // +1% per day
        return BASE_APY * streakMultiplier;
    }
}
```

**Deployment Tools:**
- Use [Remix IDE](https://remix.ethereum.org/)
- Or [Hardhat](https://hardhat.org/) with Base network config
- Or [Foundry](https://getfoundry.sh/)

**Base Mainnet RPC:**
```
https://mainnet.base.org
```

### **Step 2: Update Contract Addresses**

After deploying, update `src/lib/contracts.ts`:

```typescript
export const BASED_TOKEN_ADDRESS: Address = '0xYourTokenAddress';
export const BASED_STAKING_ADDRESS: Address = '0xYourStakingAddress';
```

### **Step 3: Configure Environment Variables**

Create `.env.local`:

```bash
# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID=0xBasedApp
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-api-key-here

# Base Network (8453 = mainnet, 84532 = sepolia)
NEXT_PUBLIC_SDK_CHAIN_ID=8453

# Talent Protocol
NEXT_PUBLIC_TALENT_PROTOCOL_API_KEY=your-talent-api-key

# Farcaster
FARCASTER_API_KEY=NEYNAR_FROG_FM
NEXT_PUBLIC_HOST=https://0xbasedapp.com
```

### **Step 4: Deploy Frontend**

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Deploy to Vercel
vercel --prod
```

---

## 🎮 **How It Works**

### **For Users:**
1. **Connect Wallet** (Coinbase Smart Wallet recommended)
2. **Stake $BASED** tokens (30/60/90 days based on Builder Score)
3. **Tap Pulse** every 20-28 hours to maintain streak
4. **Earn Boosted APY** (Base 5% + Streak + Builder Score multiplier)
5. **Unstake** anytime (penalty if before lock period)

### **APY Calculation:**
```
Total APY = Base APY × (1 + Streak Multiplier) × Builder Score Multiplier

Where:
- Base APY = 5%
- Streak Multiplier = min(streakCount × 1%, 30%)
- Builder Score Multiplier = 1.0 + (score/100 × 0.5)
```

**Example:**
- 30-day streak = +30% APY
- Builder Score 60 (Elite) = ×1.3 multiplier
- **Total: 8.45% APY**

---
# 🚀 Base Mainnet Deployment Guide

Complete step-by-step guide to deploy **0xBasedApp** to Base blockchain for the Talent Protocol campaign.

---

## 📋 **Pre-Deployment Checklist**

- [ ] Base mainnet wallet with ETH for gas (~0.01 ETH recommended)
- [ ] Contract code reviewed and tested
- [ ] Environment variables configured
- [ ] Basescan API key for verification
- [ ] Domain name configured (e.g., 0xbasedapp.com)

---

## 🔐 **Step 1: Setup Base Wallet**

### **Get Base ETH:**
1. Bridge ETH from Ethereum mainnet → Base via [bridge.base.org](https://bridge.base.org)
2. Or buy directly on Base via Coinbase
3. Recommended: 0.01 ETH for contract deployment + testing

### **Wallet Options:**
- **Coinbase Wallet** (recommended for Base)
- **MetaMask** (add Base network manually)
- **Rainbow Wallet**

### **Add Base Network to MetaMask:**
```
Network Name: Base Mainnet
RPC URL: https://mainnet.base.org
Chain ID: 8453
Currency Symbol: ETH
Block Explorer: https://basescan.org
```

---

## 📝 **Step 2: Deploy Smart Contracts**

### **Option A: Using Remix IDE (Easiest)**

1. **Go to [remix.ethereum.org](https://remix.ethereum.org/)**

2. **Create `BasedToken.sol`:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BasedToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("BasedToken", "BASED") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
```

3. **Compile:**
   - Compiler: 0.8.20+
   - Optimization: Enabled (200 runs)

4. **Deploy:**
   - Environment: "Injected Provider - MetaMask"
   - Contract: BasedToken
   - Constructor Args: `1000000` (1 million tokens)
   - Click "Deploy"
   - Confirm in wallet

5. **Save the address:** `0x...` ← Your $BASED token address

6. **Create `BasedStaking.sol`:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasedStaking is ReentrancyGuard, Ownable {
    IERC20 public token;
    
    uint256 public constant BASE_APY = 500; // 5% in basis points
    uint256 public constant PULSE_COOLDOWN = 20 hours;
    uint256 public constant PULSE_WINDOW_END = 28 hours;
    uint256 public constant EARLY_UNSTAKE_PENALTY = 500; // 5%
    
    struct Stake {
        uint256 principal;
        uint256 lockEnd;
        uint256 lastInteraction;
        uint256 streakCount;
        uint256 rewardsAccrued;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Pulsed(address indexed user, uint256 newStreak);
    event Withdrawn(address indexed user, uint256 amount, uint256 penalty);
    
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }
    
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(
            lockPeriod == 30 days || lockPeriod == 60 days || lockPeriod == 90 days,
            "Invalid lock period"
        );
        
        Stake storage userStake = stakes[msg.sender];
        require(userStake.principal == 0, "Already staked");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userStake.principal = amount;
        userStake.lockEnd = block.timestamp + lockPeriod;
        userStake.lastInteraction = block.timestamp;
        userStake.streakCount = 0;
        userStake.rewardsAccrued = 0;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    function pulse() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.principal > 0, "No stake");
        
        uint256 timeSinceLastPulse = block.timestamp - userStake.lastInteraction;
        
        require(timeSinceLastPulse >= PULSE_COOLDOWN, "Cooldown active");
        require(timeSinceLastPulse <= PULSE_WINDOW_END, "Window expired - streak reset");
        
        // Calculate and compound rewards
        uint256 rewards = _calculateRewards(msg.sender);
        userStake.rewardsAccrued += rewards;
        
        userStake.lastInteraction = block.timestamp;
        userStake.streakCount++;
        
        emit Pulsed(msg.sender, userStake.streakCount);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.principal >= amount, "Insufficient stake");
        
        uint256 penalty = 0;
        if (block.timestamp < userStake.lockEnd) {
            penalty = (amount * EARLY_UNSTAKE_PENALTY) / 10000;
        }
        
        uint256 rewards = userStake.rewardsAccrued;
        
        userStake.principal -= amount;
        userStake.rewardsAccrued = 0;
        totalStaked -= amount;
        
        uint256 totalToSend = amount + rewards - penalty;
        
        require(token.transfer(msg.sender, totalToSend), "Transfer failed");
        
        emit Withdrawn(msg.sender, amount, penalty);
    }
    
    function _calculateRewards(address user) internal view returns (uint256) {
        Stake memory userStake = stakes[user];
        
        uint256 timeStaked = block.timestamp - userStake.lastInteraction;
        uint256 streakMultiplier = 10000 + (userStake.streakCount * 100); // +1% per day, max 30%
        if (streakMultiplier > 13000) streakMultiplier = 13000;
        
        uint256 effectiveAPY = (BASE_APY * streakMultiplier) / 10000;
        
        uint256 rewards = (userStake.principal * effectiveAPY * timeStaked) / (365 days * 10000);
        
        return rewards;
    }
    
    function getUserStake(address user) external view returns (
        uint256 principal,
        uint256 lockEnd,
        uint256 lastInteraction,
        uint256 streakCount
    ) {
        Stake memory userStake = stakes[user];
        return (
            userStake.principal,
            userStake.lockEnd,
            userStake.lastInteraction,
            userStake.streakCount
        );
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        return stakes[user].rewardsAccrued + _calculateRewards(user);
    }
    
    function getCurrentAPY(address user) external view returns (uint256) {
        Stake memory userStake = stakes[user];
        uint256 streakMultiplier = 10000 + (userStake.streakCount * 100);
        if (streakMultiplier > 13000) streakMultiplier = 13000;
        
        return (BASE_APY * streakMultiplier) / 10000;
    }
}
```

7. **Deploy:**
   - Constructor Args: `<BasedToken Address from step 5>`
   - Click "Deploy"
   - Confirm in wallet

8. **Save the address:** `0x...` ← Your staking contract address

### **Option B: Using Hardhat**

1. **Install Hardhat:**
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @openzeppelin/contracts
```

2. **Configure `hardhat.config.js`:**
```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [`0x${YOUR_PRIVATE_KEY}`],
      chainId: 8453
    }
  }
};
```

3. **Deploy script `scripts/deploy.js`:**
```javascript
async function main() {
  // Deploy token
  const Token = await ethers.getContractFactory("BasedToken");
  const token = await Token.deploy(1000000);
  await token.deployed();
  console.log("Token deployed to:", token.address);
  
  // Deploy staking
  const Staking = await ethers.getContractFactory("BasedStaking");
  const staking = await Staking.deploy(token.address);
  await staking.deployed();
  console.log("Staking deployed to:", staking.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. **Run:**
```bash
npx hardhat run scripts/deploy.js --network base
```

---

## ✅ **Step 3: Verify Contracts on Basescan**

1. **Get Basescan API key:** [basescan.org/myapikey](https://basescan.org/myapikey)

2. **Using Hardhat:**
```bash
npx hardhat verify --network base <TOKEN_ADDRESS> 1000000
npx hardhat verify --network base <STAKING_ADDRESS> <TOKEN_ADDRESS>
```

3. **Or manually on Basescan:**
   - Go to contract address
   - Click "Verify and Publish"
   - Compiler: 0.8.20
   - Optimization: Yes (200 runs)
   - Paste contract code
   - Submit

---

## 🔧 **Step 4: Update Frontend Config**

Edit `src/lib/contracts.ts`:

```typescript
export const BASED_TOKEN_ADDRESS: Address = '0xYOUR_TOKEN_ADDRESS';
export const BASED_STAKING_ADDRESS: Address = '0xYOUR_STAKING_ADDRESS';
```

---

## 🌐 **Step 5: Deploy Frontend to Vercel**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add contract addresses"
git push origin main
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Configure environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_SDK_CHAIN_ID=8453`
   - `NEXT_PUBLIC_TALENT_PROTOCOL_API_KEY=your-key`
   - `NEXT_PUBLIC_HOST=https://yourdomain.com`

4. **Add custom domain** in Vercel settings

---

## 🎯 **Step 6: Initial Token Distribution**

For testing and early users:

```bash
# Using Ethers.js
const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
await token.transfer("0xRecipient", ethers.utils.parseEther("100"));
```

Or use Basescan "Write Contract" interface.

---

## 📊 **Step 7: Monitoring & Analytics**

### **Track on Basescan:**
- Token transfers: `https://basescan.org/token/<TOKEN_ADDRESS>`
- Staking interactions: `https://basescan.org/address/<STAKING_ADDRESS>`

### **Dune Analytics:**
Create dashboard to track:
- Total Value Locked (TVL)
- Unique stakers
- Transaction volume
- Daily pulse interactions

---

## 🔍 **Testing Checklist**

Before public launch, test:

- [ ] Stake tokens (30/60/90 days)
- [ ] Pulse within 20-28 hour window
- [ ] Check streak counter increments
- [ ] Verify APY calculation
- [ ] Test early unstake penalty
- [ ] Withdraw after lock period
- [ ] Multiple users simultaneously
- [ ] Edge cases (expired window, cooldown)

---

## 🚨 **Security Best Practices**

1. **Start small:** Launch with limited supply (~10k tokens)
2. **Monitor transactions:** Watch for unusual patterns
3. **Set max stake limits:** Prevent whale dominance
4. **Emergency pause:** Implement pausable pattern
5. **Timelock admin functions:** 48-hour delay for changes
6. **Bug bounty:** Offer rewards for vulnerability reports

---

## 📢 **Launch Announcement Template**

**For X/Twitter:**
```
🚨 LAUNCHING 0xBasedApp on @base 🌊

Stake $BASED. Pulse Daily. Maximize APY.

✅ Multi-tier staking (30/60/90d)
✅ Streak mechanics for APY boosts
✅ Builder Score integration
✅ Farcaster MiniApp ready

Live now: [your-domain.com]

#Base #DeFi #BuilderScore
```

**For Farcaster:**
```
The Pulse of the Chain is live on Base! 🌊

Stake $BASED, maintain your daily pulse, and watch your APY multiply with every streak.

First 100 stakers get 2x rewards for 7 days.

Let's build. [your-domain.com]
```

---

## 📈 **Post-Launch Monitoring**

### **Daily:**
- Check transaction volume
- Monitor TVL growth
- Respond to user issues
- Track streak retention

### **Weekly:**
- Update GitHub (features, fixes)
- Post community updates
- Analyze user behavior
- Adjust marketing strategy

### **Campaign Updates:**
- Track Builder Score progress
- Monitor leaderboard position
- Optimize for top 500 placement

---

## 🤝 **Support & Resources**

- **Base Discord:** [base.org/discord](https://base.org/discord)
- **Talent Protocol:** [talentprotocol.com](https://talentprotocol.com)
- **Farcaster:** [docs.farcaster.xyz](https://docs.farcaster.xyz)
- **Issues:** [GitHub Issues](github.com/yourrepo/issues)

---

**Ready to deploy? Let's maximize that Builder Score! 🚀**

## 📊 **Builder Score Maximization Strategy**

### **Week 1 (Dec 1-7):**
- ✅ Deploy contracts to Base mainnet
- ✅ Verify on Basescan
- ✅ Deploy frontend to production
- ✅ Launch beta with 10-50 test users
- ✅ First GitHub commits

### **Week 2 (Dec 8-14):**
- ✅ Public launch announcement (X/Twitter, Farcaster)
- ✅ Farcaster MiniApp integration
- ✅ Daily engagement campaigns
- ✅ First 100+ transactions

### **Week 3 (Dec 15-21):**
- ✅ Referral contest (top referrers get bonus $BASED)
- ✅ Flash APY boost events (1-hour windows)
- ✅ Community challenges (total TVL goals)
- ✅ 500+ transactions target

### **Week 4 (Dec 22-31):**
- ✅ Final push: compound rewards feature
- ✅ Emergency unstake testing (still counts as txs)
- ✅ Daily streak competitions
- ✅ 1000+ transactions goal

### **GitHub Commits Strategy:**
- Daily updates (UI improvements, bug fixes)
- Weekly features (analytics dashboard, leaderboards)
- Quality over quantity (meaningful changes)
- Document everything in README

---

## 🌐 **Marketing & Community**

### **Launch Channels:**
1. **X/Twitter:**
   - Daily updates: "Total staked: X ETH, Total txs: Y"
   - User testimonials
   - Streak milestone celebrations

2. **Farcaster:**
   - Frames with live stats
   - Cast actions for instant stake
   - Weekly leaderboards
   - Builder journey updates

3. **Base Community:**
   - Discord presence
   - Telegram groups
   - Jesse Pollak mentions

### **Viral Hooks:**
- "I just synced my Pulse on Base. Streak: 7 Days. Yield: +12%. @BasedStake"
- Leaderboard sharing frames
- Achievement badges (NFTs?)

---

## 🛠️ **Development**

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint
```

**Tech Stack:**
- Next.js 15.3.8
- OnchainKit 1.1.1 (Base integration)
- Wagmi 2.18.2 (Wallet connection)
- Viem 2.38.4 (Ethereum interactions)
- Farcaster MiniApp SDK 0.2.1
- TailwindCSS 4.1.17 (Brutalist design)

---

## 📝 **Smart Contract Auditing**

⚠️ **Before mainnet launch:**
- Get contracts audited by [OpenZeppelin](https://www.openzeppelin.com/security-audits) or [Consensys Diligence](https://consensys.net/diligence/)
- Run [Slither](https://github.com/crytic/slither) static analysis
- Test extensively on Base Sepolia testnet
- Implement emergency pause functionality
- Set up multisig for admin functions

---

## 🤝 **Contributing**

This project is open source! Contributions welcome:
1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and open PR

**Priority areas:**
- Contract optimizations (gas savings)
- UI/UX improvements
- Mobile responsiveness
- Farcaster frame features
- Analytics dashboard

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file

---

## 🔗 **Links**

- **Live App:** [Coming Soon]
- **GitHub:** [This Repo]
- **Farcaster:** [@basedstake]
- **X/Twitter:** [@0xbasedapp]
- **Talent Protocol:** [Your Profile]
- **Base:** [base.org](https://base.org)

---

## 🏆 **Campaign Goals**

**Target:** Top 500 on Talent Protocol Top Base Builders leaderboard

**Key Metrics:**
- ✅ 1000+ transactions on Base mainnet
- ✅ $10k+ in fees generated
- ✅ 100+ unique wallets
- ✅ 50+ daily GitHub commits
- ✅ Farcaster MiniApp with 500+ opens
- ✅ Builder Score improvement to Elite tier

**Reward:** Share of 5 ETH prize pool distributed proportionally

---

## 💡 **Next Features (Post-Launch)**

- [ ] Leaderboards (top stakers, top streaks, top referrers)
- [ ] Achievement NFTs (7-day streak, 30-day streak, etc.)
- [ ] Team staking (group streaks)
- [ ] Flash APY events (time-limited boosts)
- [ ] Referral system with on-chain tracking
- [ ] Analytics dashboard (TVL, APY charts)
- [ ] Mobile PWA optimization
- [ ] Multi-language support

---

**Built with ❤️ on Base 🌊**

*Ready to pulse? Let's maximize that Builder Score! 🚀*
