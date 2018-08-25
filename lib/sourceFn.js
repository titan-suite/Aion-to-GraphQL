// Purpose of this method is to call the AION node. It will then pass the results to the outputmapper fn.
const getTransactionReceiptMined = (txHash, interval) => {
  const transactionReceiptAsync = function(resolve, reject) {
    global.web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        reject(error)
      } else if (receipt == null) {
        setTimeout(
          () => transactionReceiptAsync(resolve, reject),
          interval ? interval : 1000
        )
      } else {
        resolve(receipt)
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
      const fn = isCall
        ? instance[method].call(...Object.values(arguments), options)
        : await getTransactionReceiptMined(
          instance[method](...Object.values(arguments), options)
        )

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
