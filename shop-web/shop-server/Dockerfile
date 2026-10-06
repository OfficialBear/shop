# 构建：docker build -t shop-server:1.0.0 shop-web/shop-server
FROM eclipse-temurin:21-jre

ENV TZ=Asia/Shanghai
WORKDIR /app

COPY target/shop-server-*.tar.gz /tmp/app.tar.gz
RUN tar -xzf /tmp/app.tar.gz -C /app --strip-components=1 && rm /tmp/app.tar.gz

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/lib/shop-server.jar", "--spring.config.additional-location=file:/app/conf/"]
