'use strict';
/* global suite: false, setup: false, test: false,
    teardown: false, suiteSetup: false, suiteTeardown: false */
var ChangeLog = require('../');


suite('scopes', function() {

  var subjects = [
    '{"hash":"7b60e5714dc20403c8029505b45679cd66b426a4","time":1426157886,' +
        '"subject":"no doublequotes","author":' +
        '{"name":"John Doe","email":"john@doe"},"body":""}',
    '"no doublequotes"',
    '{"hash":"7b60e5714dc20403c8029505b45679cd66b426a4","time":1426157886,' +
        '"subject":""double"q""uote"s"","author":' +
        '{"name":"John Doe","email":"john@doe"},"body":""double"q""uote"s""}',
    '""double"q""uote"s""'
  ];

  var bodies = [
    '{"hash":"7b60e5714dc20403c8029505b45679cd66b426a4","time":1426157886,' +
        '"subject":"","author":' +
        '{"name":"John Doe","email":"john@doe"},"body":""}',
    '""',
    '{"hash":"7b60e5714dc20403c8029505b45679cd66b426a4","time":1426157886,' +
        '"subject":"","author":' +
        '{"name":"John Doe","email":"john@doe"},"body":""double"q""uote"s""}',
    '""double"q""uote"s""'
  ];

  test('subject regex', function() {
    var i, matches;
    var changelog = new ChangeLog();

    for (i = 0; i < subjects.length; i += 2) {
      matches = subjects[i].match(changelog._subjectRE);

      if (subjects[i + 1]) {
        if (!matches) {
          throw new Error('Subject "' + subjects[i] + '" should match');
        } else if (matches[3] !== subjects[i + 1]) {
          throw new Error('Subject "' + subjects[i] + '" returned "' + matches[3] + '" instead of "' + subjects[i + 1] + '"');
        }
      } else if (matches) {
        throw new Error('Subject "' + subjects[i] + '" should NOT match');
      }
    }
  });


  test('body regex', function() {
    var i, matches;
    var changelog = new ChangeLog();

    for (i = 0; i < bodies.length; i += 2) {
      matches = bodies[i].match(changelog._bodyRE);

      if (bodies[i + 1]) {
        if (!matches) {
          throw new Error('Subject "' + bodies[i] + '" should match');
        } else if (matches[2] !== bodies[i + 1]) {
          throw new Error('Subject "' + bodies[i] + '" returned "' + matches[2] + '" instead of "' + bodies[i + 1] + '"');
        }
      } else if (matches) {
        throw new Error('Subject "' + bodies[i] + '" should NOT match');
      }
    }
  });
});
