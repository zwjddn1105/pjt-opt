FROM openjdk:21-jdk

WORKDIR /app

COPY ./S12P11A309/opt-back .

RUN ./gradlew clean build

CMD ["java", "-jar", "build/libs/backend.jar"]