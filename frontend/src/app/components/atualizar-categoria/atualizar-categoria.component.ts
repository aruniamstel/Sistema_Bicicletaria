import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Categoria } from '../../shared/models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderfuncionarioComponent } from "../headerfuncionario/headerfuncionario.component";

@Component({
  selector: 'app-atualizar-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderfuncionarioComponent],
  templateUrl: './atualizar-categoria.component.html',
  styleUrl: './atualizar-categoria.component.css'
})
export class AtualizarCategoriaComponent implements OnInit {
  @ViewChild('formCategoria') formCategoria! : NgForm;
  categoria: any = { nome: '' };  // Estrutura para armazenar a categoria a ser editada

  constructor(
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');  // Obter o id da URL
    if (id) {
      this.categoriaService.buscarPorId(Number(id)).subscribe(categoria => {
        this.categoria = categoria;  // Carregar os dados da categoria
      });
    }
  }
  
  atualizarCategoria() {
    console.log('Categoria a ser atualizada:', this.categoria);
    if (this.categoria.id) {
      this.categoriaService.atualizarPorNome(this.categoria).subscribe(
        (response) => {
          alert('Categoria atualizada com sucesso!');
          this.router.navigate(['/categorias/listar']);
        },
        (error) => {
          console.error('Erro ao atualizar categoria', error);
          alert('Erro ao atualizar a categoria. Tente novamente mais tarde.');
        }
      );
    }
  }
  
  
}

