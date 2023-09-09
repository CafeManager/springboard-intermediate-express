/** User class for message.ly */

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

/** User of the site. */

/**    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
     */

class User {

  //do i need a constructor?

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const today = Date.now()
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
           VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($6 / 1000.0))
           `,
      [username, hashedPassword, first_name, last_name, phone, today]
    );
    return {username, password: hashedPassword, first_name, last_name, phone}
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    try{
    const result = await db.query(`SELECT password FROM users WHERE username = $1`, [username])
    const user = result.rows[0]
    const valid = bcrypt.compare(password, user.password)
    return valid
    } catch {
      return false
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const today = Date.now()
    const result = await db.query(`UPDATE users SET last_login_at = to_timestamp(${Date.now()} / 1000.0) WHERE username = $1`, [username])

  }
  

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone
       FROM users
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c =>( {
      username: c.username,
      first_name: c.firstName,
      last_name: c.lastName,
      phone: c.phone
    }));
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const results = await db.query(
      `SELECT *
       FROM users
      WHERE username = $1`, [username]
    );
    const user = results.rows[0]
    return {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      join_at: user.join_at,
      last_login_at: user.last_login_at
    }

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 


    const messageResults = await db.query(
      `SELECT id, to_username, body, sent_at, read_at
       FROM messages
      WHERE from_username = $1`, [username]
    );
    let messages = []


    for(let message of messageResults.rows){
      const userResults = await db.query(
        `SELECT *
         FROM users
        WHERE username = $1`, [message.to_username]
      );
      const user = userResults.rows[0]

      messages.push({
        id: message.id,
        to_user: {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      })
    }

    return messages


   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const messageResults = await db.query(
      `SELECT id, from_username, body, sent_at, read_at
       FROM messages
      WHERE to_username = $1`, [username]
    );
    let messages = []
    for(let message of messageResults.rows){
      const userResults = await db.query(
        `SELECT *
         FROM users
        WHERE username = $1`, [message.from_username]
      );
      const user = userResults.rows[0]

      messages.push({
        id: message.id,
        from_user: {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at
      })
    }
    
    return messages
   }
}


module.exports = User;