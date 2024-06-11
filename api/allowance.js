const { ethers } = require('ethers');

module.exports = async (req, res) => {
    let { ownerAddress, spender, tokenName, network } = req.query;

    // Convert to lowercase
    tokenName = tokenName.toLowerCase();
    network = network.toLowerCase();

    // Correctly setting spender addresses based on the network
    if (network === 'polygon') {
        spender = '0x57A56BEaD1D0B65Ab5E3AcF528ECced8FbEb9378'; // Spender for Polygon
        req.query.param = 'production';
    } else if (network === 'polygon_testnet') {
        spender = '0x4d7828dd7961bc613740b56b3bcbebbc330dac51'; // Spender for Polygon Testnet
        req.query.param = 'staging';
    }

    const tokenAddresses = {
        avalanche: { wavax: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
        linea: { weth: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f' },
        bnb: { wbnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
        polygon: { usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'},
        avalanche_testnet: { usdc: '0x5425890298aed601595a70AB815c96711a31Bc65' },
        linea_testnet: { weth: '0x2C1b868d6596a18e32E61B901E4060C872647b6C' },
        bnb_testnet: { busd: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee' },
        polygon_testnet: { usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' }
    };


    let rpcUrl;
    switch (network) {
        case 'avalanche':
            rpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
            break;
        case 'linea':
            rpcUrl = 'https://rpc.linea.build';
            break;
        case 'bnb':
            rpcUrl = 'https://bsc-dataseed.bnbchain.org';
            break;
        case 'polygon':
            rpcUrl = 'https://polygon-rpc.com';
            break;
        case 'avalanche_testnet':
            rpcUrl = 'https://avalanche-fuji.drpc.org/';
            break;
        case 'linea_testnet':
            rpcUrl = 'https://rpc.goerli.linea.build';
            break;
        case 'bnb_testnet':
            rpcUrl = 'https://bsc-testnet.drpc.org/';
            break;
        case 'polygon_testnet':
            rpcUrl = 'https://polygon-rpc.com';
            break;
        default:
            return res.status(400).json({ error: 'Unsupported network' });
    }

    const tokenAddress = tokenAddresses[network][tokenName];
    if (!tokenAddress) {
        return res.status(400).json({ error: 'Unsupported token name or network' });
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    try {
        const tokenContract = new ethers.Contract(tokenAddress, [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ], provider);

        const allowance = await tokenContract.allowance(ownerAddress, spender);
        const decimals = await tokenContract.decimals();
        const formattedAllowance = ethers.utils.formatUnits(allowance, decimals);
        const roundedAllowance = Number(formattedAllowance).toFixed(2);

        res.status(200).json({ allowance: roundedAllowance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};