// test/remittance-test.ts
import { ethers } from "hardhat";
import { expect } from "chai";
import type { 
  BaseContract, 
  ContractTransactionResponse 
} from "ethers";

// ✅ Define interface
interface RemittanceOffRamp extends BaseContract {
  initiatePayout: (
    usdcAmount: bigint,
    ngAmount: bigint,
    exchangeRate: bigint,
    bankAccount: string,
    accountName: string
  ) => Promise<ContractTransactionResponse>;

  withdraw: () => Promise<ContractTransactionResponse>;
}

// ✅ Helper: Cast any BaseContract to RemittanceOffRamp
function asRemittanceOffRamp(contract: BaseContract): RemittanceOffRamp {
  return contract as unknown as RemittanceOffRamp;
}

describe("RemittanceOffRamp", function () {
  let contract: RemittanceOffRamp;
  let owner: any, user: any;

  const BANK_ACCOUNT = "0812345678";
  const ACCOUNT_NAME = "John Doe";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("RemittanceOffRamp");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();

    // ✅ Initial cast
    contract = asRemittanceOffRamp(deployed);
  });

  it("Should emit PayoutInitiated event", async function () {
    const usdcAmount = ethers.parseUnits("10", 6);
    const ngAmount = 15200n;
    const exchangeRate = 1520n;

    await expect(
      contract.initiatePayout(
        usdcAmount,
        ngAmount,
        exchangeRate,
        BANK_ACCOUNT,
        ACCOUNT_NAME
      )
    ).to.emit(contract, "PayoutInitiated");
  });

  it("Should reject zero USDC amount", async function () {
    await expect(
      contract.initiatePayout(
        0n,
        1000n,
        1500n,
        BANK_ACCOUNT,
        ACCOUNT_NAME
      )
    ).to.be.revertedWith("A0");
  });

  it("Should reject zero NGN amount", async function () {
    const usdcAmount = ethers.parseUnits("1", 6);
    await expect(
      contract.initiatePayout(
        usdcAmount,
        0n,
        1500n,
        BANK_ACCOUNT,
        ACCOUNT_NAME
      )
    ).to.be.revertedWith("N0");
  });

  it("Should reject invalid bank account length", async function () {
    const usdcAmount = ethers.parseUnits("1", 6);
    await expect(
      contract.initiatePayout(
        usdcAmount,
        1500n,
        1500n,
        "123456789",
        ACCOUNT_NAME
      )
    ).to.be.revertedWith("BA10");
  });

  it("Should allow owner to withdraw ETH", async function () {
    // Send ETH to contract
    await user.sendTransaction({
      to: await contract.getAddress(),
      value: ethers.parseEther("1"),
    });

    const initialBalance = await owner.provider.getBalance(owner.address);

    const tx = await contract.withdraw();
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
  });

  it("Should reject non-owner from withdrawing", async function () {
    // ✅ Re-cast after .connect()
    const userContract = asRemittanceOffRamp(contract.connect(user));

    await expect(
      userContract.withdraw()
    ).to.be.revertedWith("NotOwner");
  });

  it("Should initiate payout with reasonable gas", async function () {
    const usdcAmount = ethers.parseUnits("5", 6);
    const ngAmount = 7600n;
    const exchangeRate = 1520n;

    const tx = await contract.initiatePayout(
      usdcAmount,
      ngAmount,
      exchangeRate,
      BANK_ACCOUNT,
      ACCOUNT_NAME
    );

    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
    if (!receipt) throw new Error("Receipt is null");

    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    expect(receipt.gasUsed).to.be.below(100_000);
  });
});