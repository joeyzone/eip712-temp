import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { config } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const mailData = {
  to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  contents: "this is test contents",
};

describe("EIP712", async () => {
  let contract712: Contract;

  async function deployContract712() {
    const Contract712 = await ethers.getContractFactory("Contract712");
    const contract712 = await Contract712.deploy("eip712-test", "version1");
    return contract712;
  }
  async function creatSignature712(account: SignerWithAddress) {
    const { chainId } = await ethers.provider.getNetwork();
    const domain = {
      name: "eip712-test",
      version: "version1",
      chainId: chainId,
      verifyingContract: await contract712.getAddress(),
    };
    const types = {
      Mail: [
        { name: "to", type: "address" },
        { name: "contents", type: "string" },
      ],
    };

    const signature = await account.signTypedData(domain, types, mailData);
    return signature;
  }
  beforeEach(async () => {
    contract712 = await loadFixture(deployContract712);
  });

  it("should be right deployment", async () => {
    const { name } = await contract712.eip712Domain();
    expect(name).to.equal("eip712-test");
  });

  it("should be right signature", async () => {
    const [owner, other] = await ethers.getSigners();
    const signature = await creatSignature712(owner);
    expect(
      await contract712.verify(mailData.to, mailData.contents, signature)
    ).to.equal(true);
  });

  it("should be false if other's signature", async () => {
    const [owner, other] = await ethers.getSigners();
    const signature = await creatSignature712(other);
    expect(
      await contract712.verify(mailData.to, mailData.contents, signature)
    ).to.equal(false);
  });
});
