const express = require("express");
const router = new express.Router()
const db = require("../db")
const ExpressError = require("../expressError")
const Message = require("../models/message");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { ensureLoggedIn } = require("../middleware/auth");
const JWT_OPTIONS = { expiresIn: 60 * 60 }; 



/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    const id = req.params.id
    const username = jwt.verify(token, SECRET_KEY);
    const message = Message.get(id)
    if(message.from_user.username != username || message.from_user.username != username){
        throw Error
    }   
    return res.json({message: message})

})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', async (req, res, next) => {
    const from_username = jwt.decode(req.body.token);
    const to_username = req.body.to_username
    const body = req.body.body
    
    const message = Message.create({from_username, to_username, body})

   return {message: message}

})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    const id = req.params.id

    const message = Message.markRead(id)
    
    return {message: message}


})


module.exports = router