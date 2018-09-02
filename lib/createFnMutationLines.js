const { filterFn } = require('./utils')
const abiInputToGraphQLType = ({ name, type }) => {
  if (type.includes('int')) {
    return { key: name, value: 'Int' }
  } else if (type === 'bool') {
    return { key: name, value: 'Boolean' }
  } else if (type === 'string') {
    return { key: name, value: 'String' }
  } else if (type.includes('bytes')) {
    return { key: name, value: 'String' }
  } else if (type === 'address') {
    return { key: name, value: 'String' }
  }

  return new Error(`Unkown abi output type: ${type}`)
}

const genResult = (lines) => {
  let tmp =
    lines.length > 0
      ? `
type Mutation {
  ${lines}
}`
      : ''
  return tmp
}

const genMutationLines = ({ artifact: { abi } }) => {
  const queryOutput = abi
    .filter(filterFn)
    .filter((i) => i.outputs.length <= 0)
    .map((item) => {
      return { name: item.name, inputs: item.inputs }
    })
    .map((item) => {
      const allInputs = item.inputs.map((line) => {
        if (line.length === 0) {
          return ''
        }
        return abiInputToGraphQLType(line)
      })
      return {
        fnName: item.name,
        types: allInputs
      }
    })
    .reduce((total, item, index) => {
      const { fnName } = item
      const inputs = item.types.reduce((total, cur) => {
        return `${total} ${cur.key}: ${cur.value}`
      }, '')
      const line =
        inputs.length > 0
          ? `${fnName} (${inputs} ): Receipt`
          : `${fnName}: Receipt`

      return index === 0 ? `${total} ${line}` : `${total} \n   ${line}`
    }, '')

  return genResult(queryOutput)
}

module.exports = {
  genMutationLines
}
