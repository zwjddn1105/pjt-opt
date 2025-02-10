FROM openjdk:21-jdk

WORKDIR /app

COPY . .

# 복사된 파일 확인
RUN ls -l

# gradlew 실행 권한 부여
RUN chmod +x gradlew

# Gradle 빌드 실행
RUN ./gradlew clean build -x test

CMD ["java", "-jar", "build/libs/backend.jar"]