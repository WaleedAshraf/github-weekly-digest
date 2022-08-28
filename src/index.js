require('dotenv').config();
const axios = require('axios').default;
const { readFile } = require('node:fs/promises');
const { parse } = require('csv-parse/sync');
const Mailjet = require('node-mailjet');
const cheerio = require('cheerio');
const style = require('./assets/style.json')

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

const transformPage = async ({ rawPage, repo }) => {
  const $ = cheerio.load(rawPage);
  $('head').replaceWith($(`
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="utf-8" />`))
  const layout = $('.Layout-main')
  $('body').children().replaceWith($('.Layout-main'))
  $('.Subhead-actions').remove();
  $('.Layout-main').addClass('clearfix container-xl px-3 px-md-4 px-lg-5 mt-4');
  $('html').attr('data-color-mode', 'light');
  $('.flex-items-center').remove();
  $('a').each(function () {
    const old = $(this).attr('href');
    $(this).attr('href', `https://github.com${old}`);
  });
  $('h2.Subhead-heading').prepend($(`<b style="font-weight: bolder">${repo}</b>: `));
  Object.keys(style).forEach((k) => {
    $(k).each(function() {
      const old = $(this).attr('style');
      if (old) $(this).attr('style', `${old}; ${style[k]}`);
      else $(this).attr('style', `${style[k]}`);
    })
  })
  $('.octicon-git-merge').replaceWith($('<img src="" width="16px">'))
  $('.octicon-git-pull-request').replaceWith($('<img src="" width="16px">'))
  $('.octicon-issue-closed').replaceWith($('<img src="" width="16px">'))
  $('.octicon-issue-opened').replaceWith($('<img src="" width="16px">'))
  $('.octicon-tag').replaceWith($('<img src="" width="16px">'))
  $('.octicon-comment-discussion').replaceWith($('<img src="" width="16px">'))
  return $.html()
};

const sendEmail = ({ toEmail, body }) => {
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'no_reply@waleedashraf.me',
          Name: 'GitHub Weekly Digest',
        },
        To: [{ Email: toEmail }],
        Subject: 'GitHub Weekly Digest',
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
  const records = parse(content);
  const toEmail = records[0][0];
  const user = records[0][1];
  const repo = records[0][2];
  const rawPage = await fetchRepo({ user, repo });
  const body = await transformPage({ rawPage, repo });
  console.log('body')
  console.log(body)
  await sendEmail({ toEmail, body });
  return body;
};

module.exports = {
  sendDigest,
};
