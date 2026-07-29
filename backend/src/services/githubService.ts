import { Octokit } from "@octokit/rest";

export const githubClient = new Octokit();

export async function getRepositoryInfo(repositoryUrl:string){

  const parts = repositoryUrl
    .replace("https://github.com/","")
    .split("/");

  const owner = parts[0];
  const repo = parts[1];


  const response = await githubClient.repos.get({
    owner,
    repo
  });


  return response.data;
}
