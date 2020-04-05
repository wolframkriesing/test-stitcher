#!/usr/bin/env bash

set -e

DOCKERFILE_HASH=$(md5 -q ./Dockerfile)
CONTAINER_NAME=test-stitcher
IMAGE_NAME=${CONTAINER_NAME}:${DOCKERFILE_HASH}

function is_container_running() {
  if [[ -n $(docker ps --quiet --filter "name=$CONTAINER_NAME") ]]; then
    return 0
  fi;
  return 1
}

if [[ $(docker inspect --format . ${IMAGE_NAME} 2>&1) != "." ]]; then
  echo "--- BUILDING image '${IMAGE_NAME}'---"
  docker build -t ${IMAGE_NAME} -f Dockerfile .
fi

if is_container_running; then
  echo "--- ENTER running container '${CONTAINER_NAME}'---"
  docker exec -it ${CONTAINER_NAME} $@
else
  echo "--- RUNNING container '${CONTAINER_NAME}'---"
  docker run --rm -it \
    --name ${CONTAINER_NAME} \
    --publish 9778:9778 \
    --volume $(pwd):/app \
    ${IMAGE_NAME} $@
fi
