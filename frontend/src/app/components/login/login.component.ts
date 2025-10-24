import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Login } from '../../shared/models/login.model';
import { LoginService } from '../../services/login.service';
import { Perfil } from '../../shared/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('formLogin') formLogin!: NgForm;  // Corrigido para garantir que a referência seja de um formulário
  login: Login = new Login();
  loading: boolean = false;
  message!: string;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    if (this.loginService.usuarioLogado) {
      // this.router.navigate(['/home']);
      console.log(this.loginService.usuarioLogado)
    } else {
      // Recebe a mensagem de erro, caso haja
      this.route.queryParams.subscribe(params => {
        this.message = params['error'] || ''; // Caso não haja erro, a mensagem fica vazia
      });
    }
  }

  logar(): void {
    this.loading = true;
  
    if (this.formLogin.form.valid) {
      this.loginService.login(this.login).subscribe({
        next: (usu) => {
          if (usu) {
            this.loginService.usuarioLogado = usu;
            sessionStorage.setItem('id', usu.id.toString()); //armazena o id do usuário durante a sessão
            this.redirecionarPorPerfil(usu.perfil);
          } else {
            this.message = "Usuário/senha inválido.";
          }
          this.loading = false;
        },
        error: (err) => {
          console.error("Erro no login:", err);
          this.message = "Ocorreu um erro inesperado.";
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
      this.message = "Preencha o formulário corretamente.";
    }
  }
  
  private redirecionarPorPerfil(perfil: string): void {
    switch (perfil) {
      case "CLIENTE":
        this.router.navigate(['/pgcliente']);
        break;
      case "FUNCIONARIO":
        this.router.navigate(['/solicitabertas']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
