//imports
//main function
//calling of main function

/*function deployFunc() {
    console.log("heya!");
}

module.exports.default = deployFunc*/

/*module.exports = async (hre) => {
    const {getNmaedAccounts , deployments} = hre
    //hre.getNmaedAccounts
    //hre.deployments
}*/

const { networkConfig, developmentChains  } = require("../helper-hardhat-config")
const { network } = require("hardhat");
const { verify } = require("../utils/verify")
require("dotenv").config()
/* same as:
const helperConfig = require("../helper-hardhat-config")
const networkConfig = helperConfig.networkConfig
*/

//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPricFeed"]


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args , //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    log("----------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]