#backend
FROM openjdk:21-jdk-slim

WORKDIR /app

# Gradle Wrapper 복사
COPY gradlew .
COPY gradle gradle
COPY . .

# Gradle Wrapper 실행 권한 부여
RUN chmod +x gradlew && \
    ./gradlew bootJar

# 빌드된 JAR 파일 실행
ENTRYPOINT ["java", "-jar", "build/libs/opt-back-0.0.1-SNAPSHOT.jar"]

#fastapi
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

#jenkins
FROM jenkins/jenkins:jdk21

USER root

RUN apt-get update &&\
    apt-get upgrade -y &&\
    apt-get install -y openssh-client