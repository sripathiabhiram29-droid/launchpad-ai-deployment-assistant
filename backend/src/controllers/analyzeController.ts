import { Request, Response } from "express";


export function analyzeRepository(
  req: Request,
  res: Response
) {

  const { repository } = req.body;


  if (!repository) {
    return res.status(400).json({
      error: "Repository URL required"
    });
  }


  return res.json({

    repository,

    analysis: {

      framework: "React",

      backend: "Node.js",

      database: "PostgreSQL",

      deployment:
        "Cloud-native application"

    }

  });

}
