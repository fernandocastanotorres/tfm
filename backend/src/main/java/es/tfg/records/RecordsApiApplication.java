package es.tfg.records;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

import es.tfg.records.infrastructure.config.FileStorageConfig;
import es.tfg.records.infrastructure.config.JwtConfig;

@SpringBootApplication
@EnableConfigurationProperties({JwtConfig.class, FileStorageConfig.class})
@EnableAsync
public class RecordsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecordsApiApplication.class, args);
    }

}
