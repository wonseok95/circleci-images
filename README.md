# CircleCI Bundles


A place holder for CircleCI Bundles.

A Bundle is a set of reusable resources aimed to ease working with specific languages/stacks in CircleCI.

Each bundle may have the following:

* Images: a set of conveniance images that work better in context of CI.  This repo contains the official set of images that CircleCI maintains.  It contains language as well as services images.
  * Language images (e.g. `ruby`, `python`, `node`) are images targetted for common programming languages with the common tools pre-installed.  They primarily extend the official images and install additional tools (e.g. browsers) that we find very useful in context of CI.
  * Services images (e.g. `mongo`, `postgres`) are images that have the services pre-configured with development/CI mode.  They also primarily extend the corresponding official images but with sensible development/CI defaults (e.g. disable production checks, default to nojournal to speed up tests)

* Commands: a set of individual steps that users can reference in their CircleCI build configuration files.  For example, `ruby/rspec` is a command that users can reference that will automatically split tests in context of parallel builds.
