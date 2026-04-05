import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Usuario, Login } from '../shared/models';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

const LS_CHAVE: string = "usuarioLogado";
const TOKEN_CHAVE: string = "token"; // Nova chave para o JWT

@Injectable({ providedIn: 'root' })
export class LoginService {

  BASE_URL = environment.apiUrl + '/login';

  httpOptions = {
    observe: "response" as "response",
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private httpClient: HttpClient) { }

  public get usuarioLogado(): Usuario | null {
    let usu = localStorage[LS_CHAVE];
    return (usu ? JSON.parse(usu) : null);
  }

  public set usuarioLogado(usuario: Usuario) {
    localStorage[LS_CHAVE] = JSON.stringify(usuario);
  }

  logout() {
    localStorage.removeItem(LS_CHAVE);
    localStorage.removeItem(TOKEN_CHAVE); // Limpa o token no logout
  }

  // Mudamos o retorno para 'any' porque agora recebemos um objeto com {usuario, token}
  login(login: Login): Observable<any> {
    return this.httpClient.post<any>(
      this.BASE_URL, 
      JSON.stringify(login), 
      this.httpOptions
    ).pipe(
      map((resp: HttpResponse<any>) => {
        if (resp.status === 200 && resp.body) {
          // SALVANDO O TOKEN: O segredo está aqui
          localStorage.setItem(TOKEN_CHAVE, resp.body.token);
          
          // Retornamos o objeto completo para o componente
          return resp.body; 
        } else {
          return null;
        }
      }),
      catchError((err) => {
        if (err.status === 401) {
          alert("Login ou senha inválidos!");
          return of(null);
        } else {
          alert("Erro ao tentar efetuar login");
          return throwError(() => err);
        }
      })
    );
  }
}