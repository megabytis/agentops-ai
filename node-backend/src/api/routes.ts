import express, { Request, Response } from "express";
import axios from "axios";
import env from "../config/env";
import fs from "fs";

const app = express();

app.use(express.json());

interface AnalyzeRepoBody {
  repoUrl: string;
}

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.post(
  "/analyze-repo",
  async (req: Request<{}, {}, AnalyzeRepoBody>, res: Response) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      res.status(400).json({
        error: "repoUrl is required",
      });
    }

    let response: any;

    interface Result {
      status: string;
      repoUrl: string;
      response: any;
    }

    interface Failure {
      repoUrl: string;
      error: any;
    }

    let result: Result | null = null;
    let failure: Failure | null = null;

    try {
      response = await axios.post(
        `${env.AI_SERVICE_URL}/workflow`,
        {
          repoUrl: repoUrl,
        },
        {
          timeout: 120000,
        },
      );

      const data = response.data;

      if (typeof data.message === "string") {
        data.message = JSON.parse(data.message);
      }

      result = {
        status: "success",
        repoUrl: repoUrl,
        response: data,
      };
    } catch (pyErr: any) {
      failure = {
        repoUrl: repoUrl,
        error: pyErr.response?.data || pyErr.message,
      };
      return res.status(500).json(failure);
    }

    res.status(200).json({
      repo: repoUrl,
      summary: result.response.summary,
      readme: result.response.readme,
      improvements: result.response.improvements,
    });
  },
);

export default app;
