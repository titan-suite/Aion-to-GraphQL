const { graphql } = require('graphql')
const path = require('path')
const fs = require('fs')
const { expect } = require('chai')
const Web3 = require('aion-web3')

const { genGraphQlProperties } = require('../lib/index')
const { deploy } = require('../services/aion')
const { mainAccountPass, web3Address } = require('../config')

const ExampleContract = fs.readFileSync(
  path.resolve(__dirname, '../contracts', 'Example.sol'),
  'utf8'
)
const web3 = new Web3(new Web3.providers.HttpProvider(web3Address))
const mainAccount = web3.personal.listAccounts[0]
let schema, rootValue
global.mainAccount = mainAccount
global.gas = 1500000

const deployContract = async () => {
  const {
    deployedContract: { abi, address }
  } = await deploy({
    contract: ExampleContract,
    contractName: 'Example',
    mainAccount,
    mainAccountPass,
    web3,
    contractArguments: ''
  })
  global.mainAccount = mainAccount
  console.log('deployed at ' + address)

  return await genGraphQlProperties({
    artifact: {
      abi
    },
    contract: web3.eth.contract(abi).at(address)
  })
}
describe('Contract Deployment', async () => {
  it('It should deploy', async () => {
    const gqlData = await deployContract()
    schema = gqlData.schema
    rootValue = gqlData.rootValue
    expect(gqlData).to.exist
  }).timeout(0)
})
describe('Test All functions', async () => {
  it('should verify the initial value is 5', async () => {
    const query = `
      query {
        num {
          uint128_0 {
            int
          }
        }
      }
    `
    const result = await graphql(schema, query, rootValue)
    expect(result.data.num['uint128_0']['int']).to.equal(5)
  }).timeout(0)

  it('should succesfully set the value to 100', async () => {
    const mutation = `
    mutation{
      setA(a:100)
    }
  `
    const result = await graphql(schema, mutation, rootValue)
    expect(result.data['setA']).to.be.true
  }).timeout(0)

  it('should succesfully add 20 to the num and expect 120', async () => {
    const query = `
    query {
      add(a:20) {
        uint128_0 {
          int
        }
      }
    }
  `
    const result = await graphql(schema, query, rootValue)
    expect(result.data['add']['uint128_0']['int']).to.equal(120)
  }).timeout(0)
})
