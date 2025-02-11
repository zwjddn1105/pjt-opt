#!/bin/bash

echo "move to docker directory..."
cd /home/ubunut/docker

echo "Stopping existing Docker containers..."
#docker-compose down  # 기존 컨테이너 종료

# 현재 브랜치 확인
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" != "BackEnd" ]; then
    echo "Switching to BackEnd branch..."
    git checkout BackEnd
fi

echo "Pulling latest changes from BackEnd branch..."
git pull origin BackEnd  # 최신 코드 가져오기

echo "Rebuilding and starting containers..."
docker-compose up -d --build backend # 최신 컨테이너 빌드 및 실행

echo "Deployment completed!"
