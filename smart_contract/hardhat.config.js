// https://eth-ropsten.alchemyapi.io/v2/drd7Lwv6-TT0N2nWp-GblFDjdXTG86ME
// 8219f3200f2c99bae24230c0027000c78ba7da8c62c6a496b00dca446922b89a - my meta priv key

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url : 'https://eth-ropsten.alchemyapi.io/v2/drd7Lwv6-TT0N2nWp-GblFDjdXTG86ME',
      accounts: ['8219f3200f2c99bae24230c0027000c78ba7da8c62c6a496b00dca446922b89a']
    }
  }
}