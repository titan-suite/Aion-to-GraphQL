const { buildSchema } = require('graphql')
const { genQueryConverter } = require('./genQueryConverter')
const { genQueryTypeSchema } = require('./genQueryTypeSchema')
const { genOutputFnMapper } = require('./genOutputFnMapper')
const { genResolvers } = require('./genResolvers')
const { genQueryLines } = require('./createFnQueryLines')
const { genMutationLines } = require('./createFnMutationLines')

const genGraphQlProperties = ({ artifact, contract }) => {
  const events = artifact.abi
    .filter((i) => i.type === 'event')
    .map((e) => e.name)
  artifact = {
    abi: artifact.abi.filter(
      (i) => i.type !== 'constructor' && i.type !== 'event'
    )
  } //filter out type constructor && event
  const queryConverter = genQueryConverter({ artifact })
  const queryTypes = genQueryTypeSchema({ queryConverter })
  const outputHandlers = genOutputFnMapper({ queryConverter })
  const allResolvers = genResolvers({ outputHandlers, artifact, contract })
  const createFnQueryLines = genQueryLines({ artifact })
  const createFnMutationLines = genMutationLines({ artifact })
  const baseScheme = `
    ${queryTypes}
    ${createFnQueryLines}
    ${createFnMutationLines}
  `
  return {
    schema: buildSchema(baseScheme),
    baseScheme,
    rootValue: allResolvers,
    events
  }
}

module.exports = {
  genGraphQlProperties
}
