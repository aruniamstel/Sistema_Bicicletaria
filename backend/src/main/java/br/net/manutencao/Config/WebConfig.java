package br.net.manutencao.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Configura CORS para todas as rotas
                .allowedOrigins("http://localhost:4200") // Permite acesso do frontend Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Permite esses métodos
                .allowedHeaders("*") // Permite TODOS os headers
                .allowCredentials(true) // Caso precise de cookies ou autenticação
                .maxAge(3600); // Cache da preferência CORS por 1 hora
    }
}
