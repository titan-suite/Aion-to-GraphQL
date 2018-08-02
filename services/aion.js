var solc = require('solc')

const compile = async (sol) => {
  console.info('Compiling...')
  return await solc.compile(sol, 1)
}

const _compile = async (sol, web3) => {
  return new Promise((resolve, reject) => {
    web3.eth.compile.solidity(sol, (err, res) => {
      if (err) {
        console.log('compile error:' + err)
        reject(err)
      }
      if (res) {
        // console.log('compile res:' + JSON.stringify(res))
        resolve(res)
      }
    })
  })
}

const unlock = async ({ addr, pw, web3 }) => {
  console.info('Unlocking...')
  return new Promise((resolve, reject) => {
    web3.personal.unlockAccount(addr, pw, 999999, (err, unlock) => {
      if (err) reject(err)
      else if (unlock && unlock === true) {
        resolve(addr)
      } else {
        reject('unlock fail')
      }
    })
  })
}

const _deployContract = async ({
  mainAccount,
  abi,
  code,
  web3,
  contractArguments
}) => {
  console.info('Deploying...')
  return new Promise((resolve, reject) => {
    if (contractArguments.length > 0) {
      console.dir(contractArguments.split(','))
      web3.eth.contract(abi).new(
        ...contractArguments.split(','),
        {
          from: mainAccount,
          data: code,
          gas: 4700000
        },
        (err, contract) => {
          if (err) {
            console.log('rejecting...')
            reject(err)
          } else if (contract && contract.address) {
            resolve(contract)
          }
        }
      )
    } else {
      web3.eth.contract(abi).new(
        {
          from: mainAccount,
          data: code,
          gas: 4700000
        },
        (err, contract) => {
          if (err) {
            console.log('rejecting...')
            reject(err)
          } else if (contract && contract.address) {
            resolve(contract)
          }
        }
      )
    }
  })
}

const deploy = async ({
  contract,
  contractName,
  mainAccount,
  mainAccountPass,
  web3,
  contractArguments
}) => {
  const compiledCode = await _compile(contract, web3)
  await unlock({ addr: mainAccount, pw: mainAccountPass, web3 })
  const deployedContract = await _deployContract({
    mainAccount,
    abi: compiledCode[contractName].info.abiDefinition,
    code: compiledCode[contractName].code,
    web3,
    contractArguments
  })
  return {
    deployedContract,
    compiledCode
  }
}

module.exports = {
  deploy,
  compile
}
