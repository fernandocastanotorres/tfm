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

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        curl \
        tini \
        libreoffice-writer \
        libreoffice-calc \
        libreoffice-impress \
        fonts-dejavu-core; \
    rm -rf /var/lib/apt/lists/*; \
    addgroup --system appgroup && adduser --system appuser --ingroup appgroup; \
    curl -fsSL -o /usr/local/bin/gosu \
        "https://github.com/tianon/gosu/releases/download/1.17/gosu-$(dpkg --print-architecture)"; \
    chmod +x /usr/local/bin/gosu && gosu --version

WORKDIR /app

COPY --from=build /app/target/records-api-*.jar app.jar

COPY entrypoint.sh /entrypoint.sh
RUN chown -R appuser:appgroup /app && chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health/live || exit 1

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]
