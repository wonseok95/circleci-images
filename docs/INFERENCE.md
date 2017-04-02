# Inference

In attempt to ease onboarding into CircleCI, we aim to provide an extensible and flexible inference.  In 2.0, the goal is to have inference that spits out a fully functioning configuration file that users can then customize and push.

# Goals of inference

* Quick adoption of 2.0
* Have clear separation between inference and build running - namely ability to update inference without breaking existing customers
* User control over generated config - user needs to be able to inspect and modify it
* Extensible mechanism such that community members and org Enterprise maintainers can manage and own the various inference framework
* At any given time, the inferred config should encapsulate the latest known best practices

# Non-Goals

At this stage, we aren't planning to solve:

* Updating users with current config (whether hand written, or inferred previously).  If a user already has a working config, getting them to update their config with latest conventions, is out of scope now to restrict scope.

* Re-use across inference tools.  It is not a goal to ensure that haskell inference can use ruby inference at this point.

* Solve the polyglot and multi project problem as a first class problem.
  * Polyglot are pretty complex.  The theory is that if the platform is extensible and flexible, we will be able to solve it over time
  * Polyglot applications have clustering.  It's way more likely to see a ruby+node polyglot application than ruby+OCaml
  * Polyglot projects will most likely need a build customized image
  * With flexibility of framework, we can use these clustering properties to design a robust bundles rather than try to solve it in the general case

# Trade offs

When goals in conflict, use the following rules of thumb

* Helping new users onboard >> not breaking existing customers
  * This flows naturely from goals
* When built-in commands are readable, prefer inferring built-ins over Bundle Commands
  * better to infer `run: bundle install --jobs=4` over `- ruby/bundle-install`
  * Not as obvious for ruby test test splitting, where the bash script can be long
  * the idea is that it's easier for user to view and modify the bash/script directly to their liking

# Practices

* Be restrictive in inference
  * e.g. if there a `package.json`, infer `yarn install` but not `yarn test`
* Provide configuration comments when user is potentially expected to desire a different behavior
  * e.g. if we infer a Java `Xmx` setting for customizing memory, comment why the limits are set
* Infernce picks pattern of the recommended images (preferring conveniance images if found, and falling back to official images).
* Use best judgement when referring Commands
  * TODO: How?  Examples?

# Interactions with Commands and Conveniance Images

`
At any given point, inference should pick the most appropriate conveniance image and commands.  As all of these are involving concurrently, inference needs to adopt to them as we iterate.  Since, we are only focusing on new users, there is no fear in breaking existing users.

# Current design and abstraction

This implementation is inspired by [heroku's buildpack `bin/detect`](https://devcenter.heroku.com/articles/buildpack-api#bin-detect).

Each bundle (e.g. `node` bundle) will provide an executable named `inference/infer`.  The executable will be called with the project directory as first argument, and a scratch directory as a second argument.  On successful detection, the script should exit with 0, emit debugging info for user, and emits the config to `<scratch-dir>/config.yml`.  If the bundle cannot infer config based on that, it shall return exit code 1.

The executable may assume it will be invoked from within the bundle and that entire bundle is available and referenceable.

We highly recommend executables to be bash scripts relying on `coreutil` and `jq` tools only; or static binaries compiled with x86 architecture.  We may support some scripting languages (e.g. Lua, Python, etc in future).

A sample script can be the following:

```bash
#!/bin/sh

if [ -f $1/Makefile ]
then
  echo 'Make'
  DIR=$(dirname "$(readlink -f $0)")
  cp $DIR/template.yml $2/config.yml
  exit 0
fi

exit 1
```

The inference CLI may loop through a list of bundles to find the appropriate inference.  If multiple bundles infer configs for the commands, the CLI may choose which one it thinks is appropriate (e.g. by order of priority, arbitrary, etc). 


Open questions:
* What tools inference tools may expect to be available.  In the interm, be conservative
* How to handle multiple inferences competing
