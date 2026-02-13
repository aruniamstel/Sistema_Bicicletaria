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
  return this.http.get(`${this.apiUrl}/${entidade}`, {
    // Forçamos o TypeScript a tratar a string 'blob' como o tipo literal correto
    responseType: 'blob' as 'json' 
  }) as unknown as Observable<Blob>;
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
    const nome = nomeArquivo || `${entidade}_${new Date().getTime()}.csv`;
    return new Observable(observer => {
      this.exportarCsv(entidade).subscribe({
        next: (blob) => {
          this.realizarDownload(blob, nome);
          observer.next(blob);
          observer.complete();
        },
        error: (error) => {
          console.error('❌ Erro ao exportar CSV:', error);
          observer.error(error);
        }
      });
    });
  }
}
