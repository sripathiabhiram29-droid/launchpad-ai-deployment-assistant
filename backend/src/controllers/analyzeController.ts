import { Request, Response } from "express";
import { analyzeRepository as analyzeRepo } from "../services/githubAnalyzer";


export async function analyzeRepository(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { repository } = req.body;


    if (!repository) {
      res.status(400).json({
        error: "Repository URL required"
      });
      return;
    }


    const analysis = await analyzeRepo(repository);


    res.json({
      repository,
      analysis
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Repository analysis failed"
    });

  }

}
