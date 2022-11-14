import type { Probot, Context } from "probot";

export default (app: Probot) => {
  app.log("Yay! The app was loaded!");

  app.on("issues.opened", async (context: Context) => {
    const config = await context.config<Config>("esysConfig.yml");
    if (config && config.newIssueComment) {
      context.octokit.issues.createComment(
        context.issue({ body: config.newIssueComment })
      );
    }

    // Find labels
    let labelList: string[] = [];
    let labelsToAdd: string[] = [];

    const labels = await context.octokit.issues.listLabelsForRepo(
      context.issue({ per_page: 100 })
    );
    const issue = await context.octokit.issues.get(
      // @ts-ignore
      context.issue({ issue_number: context.payload.issue.number })
    );

    labels.data.map(label => labelList.push(label.name));
    labelList.map(label => issue.data.title.toLowerCase().startsWith(`[${label.toLowerCase()}]`) ? labelsToAdd.push(label) : null);

    // Only add one label for now
    if (labelsToAdd.length === 1) {
      return context.octokit.issues.addLabels(
        context.issue({
          // @ts-ignore
          issue_number: context.payload.issue.number,
          labels: labelsToAdd
        })
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
