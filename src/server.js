const express = require('express');
const wrap = require('async-middleware').wrap;
const app = express();
const bodyParser = require('body-parser');
const sqlite = require('sqlite');

// DB warming up code
let db = null;
const warmupDB = async dbName => {
  console.log(`Warming up database ${dbName}`);
  if (db !== null) return;
  db = await sqlite.open(dbName, { Promise });
  await db.run('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
  const userdatas = await db.all(`SELECT * FROM Users`);
  if (userdatas.length === 0) await db.run("INSERT INTO Users (username, password) VALUES ('admin', 'admin')");
};

// Configure routes
const router = express.Router();
router.post(
  // DB injection no escape on received POST arguments
  '/login',
  wrap(async (req, res) => {
    const params = req.body;
    console.log(`POST - /login - ${JSON.stringify({ username: params.username, password: params.password })}`);
    const userdata = await db.get(
      `SELECT * FROM Users WHERE username='${params.username}' AND password='${params.password}'`
    );
    res.json({ status: userdata ? 'success' : 'failure' });
  })
);
router.get(
  // DB injection no escape on urls params
  '/profile/:uid',
  wrap(async (req, res) => {
    const uid = req.params.uid;
    console.log(`GET  - /profile/${uid}`);
    const userdata = await db.get(`SELECT * FROM Users WHERE id=${uid}`);
    res.json({ query: { uid }, profile: userdata });
  })
);
router.post(
  // Much deaper payload
  '/comment',
  wrap(async (req, res) => {
    // payload:
    // {
    //   user: { login: 'toto' },
    //   comment: { message: 'lorem ipsum', postId: 5, commentId: 8, public: false, details: ["", 5] }
    // }
    const params = req.body;
    console.log(`POST - /comment - ${JSON.stringify({ ...params })}`);
    if (
      params.user == null ||
      params.user.login == null ||
      params.comment == null ||
      typeof params.comment.postId !== 'number'
    ) {
      res.json({ answer: 'bad request' });
      return;
    }
    if (typeof params.comment.commentId === 'string') throw new Error('Supposed it failed on this case');
    res.json({});
  })
);

// Lauching the server
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);
warmupDB('db.sqlite').then(() => {
  const port = process.env.PORT || 8080;
  app.listen(port);
  console.log(`Listening on port ${port}`);
});
