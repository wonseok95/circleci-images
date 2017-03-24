# CircleCI Bundles


A place holder for CircleCI Bundles.

A Bundle is a set of reusable resources aimed to ease working with specific languages/stacks in CircleCI.

Each bundle may have the following:

* Images: a set of conveniance images that work better in context of CI.  This repo contains the official set of images that CircleCI maintains.  It contains language as well as services images.
  * Language images (e.g. `ruby`, `python`, `node`) are images targetted for common programming languages with the common tools pre-installed.  They primarily extend the official images and install additional tools (e.g. browsers) that we find very useful in context of CI.
  * Services images (e.g. `mongo`, `postgres`) are images that have the services pre-configured with development/CI mode.  They also primarily extend the corresponding official images but with sensible development/CI defaults (e.g. disable production checks, default to nojournal to speed up tests)

* Commands: a set of individual steps that users can reference in their CircleCI build configuration files.  For example, `ruby/rspec` is a command that users can reference that will automatically split tests in context of parallel builds.


# How to add a bundle with images

A bundle is a top-level subfolder in this repository (e.g. `postgres`).

For the image Dockerfiles, we use a WIP templating mechanism.  Each bundle should contain a `generate-images` script for generating the Dockerfiles.  You can use [`postgres/generate-images`](postgres/generate-images) and [`node/generate-images`](node/generate-images) for inspiration.  The pattern is is executable script of the following sample:


```bash
#!/bin/bash

# the base image we should be tracking.  It must be a Dockerhub official repo
BASE_REPO=node

# Specify the variants we need to publish.  Language stacks should have a
# `browsers` variant to have an image with firefox/chrome pre-installed
VARIANTS=(browsers)

# By default, we don't build the alpine images, since they are typically not dev friendly
# and makes our experience inconsistent.
# However, it's reasonable for services to include the alpine image (e.g. psql)
#
# uncomment for services

#INCLUDE_ALPINE=true

# if the image needs some basic customizations, you can embed the Dockerfile
# customizations by setting $IMAGE_CUSTOMIZATIONS.  Like the following
#

IMAGE_CUSTOMIZATIONS='
RUN apt-get update && apt-get install -y node
'

# boilerplate
source ../shared/images/generate.sh
```

By default, the script uses `./shared/images/Dockerfile-basic.template` template which is most appropriate for language based images.  Language image variants (e.g. `-browsers` images that have language images with browsers installed) use the `./shared/images/Dockerfile-${variant}.template`.

Service image should have their own template.  The template can be kept in `<bundle-name>/resources/Dockerfile-basic.template` - like [`./mongo/resources/Dockerfile-basic.template`](./mongo/resources/Dockerfile-basic.template).

To build all images - push a commit with `[build-images]` text appearing in the commit message.

Also, add the bundle name to in Makefile `BUNDLES` field.

## Limitations
* The template language is WIP - it only supports `{{BASE_IMAGE}}` template.  We should extend this.
* Generated dockerfiles isn't checked into repo.  Since we track moving set of tags, checking into repository can create lots of unnecessary changes
* By default, this pushes to `notnoopci/` Dockerhub org (treated as staging).  Once we get some test builds with these images, we can promote them to `circleci` Dockerhub org
