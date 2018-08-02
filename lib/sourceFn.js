// Purpose of this method is to call the AION node. It will then pass the results to the outputmapper fn.
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
    const sleep = async (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
    try {
      const instance = await contract
      const fn = isCall
        ? instance[method].call(...Object.values(arguments), options)
        : // : instance[method](...Object.values(arguments), options)
          await Promise.resolve(
            new Promise((resolve, reject) =>
              instance[method](
                ...Object.values(arguments),
                options,
                async (err, data) => {
                  if (err) return reject(err)
                  console.log('txHash:', data)
                  //since aion web3 is based on callbacks we manually have to wait for tx to get mined
                  await sleep(30e3)
                  return resolve(data)
                }
              )
            )
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
