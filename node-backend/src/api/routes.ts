import express, { Request, Response } from "express";

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
  (req: Request<{}, {}, AnalyzeRepoBody>, res: Response) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      res.status(400).json({
        error: "repoUrl is required",
      });
    }

    res.status(200).json({
      repo: repoUrl,
    });
  },
);

export default app;
