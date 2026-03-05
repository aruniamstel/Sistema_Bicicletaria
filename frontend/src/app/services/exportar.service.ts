import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportarService {
  private apiUrl = `${environment.apiUrl}/api/exportar`;

  constructor(private http: HttpClient) {}

  /**
   * Exporta dados em CSV e força download automático
   * @param entidade - tipo de entidade: 'clientes', 'bicicletas', 'pecas', 'ordens'
   */
  exportarCsv(entidade: string): Observable<Blob> {
    if (!entidade || entidade.trim().length === 0) {
      throw new Error('Entidade não pode estar vazia');
    }

    const url = `${this.apiUrl}/${entidade.toLowerCase().trim()}`;
    console.log('📥 Requisição de exportação:', url);

    return this.http.get(url, {
      responseType: 'blob' as const
    });
  }

  /**
   * Realiza download do arquivo CSV
   * @param blob - dados do arquivo
   * @param nomeArquivo - nome do arquivo a ser baixado
   */
  realizarDownload(blob: Blob, nomeArquivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exporta e baixa automaticamente
   * @param entidade - tipo de entidade
   * @param nomeArquivo - nome do arquivo (opcional, será gerado automaticamente se não informado)
   */
  exportarEBaixar(entidade: string, nomeArquivo?: string): Observable<Blob> {
    const nome = nomeArquivo || `${entidade.toLowerCase()}_${new Date().getTime()}.csv`;
    
    return new Observable(observer => {
      this.exportarCsv(entidade).subscribe({
        next: (blob) => {
          console.log('✅ CSV recebido com sucesso. Tamanho:', blob.size, 'bytes');
          this.realizarDownload(blob, nome);
          observer.next(blob);
          observer.complete();
        },
        error: (error) => {
          console.error('❌ Erro ao exportar CSV:', error);
          const errorMsg = error?.error?.message || error?.message || 'Erro desconhecido ao exportar';
          observer.error(new Error(errorMsg));
        }
      });
    });
  }

  /**
   * Importa dados do CSV para a entidade especificada
   * @param entidade - tipo de entidade: 'clientes', 'bicicletas', 'pecas', 'servicos'
   * @param arquivo - arquivo CSV selecionado pelo usuário
   * @returns Observable<string> com mensagem de sucesso ou erro
   */
  importarCsv(entidade: string, arquivo: File): Observable<string> {
    if (!entidade || entidade.trim().length === 0) {
      throw new Error('Entidade não pode estar vazia');
    }

    if (!arquivo) {
      throw new Error('Arquivo não foi selecionado');
    }

    const formData = new FormData();
    formData.append('file', arquivo);

    const url = `${this.apiUrl}/importar/${entidade.toLowerCase().trim()}`;
    console.log('📤 Requisição de importação:', url, 'Arquivo:', arquivo.name);

    return this.http.post(url, formData, {
      responseType: 'text'
    });
  }
}
