FROM openjdk:21-jdk

WORKDIR /app

COPY . .

RUN ls -lah /app

RUN chmod +x gradlew && ls -lah /app/gradlew

RUN ./gradlew clean build -x test

CMD ["java", "-jar", "build/libs/backend.jar"]
