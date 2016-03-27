# Contributing Guide

## Table of Contents

- [Contributing Guidelines](#contributing-guidelines)

- [Code Style Guide](#code-style-guide)

  - [Lint the Code](#lint-the-code)

  - [Use EditorConfig](#use-editorconfig)

## Contributing Guidelines

Here is some advice on how to craft a pull request with the best possible
chance of being accepted:

- [Follow code style guides](#code-style-guide).

- Write tests.

- Write documentation.

- [Write good commit messages].

- Don't change the library version.

- Add an entry to [Unreleased section in CHANGELOG].

- [Squash related commits] when the PR is ready to merge.

[Write good commit messages]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
[Unreleased section in CHANGELOG]: https://github.com/kossnocorp/assets-webpack-plugin/blob/master/CHANGELOG.md#unreleased
[Squash related commits]: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Squashing-Commits

## Code Style Guide

### Lint the Code

The project follows [JavaScript Standard Style]. To lint the code, run:

```bash
npm run lint
```

[JavaScript Standard Style]: http://standardjs.com/

### Use EditorConfig

The project uses [EditorConfig] to define basic coding style guides.
Please install a plugin for your editor of choice or manually enforce
the rules listed in [.editorconfig].

[EditorConfig]: http://editorconfig.org
[.editorconfig]: https://github.com/kossnocorp/assets-webpack-plugin/blob/master/.editorconfig
