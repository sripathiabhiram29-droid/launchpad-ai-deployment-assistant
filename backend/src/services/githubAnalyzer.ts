import { getRepositoryInfo } from "./githubService";


export async function analyzeRepository(repository:string){

  const repoInfo = await getRepositoryInfo(repository);


  return {

    name: repoInfo.name,

    description: repoInfo.description,

    language: repoInfo.language,

    stars: repoInfo.stargazers_count,

    architecture: {

      applicationType:
        "Cloud-native application",

      recommendation:
        "Deploy using Railway services with containerized workloads"

    }

  };

}
