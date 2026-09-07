# Team checkpoint workflow

User preference: commit and push each completed, verified build increment so teammates can follow progress and work is not left only on one laptop.

Before each push:

1. Inspect the diff and preserve unrelated teammate changes.
2. Run checks appropriate to the increment and document untested behavior and remaining risks.
3. Exclude authentication files, tokens, passwords, private exports and machine-generated state. Synthetic data must be clearly labeled.
4. Fetch the remote and check for teammate commits. Never force-push or discard conflicting changes.
5. Make a focused commit, push it, and verify the remote branch matches the intended commit.

Git publication is separate from Salesforce deployment and agent activation. A pushed commit does not imply that it is deployed, activated, security-approved or ready for production. Record org validation and deployment results separately.
