# EDTech

## Table of Contents

0. [Prerequisites](#prerequisites)
1. [Workflow](#workflow)
2. [Styleguides](#styleguides)

# Prerequisites

- Branch `master` will be set to deploy automatically through gitlab CI/CD. 
    *Commits to this branch will be fewest in number and it will contain only the most stable code which is supposed to be live at any time.
- Branch `dev` will contain code for the features that are currently being developed. 
    *Prior to merging any other branch to `dev`, the code must be reviewed by maintainers.
- Purposes of other branches are discussed later.

# Workflow

- Clone the git repository on your machine.
- Go into the repository and run 'npm install' to install all dependencies and devDependencies.
- Copy the sample.env file into a new file called .env which is gitignored.
- Run the script "npm start" on your console. Note that this will run successfully with 'nodemon' only if it satisfies ESLint rules.

## Feature Development

- Each new feature has it's own branch.
- After complete creation of the feature, the code must be pushed and a Merge Request made to branch `dev`.
- Commits should be frequent, and there should be frequent pushes to each branch.
- The branch will be deleted once a feature is completed.
- The same applies for fixes. The branch name should preferably have a prefix `fix-` if it's supposed to add a fix to the code on `dev`.
- Thus, dev does not always contain perfectly stable code unlike master, necessary fixes may be made.
- Merge Requests should describe what the new feature being added is doing, and specify it separately if it is a breaking change.

# Styleguides

## Commit Messages

The commit messages should follow the following pattern:
```bash
feat: Description # if a new feature is added
fix: Description # if a bug is fixed
refactor: Description # if a the code is refactored
docs: Description # if docs are added
```
Learn more [here](https://www.conventionalcommits.org/en/v1.0.0-beta.2/).
