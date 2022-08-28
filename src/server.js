const express = require('express');
const { sendDigest } = require('./index');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const page = await sendDigest()
  res.send(page);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
