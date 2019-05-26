/** Data Model **/

const states = {
  initial: "initial",
  loading: "loading",
  error: "error",
  ok: "ok",
};

const store = {
  state: states.initial,
  error: null,
  json: {},
  repos: [],
  tags: {}, // repo => Repo
  repo: "none",
  variant: "all",
  grep: "",
};

const emptyRepo = () => ({
  variants: [],
  tags: [],
});

const variants = [
  { name: "All", tag: "all", virtual: true },
  { name: "None", tag: "none", virtual: true },
  { name: "Node + Legacy Browsers", tag: "node-browsers-legacy" },
  { name: "Node + Browsers", tag: "node-browsers" },
  { name: "Legacy Browsers", tag: "browsers-legacy" },
  { name: "Browsers", tag: "browsers" },
  { name: "Node", tag: "node" },
  { name: "PostGIS + RAM", tag: "postgis-ram" },
  { name: "RAM", tag: "ram" },
  { name: "PostGIS", tag: "postgis" },
];

/** State Transitions **/

export const actions = {
  init,
  selectRepo,
  selectVariant,
  setGrep,
};

function init() {
  if (store.state !== states.ok) {
    update({ state: states.loading });
  }
  // TODO: hit prod when CORS is enabled
  fetch("./dockerhub-info.json")
    .then(resp => resp.json())
    .then(
      json => updateJson(json),
      err => update({ state: states.error, error: String(err) })
    );
}

function selectRepo(repoName) {
  update({ repo: repoName });

  const repo = selectedRepo(store);
  const variant = repo.variants.includes(store.variant) ? store.variant : "all";
  update({ variant });
}

function selectVariant(variant) {
  update({ variant: variant });
}

function setGrep(grep) {
  update({ grep: grep });
}

function updateJson(json) {
  update({ state: states.ok, json, ...expand(json) });
}

function expand(json) {
  const expanded = {
    repos: [],
    tags: {},
  };

  json.forEach(({ name, repo, tags }) => {
    expanded.repos.push({ name, repo });

    expanded.tags[repo] = expandRepoTags(tags);
  });

  return expanded;
}

function expandRepoTags(tags) {
  // It would be neat if we could try and parse the various tags
  // to identify the various flavours of the upstream images
  // and then use that data to generate the UI filters
  //
  // an approach that might work would be to split on `-`, and remove
  // duplicates - possibly with some extra logic to group together things
  // that look like version numbers or operating systems
  const repo = emptyRepo();
  const variants = new Set();

  repo.tags = tags
    .map(({ name: tag, size, updated }) => {
      const variant = deriveVariant(tag);
      variants.add(variant);
      return {
        tag,
        variant,
        size,
        updated: new Date(updated),
      };
    })
    .sort((a, b) => b.updated - a.updated);

  repo.variants = Array.from(variants.values());

  return repo;
}

const variantValues = variants.map(x => x.tag);
function deriveVariant(tag) {
  return variantValues.find(subTag => tag.includes(subTag));
}

/** Selectors **/

export const selectors = {
  repos,
  selectedTags,
  relevantVariants,
};

function repos(data) {
  return [{ name: "None", repo: "none" }].concat(data.repos);
}

function selectedTags(data) {
  const repo = selectedRepo(data);
  return repo.tags.filter(filter(data));
}

function filter(data) {
  const greps = data.grep.split(" ");
  return ({ tag, variant }) =>
    (data.variant === "all" ||
      (data.variant === "none" && !variant) ||
      data.variant === variant) &&
    (!data.grep || greps.every(grep => tag.includes(grep)));
}

function relevantVariants(data) {
  const repo = selectedRepo(data);
  return variants.filter(v => v.virtual || repo.variants.includes(v.tag));
}

function selectedRepo(data) {
  return data.tags[data.repo] || emptyRepo();
}

/** Data Subscriptions **/

let handler = function() {};
export function subscribe(newHandler) {
  handler = newHandler;
  actions.init();
}
function update(updates) {
  Object.assign(store, updates);
  handler(select());
}
function select() {
  const { state, error, ...rest } = store;
  switch (state) {
    case states.initial:
    case states.loading:
      return { state };
    case states.error:
      return { state, error };
    case states.ok:
      return { state, ...rest };
    default:
      return { state: states.error, error: "unexpected state" };
  }
}

if (module.hot) {
  if (module.hot.data) {
    console.log("applying persisted");
    // Restore the old store
    update(module.hot.data.store);
    // Rebuild the json expansions
    updateJson(store.json);
  }
  module.hot.dispose(hotData => {
    hotData.store = store;
  });
}
