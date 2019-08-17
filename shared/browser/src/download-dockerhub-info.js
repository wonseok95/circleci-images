const axios = require("axios");

// Allows us to set DEBUG=axios to see logs
require("axios-debug-log");

const repos = [
  "android",
  "buildpack-deps",
  "clojure",
  "dynamodb",
  "elixir",
  "golang",
  "jruby",
  "mariadb",
  "mongo",
  "mysql",
  "node",
  "openjdk",
  "php",
  "postgres",
  "python",
  "redis",
  "ruby",
  "rust",
];

function fetchInfo() {
  return Promise.all(repos.map(fetchRepo));
}

async function fetchRepo(repo) {
  const repoInfo = await fetchRepoInfo(repo);
  const tags = await fetchAllTags(repo);

  // TODO: fetch labels to find which git SHA produced each tag?
  // https://github.com/docker/distribution/issues/1252#issuecomment-274944254

  return {
    namespace: repoInfo.namespace,
    repo: repoInfo.name,
    name: extractName(repoInfo),
    tags: tags.map(extractTagInfo),
  };
}

const dockerhub = axios.create({
  baseURL: "https://hub.docker.com/v2/repositories/circleci/",
  timeout: 30000,
});

async function fetchRepoInfo(repo) {
  console.warn("Fetching repo info for %s", repo);
  return (await dockerhub.get(buildUrl(repo))).data;
}

async function fetchAllTags(repo) {
  const tags = [];

  let page = 0;
  let data;
  do {
    console.warn("Fetching tags for %s page %d", repo, ++page);
    data = (await dockerhub.get(buildUrl(repo, "tags"), {
      params: { page, page_size: 100 },
    })).data;
    tags.push(...data.results);
  } while (data.next);

  return tags;
}

function buildUrl(...paths) {
  return paths.join("/") + "/";
}

const DESCRIPTION_REGEX = /^(?:The |CircleCI images for |)([-\w]+)/;
function extractName(repoInfo) {
  const match = DESCRIPTION_REGEX.exec(repoInfo.description);
  if (!match) return repoInfo.name;

  return match[1];
}

function extractTagInfo(tagInfo) {
  return {
    name: tagInfo.name,
    size: tagInfo.full_size,
    updated: tagInfo.last_updated,
  };
}

// Export a re-usable promise, we'll only hit the APIs once per process
module.exports = fetchInfo();

// The script can be called via the CLI directly to generate the JSON to STDOUT
if (require.main === module) {
  process.on("unhandledRejection", err => {
    throw err;
  });
  module.exports.then(data => console.log(JSON.stringify(data)));
}
