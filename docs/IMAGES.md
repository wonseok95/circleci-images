# CircleCI Conveniance Images

CircleCI provides a set of language/stack images that CircleCI has found to be useful for development and use in CI.

Dockerhub provides many official images targeting languages and stacks (e.g. [Node](dockerhub.com/r/_/node), [Ruby](https://hub.docker.com/r/_/ruby/), [Python](https://hub.docker.com/r/_/python/), [PHP](dockerhub.com/r/_/php), etc).  While these images provide a good starting point and aimed for use in production case, CircleCI sees value in augment them further to provide tools making them better equipped for CI use where users desire more utility tools installed.

# Goals of images

* Quick adoption - have the very common CI tools pre-installed
* Ease Docker learning curve
* Allow transitioning to custom images later
* Add sensibile default configurations for CircleCI environment (e.g. sensible default memory limit for Java images)

# Non-Goals

* Install everything!
* Target polyglot applications.  However, if we find that a community use another language tools frequently, we may install it.  (e.g. node/yarn/hamlc/cass may be installed for the rails related images, but not for golang images).

# Practices

All CircleCI conveniance images must do the following:

* When appropriate, extend the language official images provided by Dockerhub and track them
* Install common development tools (e.g. `git`, `ca-certificates`, `ssh`, `tar`, `curl`, `wget`, `nc`, `ifconfig`).  Pretty much that what [`buildpack-deps` image](https://hub.docker.com/_/buildpack-deps/) contain
  * Versions of these tools may change between versions - and we aim to install the latest available.  If user needs to pin any of them, they are encouraged to lock the docker version or use the Dockerfile to build their custom image
* Default to using a non-root user, namely `circleci` - which has passwordless sudo
* Images should be published in dockerhub as `circleci-library/<name>:<version>`, e.g. `circleci-library/node:7.3.2`
* Images should be rebuilt built in frequent basis (at least once a week), and upon notice of new upstream releases (e.g. new node version released)
