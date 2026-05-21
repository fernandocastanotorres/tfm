# ── Build stage ──────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Runtime stage ────────────────────────────
FROM eclipse-temurin:17-jre

ENV LANG=C.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    tini \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system appgroup && adduser --system appuser --ingroup appgroup

WORKDIR /app

COPY --from=build /app/target/records-api-*.jar app.jar

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["tini", "--"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health/live || exit 1

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]
