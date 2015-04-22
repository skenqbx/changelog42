#!/usr/bin/env node
'use strict';
var path = require('path');
var child_process = require('child_process');

var ChangeLog = require('../lib');


/**
 * ChangeLog Maker
 */
var i, t, options = {
  since: '--tags',
  group: true,
  author: true,
  link: true,
  merge: false,
  commitURL: '<commit-url>'
};


// parse arguments
for (i = 2; i < process.argv.length; ++i) {
  t = process.argv[i].split(/=/);

  switch (t[0]) {
    case '--help':
      console.log();
      console.log('ChangeLog42');
      console.log();
      console.log('Usage: changelog42 [--since={tag}] [--commit-url={url}] [options]');
      console.log();
      console.log('  When --since is not set the latest tag is selected');
      console.log();
      console.log('  options');
      console.log('   --no-group    do not group commits by scope');
      console.log('   --no-author   do not print author name');
      console.log('   --no-link     do not link commit hashes');
      console.log('   --merge       print merge commits');
      console.log('   --json        output JSON');
      console.log('   --commit-url  commit base url');
      console.log();

      return;
    case '--since':
      options.since = t[1] || options.since;
      break;
    case '--no-group':
      options.group = false;
      break;
    case '--no-author':
      options.author = false;
      break;
    case '--no-link':
      options.link = false;
      break;
    case '--merge':
      options.merge = true;
      break;
    case '--json':
      options.json = true;
      break;
    case '--commit-url':
      options.commitURL = t[1] || options.commitURL;
      break;
  }
}

var changelog = new ChangeLog(options);

changelog.getDate(changelog.since, function(err, date) {
  if (err) {
    return console.log(err.message);
  }

  changelog.getLog(date, function(err2, commits) {
    if (err2) {
      return console.log(err2.message);
    }
    var markdown = changelog.toMarkdown(commits);
    var joint = '\n  - ';

    console.log('\n### Commits');
    console.log(joint + markdown.join(joint) + '\n');
  });
});
