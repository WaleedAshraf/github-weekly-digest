const cheerio = require('cheerio');
const style = require('./assets/style.json');

const transformPage = async ({ rawPage, repo }) => {
  const $ = cheerio.load(rawPage);
  $('head').replaceWith(
    $(`
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="utf-8" />`),
  );
  const layout = $('.Layout-main');
  $('body').children().replaceWith($('.Layout-main'));
  $('.Subhead-actions').remove();
  $('.Layout-main').addClass(
    'clearfix container-xl px-3 px-md-4 px-lg-5 mt-4',
  );
  $('html').attr('data-color-mode', 'light');
  $('.flex-items-center').remove();
  $('a').each(function () {
    const old = $(this).attr('href');
    $(this).attr('href', `https://github.com${old}`);
  });
  $('h2.Subhead-heading').prepend(
    $(`<b style="font-weight: bolder">${repo}</b>: `),
  );
  $('.octicon-git-merge').each(function () {
    $(this).replaceWith(
      $(
        '<img src="https://raw.githubusercontent.com/WaleedAshraf/github-weekly-digest/master/src/assets/pr_merged.png" width="16px" style="float:left; margin-top:4px">',
      ),
    );
  });
  $('.octicon-git-pull-request').each(function () {
    $(this).replaceWith(
      $(
        '<img src="https://raw.githubusercontent.com/WaleedAshraf/github-weekly-digest/master/src/assets/pr_opened.png" width="16px" style="float:left; margin-top:4px">',
      ),
    );
  });
  $('.octicon-issue-closed').each(function () {
    $(this).replaceWith(
      $(
        '<img src="https://raw.githubusercontent.com/WaleedAshraf/github-weekly-digest/master/src/assets/issue_closed.png" width="16px" style="float:left; margin-top:4px">',
      ),
    );
  });
  $('.octicon-issue-opened').each(function () {
    $(this).replaceWith(
      $(
        '<img src="https://raw.githubusercontent.com/WaleedAshraf/github-weekly-digest/master/src/assets/issue_opened.png" width="16px" style="float:left; margin-top:4px">',
      ),
    );
  });
  $('.octicon-tag').each(function () {
    $(this).replaceWith(
      $(
        '<img src="https://raw.githubusercontent.com/WaleedAshraf/github-weekly-digest/master/src/assets/tag.png" width="16px" style="float:left; margin-top:4px">',
      ),
    );
  });
  $('.octicon-comment-discussion').each(function () {
    $(this).replaceWith(
      $(
        '<img src="https://raw.githubusercontent.com/WaleedAshraf/github-weekly-digest/master/src/assets/conversation.png" width="16px" style="float:left; margin-top:4px">',
      ),
    );
  });
  Object.keys(style).forEach((k) => {
    $(k).each(function () {
      const old = $(this).attr('style');
      if (old) $(this).attr('style', `${old}; ${style[k]}`);
      else $(this).attr('style', `${style[k]}`);
    });
  });
  return $.html();
};

module.exports = {
  transformPage
}