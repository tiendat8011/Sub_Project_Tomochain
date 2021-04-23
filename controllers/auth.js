const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createJWT, } = require("../utils/auth");

const Web3 = require('web3');
const web3 = new Web3('http://localhost:7545');

const { createWalletV2, } = require('../helper/wallet');
const { getBalanceOfAddress, transferToken, mintToken } = require('../helper/contract')

require('dotenv').config()


const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// singup API
exports.signup = (req, res, next) => {
    // require name, email, password, password_confimation in the request body
    let { name, email, password, password_confirmation } = req.body;
    let errors = [];

    if (!name) {
        errors.push({ name: "required" });
    }
    if (!email) {
        errors.push({ email: "required" });
    }
    if (!emailRegexp.test(email)) {
        errors.push({ email: "invalid" });
    }
    if (!password) {
        errors.push({ password: "required" });
    }
    if (!password_confirmation) {
        errors.push({
            password_confirmation: "required",
        });
    }
    if (password != password_confirmation) {
        errors.push({ password: "mismatch" });
    }
    if (errors.length > 0) {
        return res.status(422).json({ errors: errors });
    }

    try {
        User.findOne({ email: email })
            .then(async user => {
                if (user) {
                    return res.status(422).json({ errors: [{ user: "email already exists" }] });
                } else {
                    console.log('1')

                    const newPrivateAccount = await createWalletV2(password);
                    console.log(newPrivateAccount);
                   const minToken1 = await mintToken(newPrivateAccount, 50);
                    console.log('6');
    

                    const user = new User({
                        name: name,
                        email: email,
                        password: password,
                        address: newPrivateAccount,
                    });
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            if (err) throw err;
                            user.password = hash;
                            user.save()
                                .then(response => {
                                    res.status(200).json({
                                        success: true,
                                        result: response
                                    })
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        errors: [{ error: err }]
                                    });
                                });
                        });
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    errors: [{ error: err }]
                });
            })

    } catch (error) {
        console.log('===', error)
    }
}

// signin API
exports.signin = (req, res) => {
    let { email, password, } = req.body;
    let errors = [];
    if (!email) {
        errors.push({ email: "required" });
    }
    if (!emailRegexp.test(email)) {
        errors.push({ email: "invalid email" });
    }
    if (!password) {
        errors.push({ passowrd: "required" });
    }
    if (errors.length > 0) {
        return res.status(422).json({ errors: errors });
    }

    // try {
    //     const existingUser = await User.findOne({ email })

    //     if (!existingUser) {
    //         throw new Error('AUTH.USER_NOT_EXIST')
    //     }

    //     const isMatchingPasword = await bcrypt.compare(password, existingUser.passowrd)

    //     if (!isMatchingPasword) {
    //         throw new Error('AUTH.INVALID')
    //     }
    // } catch (error) {
    //     console.log(error)

    //     return res.status(400)
    // }

    try {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                return res.status(404).json({
                    errors: [{ user: "not found" }],
                });
            } else {
                bcrypt.compare(password, user.password)
                    .then(async isMatch => {
                        if (!isMatch) {
                            return res.status(400).json({
                                errors: [{ password: "incorrect" }]
                            });
                        }
                        let access_token = await createJWT(
                            user.email,
                            user._id,
                            3600
                        );
                        jwt.verify(access_token, process.env.TOKEN_SECRET, (err, decoded) => {
                            if (err) {
                                res.status(500).json({ erros: err });
                            }
                            if (decoded) {
                                return res.status(200).json({
                                    success: true,
                                    token: access_token,
                                    message: {
                                        _id: user._id,
                                        name: user.name,
                                        email: user.email,
                                        password: user.password,
                                        address: user.address,
                                    },
                                });
                            }
                        });
                    }).catch(err => {
                        res.status(500).json({ erros: err });
                    });
            }
        }).catch(err => {
            res.status(500).json({ erros: err });
        });
    } catch (error) {
        console.log('===', error)
    }
}

exports.tradeToken = async (req, res) => {
    try {
        const { senderAddress, password: senderPassword, address: receiverAddress, amount } = req.body

        const vAmount = parseInt(amount, 10)

        const response = await transferToken(senderAddress, senderPassword, receiverAddress, amount)
        res.json({
            transactionHash: response.transactionHash,
            status: response.status
        })
    } catch (error) {
        res.status(400)
    }
}

exports.mintToken = async (req, res) => {
    try {
        const { address } = req.body

        const response = await mintToken(address, 100)

        const { transactionHash, status } = response

        res.json({ transactionHash, status })
    } catch (error) {
        res.status(400)
    }
}

exports.getBalance = async (req, res) => {
    try {
        const { address } = req.body
        console.log(req.body);

        const balance = await getBalanceOfAddress(address);
        res.json(balance)
    } catch (error) {
        res.status(400)
    }
}