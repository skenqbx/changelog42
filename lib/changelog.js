'use strict';
var path = require('path');
var child_process = require('child_process');



/**
 * @constructor
 * @param {object} opt_options options
 */
function ChangeLog(opt_options) {
  opt_options = opt_options || {};

  this.cwd = path.resolve(process.cwd(), opt_options.cwd || '');

  this.since = opt_options.since || '--tags';

  this.commitURL = opt_options.commitURL || '<commit-url>';
  this.pullRequestURL = opt_options.pullRequestURL || '<pr-url>';

  this.group = opt_options.group || false;
  this.body = opt_options.body || false;
  this.author = opt_options.author || false;
  this.link = opt_options.link || false;
  this.merge = opt_options.merge || false;

  this._subjectRE = /(subject":)((".*"),"author")/;
  this._bodyRE = /("body":)(".*")\}/;
  this._scopeRE = /^([a-zA-Z0-9\.]+[a-zA-Z0-9\/\._-]*)(?:,\s*[a-zA-Z0-9]+[a-zA-Z0-9\/\._-]*)*:/;
  this._format = '{"hash":"%H","time":%at,"subject":"%s","author":{"name":"%an","email":"%ae"},"body":"%b"}';
}
module.exports = ChangeLog;


ChangeLog.prototype.checkForTags = function(callback) {
  var cmdGitDescribe = 'git describe';
  var self = this;
  child_process.exec(cmdGitDescribe, {
    cwd: self.cwd
  }, function(error, stdout) {
    if (error) {
      return callback(error);
    } else {
      console.log(stdout);
    }
  });
};

ChangeLog.prototype.getDate = function(commitish, callback) {
  var self = this;
  var cmdGitRevList = 'git rev-list --max-count=1 ' + commitish + '';

  self.checkForTags(function(error) {
    if (error != null && commitish === '--tags') {
      cmdGitRevList = 'git rev-list --max-parents=0 HEAD';
    } else if (error != null && commitish !== '--tags') {
      return callback(error);
    }
    child_process.exec(cmdGitRevList, {
      cwd: self.cwd
    }, function(err1, revList) {
      if (err1) {
        return callback(err1);
      }

      var cmd = 'git show -s --format=%ad ' + revList;
      child_process.exec(cmd, {
        cwd: self.cwd
      }, function(err2, stdout) {
        if (err2) {
          return callback(err2);
        }
        var date = stdout.trim();

        callback(null, date);
      });
    });
  });

};


ChangeLog.prototype.getLog = function(since, callback) {
  var self = this;
  var subst_, cmd = 'git log --format="' + this._format.replace(/"/g, '\\"') + '"';

  if (since) {
    cmd += ' --since="' + since + '"';
  }

  child_process.exec(cmd, {
    cwd: this.cwd
  }, function(err1, stdout) {
    if (err1) {
      return callback(err1);
    }
    var i, commit, subject, matches;
    var commits = [];
    var raw = stdout
        .substr(1)
        .trim()
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .split('}\\n{');

    raw.pop(); // remove limiting commit AND closing curly

    for (i = 0; i < raw.length; ++i) {
      raw[i] = '{' + raw[i] + '}';
      matches = raw[i].match(self._subjectRE);

      if (matches) {
        subst_ = matches[2].substr(1, matches[2].length - 11); // cut off ',"author"'
        subst_ = subst_.replace(/"/g, '\\"');
        subst_ = '"' + subst_ + '"';

        raw[i] = raw[i].replace('subject":' + matches[3], 'subject":' + subst_);
      }

      matches = raw[i].match(self._bodyRE);

      if (matches) {
        subst_ = matches[2].substr(1, matches[2].length - 2); // cut off '"'
        subst_ = subst_.replace(/"/g, '\\"');
        subst_ = '"' + subst_ + '"';

        raw[i] = raw[i].replace('body":' + matches[2], 'body":' + subst_);
      }

      try {
        commit = JSON.parse(raw[i]);
      } catch (err2) {
        // TODO: propagate error
        continue;
      }

      subject = commit.subject;

      if (subject.toLowerCase().indexOf('working on') === 0 ||
          !self.merge && subject.substr(0, 5) === 'Merge') {
        continue;
      }

      // detect scopes
      matches = subject.match(self._scopeRE);

      if (matches) {
        commit.scope = subject.substr(0, matches[0].length - 1);
        commit.scope = commit.scope.replace(', ', ',');

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


ChangeLog.prototype._sortByScope = function(a, b) {
  if (a.scope > b.scope) {
    return 1;
  } else if (a.scope < b.scope) {
    return -1;
  } else {
    if (a.time > b.time) {
      return -1;
    } else {
      return 1;
    }
  }
};


ChangeLog.prototype.toMarkdown = function(commits) {
  var i, commit, md;
  var markdown = [];

  if (this.group) {
    commits.sort(this._sortByScope);
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

    if (this.body && commit.body) {
      md += '\n\n  ';
      md += commit.body.replace(/\n/g, ' ').replace(/  /g, ' ').trim();
      md += '\n';
    }

    markdown.push(md);
  }

  return markdown;
};
