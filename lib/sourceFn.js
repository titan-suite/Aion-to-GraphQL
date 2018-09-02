// Purpose of this method is to call the AION node. It will then pass the results to the outputmapper fn.
const Web3 = require('aion-web3')
const web3 = new Web3()
let Web3eth
const getTransactionReceiptMined = (txHash, interval) => {
  const transactionReceiptAsync = function(resolve, reject) {
    Web3eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        reject(error)
      } else if (receipt == null) {
        setTimeout(
          () => transactionReceiptAsync(resolve, reject),
          interval ? interval : 1000
        )
      } else {
        resolve(
          Object.assign({}, receipt, { logs: JSON.stringify(receipt.logs) })
        )
      }
    })
  }

  if (Array.isArray(txHash)) {
    return Promise.all(
      txHash.map((oneTxHash) => getTransactionReceiptMined(oneTxHash, interval))
    )
  } else if (typeof txHash === 'string') {
    return new Promise(transactionReceiptAsync)
  } else {
    throw new Error('Invalid Type: ' + txHash)
  }
}

const sourceFn = ({
  contract,
  method,
  outputMapper,
  isCall = true,
  options = {
    from: global.mainAccount,
    gas: global.gas
  }
}) => {
  return async function() {
    try {
      const instance = await contract
      Web3eth = instance._eth
      let args = Object.values(arguments).map((arg) => {
        if (typeof arg === 'string') {
          return web3.fromAscii(arg)
        }
        return arg
      })
      const fn = isCall
        ? instance[method].call(...args, options)
        : await getTransactionReceiptMined(instance[method](...args, options))

      const data = await fn
      return outputMapper(data)
    } catch (e) {
      console.log('Inside sourceFN error ------------------------ ')
      console.log(e)
      return new Error(e)
    }
  }
}

module.exports = sourceFn
