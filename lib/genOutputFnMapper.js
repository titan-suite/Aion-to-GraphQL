const Web3 = require('aion-web3')
const web3 = new Web3()

const parseValueResult = (data) => {
  return {
    string: data.toString(),
    int: data.toNumber()
  }
}

const parseBytesResult = (data) => {
  return {
    raw: data,
    decoded: web3.toAscii(data).replace(/\0/g, '')
  }
}

const zipOutputWithResults = (
  resultsIsArr,
  outputTypesDefIsArray,
  result,
  outputTypesDef
) => {
  return outputTypesDef.map((item, index) => {
    if (!resultsIsArr || !outputTypesDefIsArray) {
      item.result = result
    } else if (resultsIsArr && outputTypesDefIsArray) {
      if (outputTypesDef.length === result.length) {
        item.result = result[index]
      } else {
        item.result = result
      }
    } else {
      item.result = result[index]
    }
    return item
  })
}

function safelyParseResult(result, isOutputArray) {
  try {
    // Big number
    if (typeof result.toNumber() === 'number') {
      return isOutputArray
        ? [parseValueResult(result)]
        : parseValueResult(result)
    }
  } catch (e) {}
  return result.map((item) => {
    return parseValueResult(item)
  })
}

const genOutputFuncitonMapper = (outputTypesDef) => {
  return (result) => {
    const resultsIsArr = Array.isArray(result)
    const outputTypesDefIsArray = Array.isArray(outputTypesDef)
    const combined = zipOutputWithResults(
      resultsIsArr,
      outputTypesDefIsArray,
      result,
      outputTypesDef
    )

    let op2 = combined.reduce((out, current) => {
      let { key, name, result, isArray, isMutation } = current
      if (isMutation === true) {
        return result
      }
      if (key === 'value') {
        // Big number or Array
        if (Array.isArray(result) || typeof result.toNumber() === 'number') {
          out[name] = safelyParseResult(result, isArray)
        } else {
          out[name] = parseValueResult(result)
        }
      } else if (key === 'bytes') {
        if (Array.isArray(result)) {
          out[name] = result.map((item) => {
            return parseBytesResult(item)
          })
        } else {
          if (isArray) {
            out[name] = [parseBytesResult(result)]
          } else {
            out[name] = parseBytesResult(result)
          }
        }
      } else {
        out[name] = result
      }
      return out
    }, {})

    return op2
  }
}

// Pupose of this method is to create the function that will receive data from Ethereum and return to graphQL for further processing
const genOutputFnMapper = ({ queryConverter }) => {
  return queryConverter
    .map((item) => {
      return {
        fnName: item.name,
        outputMapper: genOutputFuncitonMapper(item.types)
      }
    })
    .reduce((out, cur) => {
      out[cur.fnName] = cur.outputMapper
      return out
    }, {})
}

module.exports = {
  genOutputFnMapper
}
