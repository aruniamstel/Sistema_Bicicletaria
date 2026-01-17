import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { BicicletaManagerComponent } from "./BicicletaManagerComponent/bicicleta-manager.component";
import { ServicoManagerComponent } from "./ServicoManagerComponent/servico-manager.component";
import { EstoqueManagerComponent } from "./EstoqueManagerComponent/estoque-manager.component";
import { ClienteManagerComponent } from "./ClienteManagerComponent/cliente-manager.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    BicicletaManagerComponent,
    ServicoManagerComponent,
    EstoqueManagerComponent,
    ClienteManagerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  activeTab: 'bicicletas' | 'servicos' | 'pecas' | 'clientes' = 'bicicletas';

  setActiveTab(tab: 'bicicletas' | 'servicos' | 'pecas' | 'clientes'): void {
    this.activeTab = tab;
  }
}