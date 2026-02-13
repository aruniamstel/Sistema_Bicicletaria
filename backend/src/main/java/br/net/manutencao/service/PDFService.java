package br.net.manutencao.service;

import br.net.manutencao.model.OrdemServico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.util.Base64;
import java.util.Locale;

@Service
public class PDFService {

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * Gera um PDF da Ordem de Serviço a partir do objeto OrdemServico
     * 
     * @param ordemServico objeto contendo os dados da ordem
     * @return byte[] contendo o PDF gerado
     * @throws Exception em caso de erro na geração do PDF
     */
    public byte[] gerarPdfOrdemServico(OrdemServico ordemServico) throws Exception {
        // Preparar contexto Thymeleaf
        Context context = new Context(new Locale("pt", "BR"));

        // Ler a logo e converter para Base64
        try {
            ClassPathResource imgFile = new ClassPathResource("templates/logo.png");
            byte[] imageBytes = Files.readAllBytes(imgFile.getFile().toPath());
            String base64Logo = Base64.getEncoder().encodeToString(imageBytes);
            context.setVariable("logoBase64", base64Logo);
        } catch (Exception e) {
            context.setVariable("logoBase64", null); // Caso a imagem não exista
            System.err.println("Erro ao carregar a logo: " + e.getMessage());
        }

        context.setVariable("ordem", ordemServico);

        // Processar template HTML
        String htmlContent = templateEngine.process("ordem-servico-template", context);

        // Converter HTML para PDF usando ITextRenderer
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        }
    }
}
