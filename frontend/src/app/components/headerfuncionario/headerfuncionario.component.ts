import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; // Importa o módulo para dropdowns

@Component({
  selector: 'app-headerfuncionario',
  standalone: true,
  imports: [RouterLink, NgbDropdownModule],
  templateUrl: './headerfuncionario.component.html',
  styleUrl: './headerfuncionario.component.css'
})
export class HeaderfuncionarioComponent {

}
