require('dotenv').config();
const axios = require('axios').default;
const { readFile } = require('node:fs/promises');
const { parse } = require('csv-parse/sync');
const Mailjet = require('node-mailjet');
const { transformPage } = require('./transformPage')

const mailjet = Mailjet.apiConnect(
  process.env.MJ_API_KEY,
  process.env.MJ_API_SECRET,
);

const fetchRepo = async ({ user, repo }) => {
  const { data: rawPage } = await axios.get(
    `https://github.com/${user}/${repo}/pulse`,
  );
  return rawPage;
};

const sendEmail = ({ toEmail, body, user }) => {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'no_reply@waleedashraf.me',
          Name: 'GitHub Weekly Digest',
        },
        To: [{ Email: toEmail }],
        Subject: `GitHub Weekly Digest - ${user}`,
        HTMLPart: body,
      },
    ],
  });

  request
    .then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.log(err.statusCode);
    });
};

const sendDigest = async () => {
  const content = await readFile(`./subscribers.csv`);
  const records = parse(content, {
    from: 2,
    relax_column_count: true
  });
  let response = ""
  for (const record of records) {
    const toEmail = record[0]
    const user = record[1]
    let body = ""
    for(let i=2; i < record.length; i++) {
      const repo = record[i]
      const rawPage = await fetchRepo({ user, repo });
      body += await transformPage({ rawPage, repo });
    }
    await sendEmail({ toEmail, body, user });
    response += body;
  }
  return response;
};

sendDigest()

module.exports = {
  sendDigest,
};
