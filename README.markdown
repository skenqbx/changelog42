# ChangeLog42

**_A changelog creator for git repositories_**

```js
Stability: 2 - Unstable
```

## Table of Contents

  - [Usage](#usage)
  - [Examples](#examples)
  - [Commit Messages](#commit-messages)
  - [API](#api)
  - [Tests](#tests)
  - [ChangeLog](./CHANGELOG.markdown)
  - [License](./LICENSE)

## Installation

```
$ npm install changelog42 -g
```

## Usage

```
$ changelog42 --help

ChangeLog42

Usage: changelog42 [--since={tag}] [--commit-url={url}] [options]

  When --since is not set the latest tag is selected

  options
   --no-group    do not group commits by scope
   --no-author   do not print author name
   --no-link     do not link commit hashes
   --body        print full commit message
   --merge       print merge commits
   --json        output JSON
   --commit-url  commit base url
```

## Examples

```
$ changelog42 --no-author \
    --since=4aedc1b782224475562d5fdfb9f89ea7d007fb5e

### Commits

  - [[`ec5e5e9547`](<commit-url>/ec5e5e9547f8ba0f55c4f5b2addb3da944678440)] - **(SEMVER-MAJOR) bin**: add --commit-url argument
  - [[`991070866a`](<commit-url>/991070866acf913b10ea6462c31f5a4d62556061)] - **deps**: next-update 0.7.4 -> 0.7.6
  - [[`2e5547d18b`](<commit-url>/2e5547d18b7a552475ef212dcad6b5cf4c6f1561)] - **deps**: eslint 0.18.0 -> 0.19.0
  - [[`46330f2de2`](<commit-url>/46330f2de22ebcc90a04fc48f964e86cf6d2ca9a)] - **(SEMVER-MINOR) prefix**: added '/' as allowed character
```

**with --no-link**

```
$ changelog42 --no-author --no-link \
    --since=4aedc1b782224475562d5fdfb9f89ea7d007fb5e

### Commits

  - [`ec5e5e9547`] - **(SEMVER-MAJOR) bin**: add --commit-url argument
  - [`991070866a`] - **deps**: next-update 0.7.4 -> 0.7.6
  - [`2e5547d18b`] - **deps**: eslint 0.18.0 -> 0.19.0
  - [`46330f2de2`] - **(SEMVER-MINOR) prefix**: added '/' as allowed character
```

**with --commit-url**

```
$ changelog42 --no-author \
    --since=4aedc1b782224475562d5fdfb9f89ea7d007fb5e \
    --commit-url=https://github.com/skenqbx/changelog42/commit

### Commits

  - [[`ec5e5e9547`](https://github.com/skenqbx/changelog42/commit/ec5e5e9547f8ba0f55c4f5b2addb3da944678440)] - **(SEMVER-MAJOR) bin**: add --commit-url argument
  - [[`991070866a`](https://github.com/skenqbx/changelog42/commit/991070866acf913b10ea6462c31f5a4d62556061)] - **deps**: next-update 0.7.4 -> 0.7.6
  - [[`2e5547d18b`](https://github.com/skenqbx/changelog42/commit/2e5547d18b7a552475ef212dcad6b5cf4c6f1561)] - **deps**: eslint 0.18.0 -> 0.19.0
  - [[`46330f2de2`](https://github.com/skenqbx/changelog42/commit/46330f2de22ebcc90a04fc48f964e86cf6d2ca9a)] - **(SEMVER-MINOR) prefix**: added '/' as allowed character
```

Anyway, the point is that it looks like this when rendered:

### Commits

  - [[`ec5e5e9547`](https://github.com/skenqbx/changelog42/commit/ec5e5e9547f8ba0f55c4f5b2addb3da944678440)] - **(SEMVER-MAJOR) bin**: add --commit-url argument
  - [[`991070866a`](https://github.com/skenqbx/changelog42/commit/991070866acf913b10ea6462c31f5a4d62556061)] - **deps**: next-update 0.7.4 -> 0.7.6
  - [[`2e5547d18b`](https://github.com/skenqbx/changelog42/commit/2e5547d18b7a552475ef212dcad6b5cf4c6f1561)] - **deps**: eslint 0.18.0 -> 0.19.0
  - [[`46330f2de2`](https://github.com/skenqbx/changelog42/commit/46330f2de22ebcc90a04fc48f964e86cf6d2ca9a)] - **(SEMVER-MINOR) prefix**: added '/' as allowed character

## Commit Messages

```
{scope}: {message}

{body}

{footer}
```

Messages containing `working on` are ignored.

Supported tags are;

 - `SEMVER-MINOR`
 - `SEMVER-MAJOR`

## API

### Class: ChangeLog

#### new ChangeLog(opt_options)

**opt_options**

  - `{string} cwd` Working directory aka. repository path
  - `{string} since`
  - `{boolean} group` When `true` group(sort) commits by scope
  - `{boolean} author` When `true` add the commit author
  - `{boolean} link` When `true` link commit hashes with `commitURL`
  - `{boolean} merge` When `true` include merge commits
  - `{string} commitURL` defaults to `<commit-url>`

#### changelog.getDate(commitish, callback)
Retrieve the datetime for an commit hash or tag.

#### changelog.getLog(since, callback)
Generate an array of commits.

#### changelog.toMarkdown(commits)
Generate an array of commits formatted as markdown.

## Tests

```bash
npm test
firefox coverage/lcov-report/index.html
```

### Coverage

```
Statements   : 21.24% ( 24/113 )
Branches     : 26.67% ( 20/75 )
Functions    : 12.5% ( 1/8 )
Lines        : 21.24% ( 24/113 )
```
