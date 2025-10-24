import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../shared/models/categoria.model';

export interface SolicitacaoCreateDTO {
    description : String,
    categoria : Categoria,
    defeito : String,
    idCliente : String
};

@Injectable({
    providedIn: 'root',
})
export class SolicitacaoManutencaoService {
    private apiUrl = 'http://localhost:8081/api/solicitacaomanutencao';

    constructor(private http: HttpClient) {}

    enviarSolicitacao(solicitacao: SolicitacaoCreateDTO): Observable<any> {
        return this.http.post(this.apiUrl, solicitacao);
    }
}
