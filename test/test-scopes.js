'use strict';
/* global suite: false, setup: false, test: false,
    teardown: false, suiteSetup: false, suiteTeardown: false */
var assert = require('assert');
var common = require('./common');
var ChangeLog = require('../');


suite('scopes', function() {

  test('regex', function() {
    var matches;
    var changelog = new ChangeLog();
    var i;
    var subjects = [
      'hello world:', false,
      'hello', false,
      'hello, world:', 'hello, world:',
      'hello, world: hello world', 'hello, world:',
      '/hello, world: abc', false,
      '.hello, world: abc', false,
      ',hello, world: abc', false,
      '_hello/world: abc', false,
      'abc.world: abc', 'abc.world:',
      'abc/world: abc', 'abc/world:',
      'abc-world: abc', 'abc-world:'
    ];

    for (i = 0; i < subjects.length; i += 2) {
      matches = subjects[i].match(changelog._scopeRE);

      if (subjects[i + 1]) {
        if (!matches) {
          throw new Error('Subject "' + subjects[i] + '" should match');
        } else if (matches[0] !== subjects[i + 1]) {
          throw new Error('Subject "' + subjects[i] + '" returned "' + matches[0] + '" instead of "' + subjects[i + 1] + '"');
        }
      } else if (matches) {
        throw new Error('Subject "' + subjects[i] + '" should NOT match');
      }
    }
  });
});
