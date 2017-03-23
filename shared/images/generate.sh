#!/bin/sh

set -eu

MANIFEST_SOURCE="${MANIFEST_SOURCE:-https://raw.githubusercontent.com/docker-library/official-images/master/library/${BASE_REPO}}"
IMAGE_CUSTOMIZATIONS=${IMAGE_CUSTOMIZATIONS:-}

function find_tags() {
  curl -sSL "$MANIFEST_SOURCE" \
    | grep Tags \
    | sed  's/Tags: //g' \
    | sed 's|, | |g' \
    |grep -v -e '-'
}

SHARED_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

TEMPLATE=${TEMPLATE:-basic}

function find_template() {
  # find the right template - start with invoker path
  # then check this path
  template=$1

  if [ -e "$(dirname pwd)/Dockerfile-${template}.template" ]
  then
    echo "$(dirname pwd)/Dockerfile-${template}.template"
    exit 0
  fi

  if [ -e "${SHARED_DIR}/Dockerfile-${template}.template" ]
  then
    echo "${SHARED_DIR}/Dockerfile-${template}.template" 
    exit 0
  fi

  exit 1
}

function render_template() {
  TEMP=$(mktemp)
  printf "%s\n" "${IMAGE_CUSTOMIZATIONS}" > $TEMP

  TEMPLATE_PATH=$(find_template $1)

  cat $TEMPLATE_PATH | \
    sed "s|{{BASE_IMAGE}}|$BASE_IMAGE|g" | \
    sed "/# BEGIN IMAGE CUSTOMIZATIONS/ r $TEMP"

  rm $TEMP
}

for tag in $(find_tags)
do
  echo $tag

  rm -rf $tag
  mkdir $tag

  BASE_IMAGE=${BASE_REPO}:${tag}
  NEW_IMAGE=${NEW_REPO}:${tag}

  render_template $TEMPLATE > $tag/Dockerfile

  # variants based on the basic image
  for variant in ${VARIANTS}
  do

    echo "  $variant"
    BASE_IMAGE=${NEW_REPO}:${tag}
    NEW_IMAGE=${NEW_REPO}:${tag}-${variant}

    mkdir $tag/$variant
    render_template $variant > $tag/$variant/Dockerfile
  done
done
