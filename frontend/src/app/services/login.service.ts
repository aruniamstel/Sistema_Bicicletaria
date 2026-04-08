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
  // Simplificamos os headers e removemos o observe: "response"
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  return this.httpClient.post<any>(this.BASE_URL, JSON.stringify(login), { headers }).pipe(
    map((res) => {
      // Em produção, o 'res' já é o corpo do JSON {usuario: {...}, token: "..."}
      if (res && res.token) {
        localStorage.setItem(TOKEN_CHAVE, res.token);
        // Opcional: já salvar o usuário aqui para garantir
        if (res.usuario) {
          localStorage.setItem(LS_CHAVE, JSON.stringify(res.usuario));
        }
        return res;
      }
      return null;
    }),
    catchError((err) => {
      console.error("Erro no service:", err);
      return throwError(() => err);
    })
  );
}
}