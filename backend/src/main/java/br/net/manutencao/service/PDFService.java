package br.net.manutencao.service;

import br.net.manutencao.model.OrdemServico;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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

        // Ler a logo do classpath e converter para Base64
        try {
            InputStream is = getClass().getResourceAsStream("/templates/logo.png");
            if (is != null) {
                byte[] logoBytes = is.readAllBytes();
                String base64Logo = Base64.getEncoder().encodeToString(logoBytes);
                context.setVariable("logoBase64", base64Logo);
                System.out.println("✅ Logo carregada com sucesso do classpath");
            } else {
                context.setVariable("logoBase64", null);
                System.err.println("⚠️ Logo não encontrada no classpath: /templates/logo.png");
            }
        } catch (Exception e) {
            context.setVariable("logoBase64", null);
            System.err.println("❌ Erro ao carregar a logo: " + e.getMessage());
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
