#!/usr/bin/env node
'use strict';
var path = require('path');
var child_process = require('child_process');
var pkg = require(path.resolve(__dirname, '../package.json'));

/**
 * ChangeLog Maker
 */
var i, t, options = {
  since: '--tags',
  group: true,
  author: true,
  link: true,
  merge: false,
  json: false,
  commitURL: '<commit-url>'
};


// parse arguments
for (i = 2; i < process.argv.length; ++i) {
  t = process.argv[i].split(/=/);

  switch (t[0]) {
    case '--help':
      console.log();
      console.log('ChangeLog42 v' + pkg.version);
      console.log();
      console.log('Usage: changelog.js [--since={tag}] [--commits={url}] [options]');
      console.log();
      console.log('  When --since is not set the lastest tag is selected');
      console.log();
      console.log('  options');
      console.log('   --no-group    do not group commits by prefix');
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


var format = '{"hash":"%H","subject":"%s","author":{"name":"%an","email":"%ae"},"body":"%b"}';
var cmd = 'git log --format=\'' + format + '\'';

// THE prefix RegExp
var re = /^[a-zA-Z0-9\/._-]+:/g;

var sincecmd = 'git show -s --format=%ad `git rev-list --max-count=1 ' + options.since + '`';
var groups = {};


child_process.exec(sincecmd, function(err, stdout) {
  if (err) {
    return console.log('ERROR', err.message);
  }
  var since = stdout.trim();

  cmd += ' --since="' + since + '"';

  child_process.exec(cmd, function(err2, stdout2) {
    if (err2) {
      return console.log('ERROR', err2.message);
    }

    var commits = stdout2
        .substr(1)
        .trim()
        .replace(/\n/g, '\\n')
        .split('}\\n{');

    commits.pop(); // remove limiting commit AND closing curly

    var j, k, commit, matches, subject, output;

    for (j = 0; j < commits.length; ++j) {
      commits[j] = '{' + commits[j] + '}';
      commit = commits[j] = JSON.parse(commits[j]);
      subject = commit.subject;

      if (subject.toLowerCase().indexOf('working on') > -1 ||
          !options.merge && subject.substr(0, 5) === 'Merge') {
        commits.splice(j, 1);
        --j;
        continue;
      }

      // detect group prefixes
      matches = subject.match(re);
      if (matches) {
        commit.markdown = '**' + subject.substr(0, matches[0].length - 1) + '**:' +
            subject.substr(matches[0].length);
      } else {
        commit.markdown = subject;
      }

      // detect senver tags
      if (commit.body && commit.body.indexOf('SEMVER-MAJOR') > -1) {
        commit.major = true;
        commit.markdown = '**(SEMVER-MAJOR) **' + commit.markdown;
        commit.markdown = commit.markdown.replace(/\*\*\*\*/, '');

      } else if (commit.body && commit.body.indexOf('SEMVER-MINOR') > -1) {
        commit.minor = true;
        commit.markdown = '**(SEMVER-MINOR) **' + commit.markdown;
        commit.markdown = commit.markdown.replace(/\*\*\*\*/, '');
      }

      if (options.link) {
        commit.markdown = ' - [[`' + commit.hash.substr(0, 10) + '`](' +
            options.commitURL + '/' + commit.hash + ')] - ' + commit.markdown;
      } else {
        commit.markdown = ' - [`' + commit.hash.substr(0, 10) + '`] - ' +
            commit.markdown;
      }

      if (options.author) {
        commit.markdown += ' (' + commit.author.name + ')';
      }

      if (matches && options.group) {
        groups[matches[0]] = groups[matches[0]] || [];
        groups[matches[0]].push(commit);
      } else {
        groups.___ = groups.___ || [];
        groups.___.push(commit);
      }
    }

    output = [];

    var keys = Object.keys(groups).sort();

    for (j = 0; j < keys.length; ++j) {
      for (k = 0; k < groups[keys[j]].length; ++k) {
        if (options.json) {
          output.push(groups[keys[j]][k]);
        } else {
          console.log(groups[keys[j]][k].markdown);
        }
      }
    }

    if (options.json) {
      console.log(JSON.stringify(output, null, 2));
      // console.log(JSON.stringify(output));
      return;
    }
  });
});
