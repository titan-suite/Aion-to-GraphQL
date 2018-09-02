# ABI to GraphQL Schema

This will consume an ABI object created when deploying a Solidity Smart contract, and return a graphql schema and resolver. This object can be plugged into a the graphql server of your choice.

# Usage:

Install the package with npm or yarn.

```sh
    // with yarn (recommended)
    yarn add @titan-suite/aion-to-graphql

    // with npm
    npm install @titan-suite/aion-to-graphql
```

1.  Once installed,You will also have to specify global.mainAccount and global.gas to withdraw gas from.

2.  You can now create your own graphql server. This means you pass in the Abi , contract instance, Main Account, Gas.
    Example:
    `{ artifact: abi, contract: web3.eth.contract(abi).at(address), mainAccount: web3.personal.listAccounts[0], gas:1500000 }`

## Example Usage

Checkout the examples in file `aion-server.js` , `test/aion.test.js`.

Please note that these examples requires creating a config.js in the root directory with format as follows:

`const web3Address = 'REMOTE_NODE_ADDRESS'`
`const mainAccountPass = 'MAIN_ACCOUNT_PASSWORD'`
`module.exports = { web3Address, mainAccountPass }`

## To Learn More

Checkout [Titan IDE](https://github.com/titan-suite/ide#interacting-with-functions)

### This package will return the schema and rootValue that you can pass into your GraphQL server.

## Base Types

We have two base types that help us convert some AION int/uint and Bytes into graphQL schema types. The first is for ints/uints. Whenever a function returns these types, you will have the option of returning either the string and/or int type.

```javascript
    type Value {
    string: String
    int: Int
    }
```

The second base type are the bytes types.

```javascript
    type Bytes {
    raw: String
    decoded: String
    }
```

When a function returns a bytes, you can choose to return the raw data or the decoded data if desired.

## Return Type Templates

Because we are auto generating the Schema, we have to define some standard conversions. We have two templates for accessing the return values from solidity:

1. Single: `${typeName}_${IndexOfReturn}`
2. Arrays: `${typeName}Arr_${IndexOfReturn}`

If you return an address as the third return value you would use: `address_2`. If you return a uint in the fourth value you would use `uint256_3`. If you return an array of bytes as the first return you would use `bytes32Arr_0`.

## Writing Queries

To write a query, you must use the function name as the base, pass any variables if any, and then the type name with an index (`${typeName}_${IndexOfOutput}`)

## Writing Mutations

To write a mutation, you must use the function name as the base, pass any variables if any. After a Mutation succeeds you will have access to transaction receipt object with keys such `blockNumber`, `blockHash`

**Inspired By** [Ethereum-to-GraphQL](https://github.com/hellosugoi/Ethereum-to-GraphQL/).
