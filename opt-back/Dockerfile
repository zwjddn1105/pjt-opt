FROM openjdk:21-jdk

WORKDIR /app

COPY . .

RUN ./gradlew clean build

CMD ["java", "-jar", "build/libs/backend.jar"]