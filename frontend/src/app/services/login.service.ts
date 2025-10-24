import{ Injectable} from'@angular/core';
import{ catchError, map, Observable, of, throwError} from 'rxjs';
import { Usuario, Login } from '../shared/models'

import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

const LS_CHAVE: string= "usuarioLogado";

@Injectable({ providedIn: 'root'})
export class LoginService {

  BASE_URL = "http://localhost:8081/login";

  httpOptions = {

    observe : "response" as "response",
    headers : new HttpHeaders({
      'Content-Type' : 'application/json'
    })
  }
  constructor(private httpClient : HttpClient) { }

  public get usuarioLogado(): Usuario{
    let usu= localStorage[LS_CHAVE];
    return(usu? JSON.parse(localStorage[LS_CHAVE]) : null);
    }
    public set usuarioLogado(usuario: Usuario) {
    localStorage[LS_CHAVE] = JSON.stringify(usuario);
    } 
   logout() {
    delete localStorage[LS_CHAVE];
    }

    login(login: Login): Observable<Usuario | null> {

      return this.httpClient.post<Usuario>
      (this.BASE_URL, JSON.stringify(login),this.httpOptions)
      .pipe(
        map(( resp : HttpResponse<Usuario>) => {
          if (resp.status === 200) {
            return resp.body;
          } else {
            return null;
          }
        }),
        catchError((err) => {
          if (err.status === 401) {
            return of(null);  // Retorna null em caso de erro 401
          } else {
            return throwError(() => err);  // Lança outro erro caso contrário
          }
        })
      );
      
    }
    
    
      
}
