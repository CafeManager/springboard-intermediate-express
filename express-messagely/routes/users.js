const express = require("express");
const router = new express.Router()
const db = require("../db")
const ExpressError = require("../expressError")
const Message = require("../models/message");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const JWT_OPTIONS = { expiresIn: 60 * 60 }; 

const SECRET_KEY = process.env.SECRET_KEY
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
    const id = req.params.id
    const users = await User.all()
    return res.json({users : users})

})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async (req, res, next) => {
    const username = req.params.username
    const users = await User.get(username)
    return res.json({users : users})

})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async (req, res, next) => {
    const username = req.params.username
    const messages = await User.messagesTo(username)
    return res.json({messages : messages})

})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', async (req, res, next) => {
    const username = req.params.username 
    const payload = jwt.verify(token, SECRET_KEY);
    const messages = await User.messagesFrom(username)
    return res.json({messages : messages})

})

module.exports = router