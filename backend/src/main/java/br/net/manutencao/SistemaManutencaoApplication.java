package br.net.manutencao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SistemaManutencaoApplication {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		SpringApplication.run(SistemaManutencaoApplication.class, args);
		System.out.println("deu certo");
	}
}
