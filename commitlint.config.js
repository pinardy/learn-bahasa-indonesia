// Enforces Conventional Commits on commit messages via the Husky commit-msg
// hook. Extends the conventional preset but widens type-enum to include this
// repo's custom `content:` type (used for vocabulary/phrase/story additions).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'content',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
}
