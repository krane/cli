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
    {
      name: "job",
      required: false,
      description: "Deployment job id",
    },
  ];

  async run() {
    const { args } = this.parse(History);

    const client = await this.getKraneClient();

    try {
      if (args.job) {
        const job = await client.getJobById(args.deployment, args.job);
        this.logJobTable(job);
        return;
      }

      const jobs = await client.getJobs(args.deployment);
      const recentJobs = jobs.reverse().slice(0, 25);
      this.logJobsTable(recentJobs);
    } catch (e) {
      this.error(e?.response?.data ?? "unable to get deployment history");
    }
  }

  logJobTable(job: Job) {
    cli.table(job.status.failures, {
      number: {
        get: (failure) => `${failure.execution}/${job.retry_policy}`,
        header: "#",
      },
      message: {
        get: (failure) => failure.message,
      },
    });
  }

  logJobsTable(jobs: Job[]) {
    cli.table(jobs, {
      status: {
        get: (job) => (job.status.failure_count > 0 ? "error" : "ok"),
        minWidth: 8,
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
      action: {
        get: (job) => job.type.replace("_", " ").toLowerCase(),
        minWidth: 11,
      },
      state: {
        get: (job) => job.state.toString().toLowerCase(),
        minWidth: 12,
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
