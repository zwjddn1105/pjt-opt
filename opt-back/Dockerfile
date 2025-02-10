FROM openjdk:21-jdk

WORKDIR /app

RUN pwd && ls -lah

COPY . .

RUN ls -lah /app

RUN chmod +x gradlew && ls -lah /app/gradlew

RUN ./gradlew clean build -x test

CMD ["java", "-jar", "build/libs/backend.jar"]
