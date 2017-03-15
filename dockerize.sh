#!/bin/bash

docker build -t prayforhana/test:$1 .
docker push prayforhana/test:$1
