package br.net.manutencao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "br.net.manutencao")
public class SistemaManutencaoApplication {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		SpringApplication.run(SistemaManutencaoApplication.class, args);
		System.out.println("deu certo");
	}
}
