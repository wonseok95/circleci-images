#!/bin/bash

set -eu

NEW_ORG=${NEW_ORG:-circleci}

DOCKERFILE_PATH=$1

echo Building docker image from $DOCKERFILE_PATH

function image_name() {
  repo_tag=$( echo ${DOCKERFILE_PATH} | sed 's|.*/\([^/]*\)/images/\(.*\)/Dockerfile|\1:\2|g' | sed 's|/|-|g')
  echo "${NEW_ORG}/${repo_tag}"
}

IMAGE_NAME=$(image_name)

function is_variant() {
      echo $IMAGE_NAME | grep -q -
}

pushd $(dirname $DOCKERFILE_PATH)

# pull to get cache and avoid recreating images unnecessarily
docker pull $IMAGE_NAME || true

if is_variant
then
    docker build -t $IMAGE_NAME .
    docker push $IMAGE_NAME

    # variants don't get reused, clean them up
    docker image rm $IMAGE_NAME
else
    # when building the new base image - always try to pull from latest
    # also keep new base images around for variants
    docker build --pull -t $IMAGE_NAME .
    docker push $IMAGE_NAME
fi

popd
