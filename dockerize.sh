#!/bin/bash

docker build -t prayforhana/node:$1 .
docker push prayforhana/node:$1
