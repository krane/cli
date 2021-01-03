import { cli } from "cli-ux";
import { Job } from "@krane/common";
import BaseCommand from "../base";

export default class History extends BaseCommand {
  static description = "Get the history for a deployment";

  static args = [
    {
      name: "deployment",
      required: true,
      description: "Name of the deployment",
    },
  ];

  async run() {
    const { args } = this.parse(History);

    let jobs: Job[];
    try {
      const client = await this.getKraneClient();
      jobs = await client.getJobs(args.deployment);
    } catch (e) {
      this.error(e?.response?.data ?? "unable to delete deployment");
    }

    // grab the 25 most recent jobs
    const recentJobs = jobs.reverse().slice(0, 25);
    this.logTable(recentJobs);
  }

  logTable(jobs: Job[]) {
    cli.table(jobs, {
      action: {
        get: (job) => job.type.replace("_", " ").toLowerCase(),
        minWidth: 11,
      },
      executed: {
        get: (job) => {
          const date = this.epochToDate(job.start_time_epoch);
          return `${date.toLocaleDateString()} ${date
            .toLocaleTimeString()
            .toLowerCase()
            .replace(" ", "")}`;
        },
        minWidth: 21,
      },
      state: {
        get: (job) => job.state.toString().toLowerCase(),
        minWidth: 10,
      },
      failures: {
        get: (job) => `${job.status.failure_count}`,
        minWidth: 10,
      },
      jobId: {
        get: (job) => job.id,
        header: "Job Id",
      },
    });
  }

  epochToDate(epoch: number) {
    return new Date(epoch * 1000);
  }
}
