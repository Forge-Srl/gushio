# How to Contribute

First, thank you for contributing to Gushio!

We'd love to accept your patches and contributions to this project. There are just a few small guidelines you need to 
follow.

## How can I contribute?

You can start contributing to Gushio
- [Reporting bugs](#reporting-bugs)
- [Suggesting enhancements or new features](#suggesting-enhancements-or-new-features)
- [Talk about Gushio](#talk-about-gushio)

Any other idea to contribute that we missed? Submit a Pull Request to share it with us!

[GitHub Issues](https://github.com/forge-srl/gushio/issues) is the preferred contribution channel. When creating a new 
issue through the GitHub Issues channel, it's really important to understand if it is a *beginner-friendly* one. 
Beginner-friendly issues can be a good starting point for new contributors; that's the reason why you can label them as 
"good first issue". Visit [here](https://github.com/forge-srl/gushio/contribute) and make your first contribution to 
this repository by tackling one of the listed good first issues.

Contributors can start contributing even in "help wanted" issues. These are issues maintainers want help on.

Please respect the following restrictions:
- Please do not use the issue tracker for personal support requests; instead you may use 
  [GitHub Discussions](https://github.com/Forge-Srl/gushio/discussions).
- Please do not derail or troll issues. Keep the discussion on topic and respect the opinions of others.

### Reporting bugs

A bug is a **demonstrable problem** that is caused by the code in the repository.

Prior to reporting a bug, please check if it is already tracked using the GitHub issue search. If it is marked as fixed,
but you are still experiencing it, add a comment to the issue's discussion so that we can re-open it.

To report a new bug we ask you to follow the template that you can find
[here](https://github.com/Forge-Srl/gushio/issues/new?assignees=&labels=bug&template=bug_report.md&title=).
This template guides you during the definition of the bug. It includes:
- a description of the bug;
- the steps needed to reproduce the bug;
- the behavior you expected from the application in the described context;
- optional stack trace or logs that provide information to further describe the context;
- information about the local system you are running Gushio on;
- additional context.

### Suggesting enhancements or new features

Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the 
project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Please
provide as much detail and context as possible.

As for bug reporting, there is a template for new feature requests too. You can find it 
[here](https://github.com/Forge-Srl/gushio/issues/new?assignees=&labels=&template=feature_request.md&title=).
It includes:
- a description of an eventual problem the feature is related to;
- a description of the solution you would like;
- eventual different alternatives you’ve considered;
- additional context.

### Talk about Gushio

Even if you don't touch Gushio codebase you can still be useful. If you think it's worth it, share Gushio on social
media or write an article about it.

## Your First Code Contribution

Do you want to implement something from scratch or fix an issue?

This is the first time you're contributing to Gushio. "good first issues" and "help wanted" issues could be a nice
starting point for you to get your hands dirty with the codebase.

### What should I know before I get started?

If you want to start a code contribution, whether it is a bug fix or a new feature, it is important for you to
understand Gushio concepts and way to work.

In the [documentation site](https://forge-srl.github.io/gushio/docs/intro) you should find all the information you need.

Gushio is written in JavaScript and runs on Node.js, so you also need a solid knowledge of both. 

### Development environment setup

Gushio is a Node.js project, follow [this](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) official
guide to install both Node.js and NPM.
We suggest you to use the latest LTS version of Node.js while developing Gushio.

You can use any editor you want, even if we suggest [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/).

### Linting

We are using [eslint](https://eslint.org/) as our project's linter. Its configuration is defined in the .eslintrc.cjs
file, present in the project's root folder. There you can find all style rules that apply to the code.

### Testing

We are using [Jest](https://jestjs.io/) as our testing framework, together with 
[Codecov](https://app.codecov.io/gh/Forge-Srl/gushio) to ensure a high coverage of our codebase (at least 90%). 
Therefore, **patches submitted without tests (or with broken tests) will not be accepted**.

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Examples:

```
feat: Add new cloud provider

docs: Fix typo in Readme
```

Please ensure to always write a clear log message for your commits. One-line messages are fine for small changes, bigger
changes should include more context to understand the change quickly. Example:

```
$ git commit -m "feat: a brief summary of the commit
>
> A paragraph describing what changed and its impact."
```

## Code Reviews

All submissions require review. We use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more information on using pull requests.

Good pull requests (patches, improvements, new features) are a fantastic help. They should remain focused on the scope
and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g. implementing features, massive code 
refactoring), otherwise, you risk spending a lot of time working on something that might not get accepted into the 
project.

**IMPORTANT**: by submitting a patch, you agree to allow the project owner to license your work under the same license 
as that used by the project.
