# Use an official Maven image with JDK 21 to build the app
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
COPY .env .
RUN mvn package -DskipTests

# Use an official OpenJDK runtime image to run the app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/golf-platform-1.0.0.jar app.jar
COPY --from=build /app/.env .env
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
