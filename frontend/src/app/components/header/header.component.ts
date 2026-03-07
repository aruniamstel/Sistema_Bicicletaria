import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { StatusOrdem } from '../../shared/models/ordem-servico.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  ordensPendentes = 0;
  menuAberto = false;

  constructor(private ordemService: OrdemServicoService) {}

  ngOnInit() {
    //this.carregarOrdensPendentes();
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

 /* carregarOrdensPendentes() {
    this.ordemService.getAll().subscribe(ordens => {
      this.ordensPendentes = ordens.filter(o => 
        o.status === StatusOrdem.ABERTA || o.status === StatusOrdem.EM_ANDAMENTO
      ).length;
    });
  } */
}