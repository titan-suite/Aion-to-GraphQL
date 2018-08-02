const genType = ({ typeName, typeBody }) => {
  return `
  type ${typeName} {
    ${typeBody}
  }`
}
const typesToSchemaLine = (data) => {
  return data.types
    .map((type) => `${type.name}: ${type.value}`)
    .reduce((out, cur, index) => {
      return index === 0 ? `${out} ${cur}` : `${out} \n     ${cur}`
    }, '')
}

const topString = `
  type Value {
    string: String
    int: Int
  }
  type Bytes {
    raw: String
    decoded: String
  }`

// Pupose of this method is to create the graphQL Schema
const genQueryTypeSchema = ({ queryConverter }) => {
  return queryConverter
    .filter((item) => item.outputs.length > 0)
    .map((item) => {
      const typeName = `${item.name}` // function name = type name
      const typeBody = typesToSchemaLine(item)
      return genType({ typeName, typeBody })
    })
    .reduce((output, current) => {
      return output + current
    }, topString)
}

module.exports = {
  genQueryTypeSchema
}
