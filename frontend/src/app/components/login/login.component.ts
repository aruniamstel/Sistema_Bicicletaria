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
      next: (res: any) => {
        console.log('Resposta Bruta:', res);

        // 1. EXTRAÇÃO BLINDADA: Tenta pegar o token e o usuário de qualquer lugar do objeto
        const token = res?.token;
        // Se 'res.usuario' existir, usa ele. Se não, tenta o 'res' direto (caso o back envie plano)
        const user = res?.usuario ? res.usuario : res;

        // 2. PERSISTÊNCIA IMEDIATA (Sem frescura)
        if (token) {
          localStorage.setItem('token', token);
        }

        // 3. VALIDAÇÃO DO ID (Usando String() para evitar o erro de toString)
        // Verificamos 'user.id' porque se 'user' for o 'res' plano, ele achará o ID ali.
        if (user && (user.id !== undefined && user.id !== null)) {
          
          // Atualiza o estado do serviço antes de tudo
          this.loginService.usuarioLogado = user;
          
          // Salva o ID na sessionStorage
          sessionStorage.setItem('id', String(user.id));
          
          // 4. REDIRECIONAMENTO
          // Se o perfil estiver no user.perfil ou direto no res.perfil
          const perfilFinal = user.perfil || res.perfil;
          this.redirecionarPorPerfil(perfilFinal);
          
        } else {
          console.error("Estrutura de usuário não encontrada. ID está ausente.");
          this.message = "Erro na estrutura de dados do servidor.";
          this.loading = false; // Importante para destravar o botão
        }
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
  console.log("Perfil recebido:", perfil); // Debug para confirmar o que vem do backend
  switch (perfil) {
    case "ADMIN": // Adicione este caso
      this.router.navigate(['/dashboard']);
      break;
    case "CLIENTE":
      this.router.navigate(['/dashboard']);
      break;
    case "FUNCIONARIO":
      this.router.navigate(['/dashboard']);
      break;
    default:
      // Se cair aqui, ele volta para o login, que é o que está acontecendo agora
      this.router.navigate(['/dashboard']); // Na dúvida, mande para o dashboard para a demo
      break;
  }
}
}
