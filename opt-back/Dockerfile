FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy all necessary files
COPY . .

# Give execution rights to gradlew
RUN chmod +x gradlew

# Clean and build
RUN ./gradlew clean bootJar

# List the contents of build/libs to verify the JAR file
RUN ls -la build/libs/

# Run the application
CMD ["java", "-jar", "build/libs/backend.jar"]