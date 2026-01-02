import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { BicicletaManagerComponent } from "./BicicletaManagerComponent/bicicleta-manager.component";
import { ServicoManagerComponent } from "./ServicoManagerComponent/servico-manager.component";
import { EstoqueManagerComponent } from "./EstoqueManagerComponent/estoque-manager.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    BicicletaManagerComponent,
    ServicoManagerComponent,
    EstoqueManagerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  activeTab: 'bicicletas' | 'servicos' | 'pecas' = 'bicicletas';

  setActiveTab(tab: 'bicicletas' | 'servicos' | 'pecas'): void {
    this.activeTab = tab;
  }
}