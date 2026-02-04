package br.net.manutencao.Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do Jackson ObjectMapper para suportar Java 8+ java.time
 * Registra automaticamente o módulo JSR310 para desserializar LocalDateTime, LocalDate, etc.
 */
@Configuration
public class JacksonConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Registra o módulo para suportar java.time (LocalDateTime, LocalDate, etc.)
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}
