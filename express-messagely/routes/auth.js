const express = require("express");
const router = new express.Router()
const db = require("../db")
const ExpressError = require("../expressError")
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ensureLoggedIn } = require("../middleware/auth");
const JWT_OPTIONS = { expiresIn: 60 * 60 };
const SECRET_KEY = process.env.SECRET_KEY 

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
  try{
    const username = req.body.username
    const password = req.body.password
    const valid = await User.authenticate(username, password)
    let token
    
      if (valid) {
        token = jwt.sign({ username, iat: Date.now() }, SECRET_KEY);
        User.updateLoginTimestamp(username)
        
      } else {
        const err = new ExpressError("Not Authorized", 401);
        return next(err);
      }
      return res.json({ token })
    
} catch (err) {
  return next(err)
}
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
  try{
    const { username, password, first_name, last_name, phone } = req.body
    const user = await User.register( req.body )
    await User.updateLoginTimestamp(username)
    let token = jwt.sign({ username, iat: Date.now() }, SECRET_KEY);


    return res.json({ token });
  } catch (err) {
    return next(err)
  }
})

module.exports = router