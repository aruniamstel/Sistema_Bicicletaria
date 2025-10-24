import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../shared/models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { SolicitacaoCreateDTO } from '../../shared/models/SolicitacaoCreateDTO';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SolicitacaoService } from '../../services/solicitacao.service'; // Importando o serviço
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nova-solicitacao',
  templateUrl: './nova-solicitacao.component.html',
  styleUrls: ['./nova-solicitacao.component.css'],
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent],
  standalone: true
})
export class NovaSolicitacaoComponent implements OnInit {
  solicitacaoForm: FormGroup;
  categorias$: Observable<Categoria[]> | undefined;
 

  constructor(
    private fb: FormBuilder, 
    private categoriaService: CategoriaService,
    private solicitacaoService: SolicitacaoService,
    private http: HttpClient,
    private router: Router
  ) {
    this.solicitacaoForm = this.fb.group({
      description: ['', Validators.required],
      categoria: ['', Validators.required],
      defeito: ['', Validators.required],
      idCliente: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.categorias$ = this.categoriaService.listarTodos(); // Carregar as categorias
    const idCliente = sessionStorage.getItem("id");
    if (idCliente) {
      this.solicitacaoForm.patchValue({
        idCliente: idCliente // Preenche o campo idCliente com o valor do sessionStorage
      });
    }
  }

  onSubmit(): void {
    if (this.solicitacaoForm.valid) {
      const formValue = this.solicitacaoForm.value;
  
      // Transformar o ID da categoria selecionada em um objeto Categoria
      const categoriaSelecionada: Categoria = {
        id: formValue.categoria, 
        nome: '', 
      };
  
      const solicitacaoDTO: SolicitacaoCreateDTO = {
        ...formValue,
        categoria: categoriaSelecionada 
      };
  
      console.log(solicitacaoDTO);
  
      // Chama o método do serviço para enviar os dados
      this.solicitacaoService.createSolicitacao(solicitacaoDTO).subscribe(
        response => {
          console.log('Solicitação criada com sucesso', response);
          this.router.navigate (["pgcliente"]);
        },
        error => {
          console.error('Erro ao criar solicitação', error);
          // Tratamento de erro
        }
      );
    }
  }
  
}
