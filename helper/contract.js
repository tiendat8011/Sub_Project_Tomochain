const Web3 = require('web3')

const web3 = new Web3('http://localhost:7545')

const contractABI = require('../constants/TokenV2ABI.json')
const { isValidPassword } = require('./wallet')

const contractAddress = process.env.CONTRACT_ADDRESS

const contractOwner = process.env.CONTRACT_OWNER

const getBalanceOfAddress = async address => {
  const Token = await new web3.eth.Contract(contractABI, contractAddress);
  try {
    const b = await Token.methods.balanceOf(address).call()
  } catch (error) {
    console.log(error)
  }
  // const b = await Token.methods.balanceOf(address).call()
  // console.log(b);

  return await Token.methods.balanceOf(address).call()
}

// const getTotalTokenSupply = async () => {
//   const Token = await new web3.eth.Contract(contractABI, contractAddress)

//   return await Token.methods.totalSupply().call()
// }

const transferToken = async (sender, senderPassword, receiver, amount) => {
  const isOwner = await isValidPassword(sender, senderPassword)
  console.log(isOwner);

  console.log({ sender, senderPassword, receiver, amount })

  if (!isOwner) {
    throw new Error('TRANFER_TOKEN.INVALID_SENDER')
  }

  const Token = await new web3.eth.Contract(contractABI, contractAddress)

  return await Token.methods.transfer(receiver, amount).send({ from: sender })
}

const mintToken = async (receiver, amount) => {
  const Token = await new web3.eth.Contract(contractABI, contractAddress)

  try {
    const c = await Token.methods
    .mint(receiver, amount)
    .send({ from: contractOwner })
  } catch (error) {
    console.log(error)
  }
  return await Token.methods
    .mint(receiver, amount)
    .send({ from: contractOwner })
}

const burnToken = async amount => {
  const Token = await new web3.eth.Contract(contractABI, contractAddress)

  return await Token.methods.burn(amount).send({ from: contractOwner })
}

module.exports = {
  getBalanceOfAddress,
  // getTotalTokenSupply,
  transferToken,
  mintToken,
  // burnToken
}
