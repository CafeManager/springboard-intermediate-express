const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Book = require("../models/book");


beforeAll(async () => {
    await db.query(`DELETE FROM Books`);
    await Book.create({"isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017})
})

beforeEach(async () => {
    await db.query("BEGIN");
})

afterEach(async () => {
    await db.query("ROLLBACK");
})

afterAll(async () => {
    await db.end();
})


describe("/books", function () {
  test("GET /books", async function () {
    const resp = await request(app)
        .get("/books")
    
    expect(resp.body).toEqual({
      "books": [{
        "amazon_url": "http://a.co/eobPtX2",
           "author": "Matthew Lane",
           "isbn": "0691161518",
           "language": "english",
           "pages": 264,
           "publisher": "Princeton University Press",
           "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
           "year": 2017
      }],
    });
  });

  test("POST /books", async function () {
    const resp = await request(app)
        .post("/books")
        .send({
            "isbn": "0691161519",
            "amazon_url": "http://a.co/eobPtX3",
            "author": "Matthew Lane2",
            "language": "english2",
            "pages": 264,
            "publisher": "PrincetonA University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
    })
    
    expect(resp.body).toEqual({
      "book": {
        "isbn": "0691161519",
            "amazon_url": "http://a.co/eobPtX3",
            "author": "Matthew Lane2",
            "language": "english2",
            "pages": 264,
            "publisher": "PrincetonA University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
      },
    });
  });

  test("PUT /books", async function () {
    const resp = await request(app)
        .put("/books/0691161518")
        .send({
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX3",
                "author": "Matthew Lane2",
                "language": "english2",
                "pages": 264,
                "publisher": "PrincetonA University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
              })
    
    expect(resp.body).toEqual({
      "book": {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX3",
            "author": "Matthew Lane2",
            "language": "english2",
            "pages": 264,
            "publisher": "PrincetonA University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
      },
    });
  });

  test("PUT /books", async function () {
    const resp = await request(app)
        .delete("/books/0691161518")
        expect(resp.body).toEqual({
          "message": "Book deleted",
        });
        const q = await db.query("SELECT COUNT(*) FROM books")
        expect(Number(q.rows[0].count)).toEqual(0)
      })       

    
    
        

});
