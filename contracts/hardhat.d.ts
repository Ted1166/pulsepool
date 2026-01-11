import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: any;
  }
  
  interface NetworkManager {
    name: string;
  }
}