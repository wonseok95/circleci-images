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
  tags: [],
  repo: "none",
  variant: "all",
};

export const variants = [
  { label: "All", value: "all", virtual: true },
  { label: "None", value: "none", virtual: true },
  { label: "Node + Browsers", value: "node-browsers" },
  { label: "Browsers", value: "browsers" },
  { label: "Node", value: "node" },
  { label: "RAM", value: "ram" },
];

/** State Transitions **/

export const actions = {
  init,
  selectRepo,
  selectVariant,
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

function updateJson(json) {
  update({ state: states.ok, json, ...expand(json) });
}

function expand(json) {
  const expanded = {
    repos: [],
    tags: [],
  };

  json.forEach(({ name, repo, tags }) => {
    expanded.repos.push({ name, repo });

    // It would be neat if we could try and parse the various tags
    // to identify the various flavours of the upstream images
    // and then use that data to generate the UI filters
    //
    // an approach that might work would be to split on `-`, and remove
    // duplicates - possibly with some extra logic to group together things
    // that look like version numbers or operating systems
    tags.forEach(({ name: tag, size, updated }) => {
      expanded.tags.push({
        language: name,
        repo,
        tag,
        size,
        updated: new Date(updated),
        variant: deriveVariant(tag),
      });
    });
  });

  return expanded;
}

function selectRepo(repo) {
  update({ repo: repo });
}

function selectVariant(variant) {
  update({ variant: variant });
}

/** Selectors **/

export const selectors = {
  tagFilter,
};

function tagFilter(data) {
  const matchingTags = data.tags.filter(filter(data));
  matchingTags.sort(by({ repo: 1, tag: -1 }));
  return matchingTags;
}

function filter(data) {
  return ({ repo, variant }) =>
    repo === data.repo &&
    (data.variant === "all" ||
      (data.variant === "none" && !variant) ||
      data.variant === variant);
}

const variantValues = variants.map(x => x.value);
function deriveVariant(tag) {
  return variantValues.find(subTag => tag.includes(subTag));
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

/** utils **/

/**
 * Generate sort comparators
 */
function by(fields) {
  return (a, b) => {
    for (const field in fields) {
      if (a[field] === b[field]) continue;
      const direction = fields[field];
      return a[field].localeCompare(b[field]) * direction;
    }
    return 0;
  };
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
