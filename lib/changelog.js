'use strict';
var path = require('path');
var child_process = require('child_process');



/**
 * @constructor
 */
function ChangeLog(opt_options) {
  opt_options = opt_options || {};

  this.cwd = path.resolve(process.cwd(), opt_options.cwd || '');

  this.since = opt_options.since || '--tags';

  this.commitURL = opt_options.commitURL || '<commit-url>';
  this.pullRequestURL = opt_options.pullRequestURL || '<pr-url>';

  this.group = opt_options.group || false;
  this.author = opt_options.author || false;
  this.link = opt_options.link || false;
  this.merge = opt_options.merge || false;

  this._scopeRE = /^([a-zA-Z0-9]+[a-zA-Z0-9\/\._-]*)(?:,\s[a-zA-Z0-9]+[a-zA-Z0-9\/\._-]*)*:/;
  this._format = '{"hash":"%H","subject":"%s","author":{"name":"%an","email":"%ae"},"body":"%b"}';
}
module.exports = ChangeLog;


ChangeLog.prototype.getDate = function(commitish, callback) {
  var cmd = 'git show -s --format=%ad `git rev-list --max-count=1 ' + commitish + '`';

  child_process.exec(cmd, {
    cwd: this.cwd
  }, function(err, stdout) {
    if (err) {
      return callback(err);
    }
    var date = stdout.trim();

    callback(null, date);
  });
};


ChangeLog.prototype.getLog = function(since, callback) {
  var self = this;
  var cmd = 'git log --format=\'' + this._format + '\'';

  if (since) {
    cmd += ' --since="' + since + '"';
  }

  child_process.exec(cmd, {
    cwd: this.cwd
  }, function(err, stdout) {
    if (err) {
      return callback(err);
    }

    var i, commit, subject, matches;
    var commits = [];
    var raw = stdout
        .substr(1)
        .trim()
        .replace(/\n/g, '\\n')
        .split('}\\n{');

    raw.pop(); // remove limiting commit AND closing curly

    for (i = 0; i < raw.length; ++i) {
      raw[i] = '{' + raw[i] + '}';

      commit = JSON.parse(raw[i]);
      subject = commit.subject;

      if (subject.toLowerCase().indexOf('working on') > -1 ||
          !self.merge && subject.substr(0, 5) === 'Merge') {
        continue;
      }

      // detect scopes
      matches = subject.match(self._scopeRE);

      if (matches) {
        commit.scope = subject.substr(0, matches[0].length - 1);
        commit.subject = subject.substr(matches[0].length).trim();
      }

      // detect semver tags
      if (commit.body && commit.body.indexOf('SEMVER-MAJOR') > -1) {
        commit.semver = 'SEMVER-MAJOR';

      } else if (commit.body && commit.body.indexOf('SEMVER-MINOR') > -1) {
        commit.semver = 'SEMVER-MINOR';
      }

      commits.push(commit);
    }

    callback(null, commits);
  });
};


ChangeLog.prototype.toMarkdown = function(commits) {
  var i, commit, md;
  var markdown = [];

  if (this.group) {
    commits.sort(function(a, b) {
      if (a.scope > b.scope) {
        return 1;
      } else if (a.scope < b.scope) {
        return -1;
      }
      return 0;
    });
  }

  for (i = 0; i < commits.length; ++i) {
    commit = commits[i];

    if (this.link) {
      md = '[[`' + commit.hash.substr(0, 10) + '`](' +
          this.commitURL + '/' + commit.hash + ')] - ';
    } else {
      md = '[`' + commit.hash.substr(0, 10) + '`] - ';
    }

    if (commit.scope || commit.semver) {
      md += '**';

      if (commit.semver) {
        md += '(' + commit.semver + ')';

        if (commit.scope) {
          md += ' ';
        }
      }
      if (commit.scope) {
        md += commit.scope;
      }

      md += '**';

      if (commit.scope) {
        md += ': ';
      }
    }

    md += commit.subject
        .replace(/([\[\]])/g, '\\$1');

    if (this.author) {
      md += ' (' + commit.author.name + ')';
    }

    markdown.push(md);
  }

  return markdown;
};
