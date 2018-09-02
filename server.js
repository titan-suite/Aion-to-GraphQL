const { genGraphQlProperties } = require('./lib/index')
const { deploy } = require('./services/aion')
const Web3 = require('aion-web3')
const { ApolloServer } = require('apollo-server')
const path = require('path')
const fs = require('fs')
const { mainAccountPass, web3Address } = require('./config')
const web3 = new Web3(new Web3.providers.HttpProvider(web3Address))
const mainAccount = web3.personal.listAccounts[0]
const gas = 1500000
const ExampleContract = fs.readFileSync(
  path.resolve(__dirname, 'contracts', 'Example.sol'),
  'utf8'
)
const deployContract = async () => {
  // TIP:  you can use compiled ABI and pre deployed contract address to save deployment time.

  // const deployedContract = {
  //   address:
  //     '0xa062187f6f42d4cb9da6c8644b9647daef571c2aecc031490955bfc897f23436',
  //   abi: [
  //     {
  //       outputs: [
  //         {
  //           name: '',
  //           type: 'uint128'
  //         }
  //       ],
  //       constant: false,
  //       payable: false,
  //       inputs: [
  //         {
  //           name: 'a',
  //           type: 'uint128'
  //         }
  //       ],
  //       name: 'add',
  //       type: 'function'
  //     },
  //     {
  //       outputs: [
  //         {
  //           name: '',
  //           type: 'uint128'
  //         }
  //       ],
  //       constant: true,
  //       payable: false,
  //       inputs: [],
  //       name: 'num',
  //       type: 'function'
  //     },
  //     {
  //       outputs: [],
  //       constant: false,
  //       payable: false,
  //       inputs: [
  //         {
  //           name: 'a',
  //           type: 'uint128'
  //         }
  //       ],
  //       name: 'setA',
  //       type: 'function'
  //     }
  //   ]
  // }
  const { deployedContract } = await deploy({
    contract: ExampleContract,
    contractName: 'Example',
    mainAccount,
    mainAccountPass,
    web3,
    contractArguments: ''
  })
  return deployedContract
}

const startServer = async () => {
  try {
    const { abi, address } = await deployContract()
    console.log('deployed at ' + address)
    const { schema, rootValue } = await genGraphQlProperties({
      artifact: {
        abi
      },
      contract: web3.eth.contract(abi).at(address),
      mainAccount,
      gas
    })
    const server = new ApolloServer({ schema, rootValue })
    server.listen({ port: 5001 }).then(({ url }) => {
      console.log(`GQL Playground ready at ${url}`)
    })
  } catch (err) {
    console.error(err)
  }
}
startServer()
