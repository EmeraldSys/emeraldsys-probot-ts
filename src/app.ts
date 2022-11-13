import type { Probot, Context } from "probot";

export default (app: Probot) => {
  app.log("Yay! The app was loaded!");

  app.on("issues.opened", async (context: Context) => {
    const config = await context.config<Config>("esysConfig.yml");
    if (config && config.newIssueComment) {
      return context.octokit.issues.createComment(
        context.issue({ body: config.newIssueComment })
      );
    }
  });

  app.on("issue_comment.created", async (context: Context) => {
    const { isBot } = context;
    if (!isBot) {
      const config = await context.config<Config>("esysConfig.yml");
      if (config && config.newComment) {
        return context.octokit.issues.createComment(
          context.issue({ body: config.newComment })
        );
      }
    }
  });

  app.on("pull_request.opened", async (context: Context) => {
    const config = await context.config<Config>("esysConfig.yml");
    if (config && config.newPRComment) {
      return context.octokit.issues.createComment(
        context.issue({ body: config.newPRComment })
      );
    }
  })
};
