import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

export async function getRepositoryInfo(repositoryUrl:string){

  const parts = repositoryUrl
    .replace("https://github.com/","")
    .split("/");

  const owner = parts[0];
  const repo = parts[1];


  const response = await octokit.repos.get({
    owner,
    repo
  });


  return response.data;
}
