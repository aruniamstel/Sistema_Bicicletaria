import { Component, OnInit } from '@angular/core';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { jsPDF } from 'jspdf';
import { HeaderfuncionarioComponent } from "../headerfuncionario/headerfuncionario.component";
import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-relatoriodata',
    standalone: true,
    imports: [HeaderfuncionarioComponent, NgFor, CommonModule, FormsModule],
    templateUrl: './relatoriodata.component.html',
    styleUrls: ['./relatoriodata.component.css']
})
export class RelatoriodataComponent implements OnInit {
    requests: { date: string; receita: number }[] = [];
    filteredRequests: { date: string; receita: number }[] = [];
    startDate: string = '';
    endDate: string = '';

    constructor(private solicitacaoService: SolicitacaoService) { }

    ngOnInit() {
        this.solicitacaoService.listarFinalizadasPorData().subscribe(data => {
            this.requests = data.map(item => ({
                date: item[0], 
                receita: item[1] 
            }));
            this.filtrarPorData();
        });
    }

    filtrarPorData() {
        if (!this.startDate && !this.endDate) {
            this.filteredRequests = this.agruparReceitas(this.requests);
        } else {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            const filtered = this.requests.filter(request => {
                const requestDate = new Date(request.date);
                return requestDate >= start && requestDate <= end;
            });
            this.filteredRequests = this.agruparReceitas(filtered);
        }
    }

    gerarPDF() {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Relatório de Receitas por Data/Período", 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text("Data", 20, 30);
        doc.text("Receita (R$)", 100, 30);

        let y = 40;
        for (const request of this.filteredRequests) {
            doc.text(request.date, 20, y);
            doc.text(request.receita.toFixed(2), 100, y);
            y += 10;
        }

        const periodo = (!this.startDate && !this.endDate) ? 'Todo o Período' : `${this.startDate || ''} a ${this.endDate || ''}`;
        const total = `TOTAL: ${this.calcularSomaReceita().toFixed(2)}`;

        doc.setFont("helvetica", "bold");
        doc.text(`PERÍODO: ${periodo}`, 20, y);
        doc.text(total, 100, y); 
        y += 10;

        doc.setFont("helvetica", "normal");

        doc.save("relatorio_receitas.pdf");
    }

    calcularSomaReceita(): number {
        return this.filteredRequests.reduce((soma, request) => soma + request.receita, 0);
    }

    private agruparReceitas(requests: { date: string; receita: number }[]): { date: string; receita: number }[] {
        const mapaReceitas = new Map<string, number>();

        requests.forEach(request => {
            const receitaAtual = mapaReceitas.get(request.date) || 0;
            mapaReceitas.set(request.date, receitaAtual + request.receita);
        });

        return Array.from(mapaReceitas.entries()).map(([date, receita]) => ({ date, receita }));
    }
}
