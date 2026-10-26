# Git workflow

This workspace begins empty with no designated remote repository. Local Git
initialization and local commits are authorized by the execution objective.
Use main, review the staged diff for secrets/runtime data, and commit meaningful
tested increments. Do not push, merge, rebase, or create an external repository
without explicit authorization. A GitHub remote must be supplied/approved by the
user before publishing. Do not fabricate a remote URL or CI execution.

## Current destination

The user created and designated `https://github.com/JiaruiTang/my-journal.git`,
then explicitly authorized pushing the committed `main` branch and verifying
GitHub Actions. It is configured as local `origin`; the initial push succeeded.
Routine CI fixes and evidence updates for this bounded publication task can be
committed and pushed there. This does not authorize other repositories or hosting.
