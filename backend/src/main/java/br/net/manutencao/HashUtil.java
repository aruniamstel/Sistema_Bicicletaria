package br.net.manutencao;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

    public class HashUtil {

        public static String gerarSenha() {
            SecureRandom random = new SecureRandom();
            int senha = random.nextInt(10000);  // 0 e 9999
            return String.format("%04d", Math.abs(senha));  // Formata para ter 4 dígitos
        }

        public static String hashSenhaComSalt(String senha, String salt) throws Exception {
            String senhaComSalt = senha + salt;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(senhaComSalt.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        }

        public static String gerarSalt() {
            byte[] salt = new byte[16];
            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(salt);
            return Base64.getEncoder().encodeToString(salt); // Retorna o salt como Base64
    }
}