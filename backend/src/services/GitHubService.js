import { Octokit } from '@octokit/rest';

export class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    this.owner = process.env.GITHUB_REPO_OWNER;
    this.repo = process.env.GITHUB_REPO_NAME;
  }

  async createBranch(branchName, baseBranch = 'main') {
    try {
      // Get the base branch reference
      const { data: baseRef } = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${baseBranch}`
      });

      // Create new branch
      const { data: newRef } = await this.octokit.rest.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha
      });

      console.log(`✅ Created branch: ${branchName}`);
      return newRef;
    } catch (error) {
      if (error.status === 422) {
        // Branch already exists
        console.log(`ℹ️  Branch ${branchName} already exists`);
        return null;
      }
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async createOrUpdateFile(path, content, message, branch) {
    try {
      let sha = null;
      
      // Try to get existing file to update it
      try {
        const { data: existingFile } = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
          ref: branch
        });
        sha = existingFile.sha;
      } catch (error) {
        // File doesn't exist, will create new one
        if (error.status !== 404) {
          throw error;
        }
      }

      // Create or update file
      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha })
      });

      console.log(`✅ ${sha ? 'Updated' : 'Created'} file: ${path} on branch ${branch}`);
      return data;
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw error;
    }
  }

  async createPullRequest(title, body, headBranch, baseBranch = 'main') {
    try {
      const { data: pr } = await this.octokit.rest.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head: headBranch,
        base: baseBranch
      });

      console.log(`✅ Created pull request #${pr.number}: ${title}`);
      return pr;
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw error;
    }
  }

  async addPullRequestReview(prNumber, body, event = 'COMMENT') {
    try {
      const { data: review } = await this.octokit.rest.pulls.createReview({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body,
        event // 'APPROVE', 'REQUEST_CHANGES', or 'COMMENT'
      });

      console.log(`✅ Added review to PR #${prNumber}: ${event}`);
      return review;
    } catch (error) {
      console.error('Error adding PR review:', error);
      throw error;
    }
  }

  async mergePullRequest(prNumber, title, mergeMethod = 'merge') {
    try {
      const { data: merge } = await this.octokit.rest.pulls.merge({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        commit_title: title,
        merge_method: mergeMethod // 'merge', 'squash', or 'rebase'
      });

      console.log(`✅ Merged pull request #${prNumber}`);
      return merge;
    } catch (error) {
      console.error('Error merging pull request:', error);
      throw error;
    }
  }

  async getPullRequest(prNumber) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      return pr;
    } catch (error) {
      console.error('Error getting pull request:', error);
      throw error;
    }
  }

  async getPullRequestFiles(prNumber) {
    try {
      const { data: files } = await this.octokit.rest.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      return files;
    } catch (error) {
      console.error('Error getting PR files:', error);
      throw error;
    }
  }

  async deleteBranch(branchName) {
    try {
      await this.octokit.rest.git.deleteRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`
      });

      console.log(`✅ Deleted branch: ${branchName}`);
    } catch (error) {
      console.error('Error deleting branch:', error);
      // Don't throw, branch deletion is not critical
    }
  }

  getRepoUrl() {
    return `https://github.com/${this.owner}/${this.repo}`;
  }

  getPullRequestUrl(prNumber) {
    return `${this.getRepoUrl()}/pull/${prNumber}`;
  }
}
