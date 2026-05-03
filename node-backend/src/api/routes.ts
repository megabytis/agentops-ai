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
      return res.status(400).json({
        error: "repoUrl is required",
      });
    }

    // const refinedRepoUrl = String(repoUrl)
    //   .replace("https://", "")
    //   .replace("http://", "")
    //   .split("/");

    // if (String(refinedRepoUrl[0]) !== "github.com") {
    //   return res.status(400).json({
    //     error: "Provide a valid github URL",
    //   });
    // }

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
      let errorMessage = pyErr.response?.data || pyErr.message;
      if (
        typeof errorMessage === "string" &&
        errorMessage.trim().startsWith("<!DOCTYPE html>")
      ) {
        errorMessage =
          "AI service is currently unavailable or starting up. Please try again in a minute.";
      }

      failure = {
        repoUrl: repoUrl,
        error: errorMessage,
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
