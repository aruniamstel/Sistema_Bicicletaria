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
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Permite esses métodos
                .allowedHeaders("Content-Type", "Authorization") // Permite os cabeçalhos que você vai usar
                .allowCredentials(true); // Caso precise de cookies ou autenticação
    }
}
