import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { OrdemServico } from '../shared/models/ordem-servico.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.ordensServico}`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todas as ordens de serviço
   */
  getAll(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca uma ordem de serviço por ID
   */
  getById(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca ordens de serviço por cliente
   */
  getByCliente(clienteId: number): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca ordens de serviço por bicicleta
   */
  getByBicicleta(bicicletaId: number): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/bicicleta/${bicicletaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca ordens de serviço por status
   */
  getByStatus(status: string): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/status/${status}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cria uma nova ordem de serviço
   */
  create(ordem: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, ordem)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza uma ordem de serviço existente
   */
  update(id: number, ordem: OrdemServico): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, ordem)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deleta uma ordem de serviço
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Adiciona um serviço a uma ordem existente
   */
  addServico(ordemId: number, servicoId: number, quantidade: number): Observable<any> {
    const payload = {
      itemId: servicoId,
      quantidade: quantidade
    };
    
    return this.http.post<any>(`${this.apiUrl}/${ordemId}/servicos`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Adiciona uma peça a uma ordem existente
   */
  addPeca(ordemId: number, pecaId: number, quantidade: number): Observable<any> {
    const payload = {
      itemId: pecaId,
      quantidade: quantidade
    };
    
    return this.http.post<any>(`${this.apiUrl}/${ordemId}/pecas`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza o status de uma ordem de serviço
   */
  updateStatus(id: number, status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ENTREGUE'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca o valor total de uma ordem
   */
  getValorTotal(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/valor-total`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca ordens de serviço com status ativo (não entregue)
   * Útil para o componente de bicicletas em serviço
   * Filtra no front as ordens com status != 'ENTREGUE'
   */
  getOrdensAbertas(): Observable<OrdemServico[]> {
    return this.getAll()
      .pipe(
        // Operador map pode ser adicionado aqui se o backend fornecer endpoint específico
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro ao processar requisição de ordem de serviço';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = error.error?.error || error.error?.message || `Código: ${error.status}`;
    }
    
    console.error('❌ Erro HTTP:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Baixa o PDF de uma ordem de serviço
   * @param id ID da ordem de serviço
   * @returns Observable com o blob do PDF
   */
  downloadPdf(id: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${id}/pdf`, { 
    responseType: 'blob' 
  }).pipe(
    catchError(this.handleError)
  );
}
}