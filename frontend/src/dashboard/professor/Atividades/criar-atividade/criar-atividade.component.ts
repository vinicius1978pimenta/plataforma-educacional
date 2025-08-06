import { Component } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-criar-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './criar-atividade.component.html',
  styleUrls: ['./criar-atividade.component.scss']
})
export class CriarAtividadeComponent {

  atividade = {
    titulo: '',
    descricao: '',
    conteudo: '',
    materia: '',
    tipo: ' ',  // Valor inicial, pode ser alterado
    dificuldade: ' ',  // Valor inicial, pode ser alterado
    ativa: true
  };

  tipos = ['Exercício', 'Aula', 'Prova'];  // Tipos de atividades
  dificuldades = ['Fácil', 'Médio', 'Difícil  '];  // Níveis de dificuldade

  constructor(private atividadeService: AtividadeService, private router: Router) {}

  criarAtividade() {
    // Enviando os dados para o backend através do serviço
    this.atividadeService.criarAtividade(this.atividade).subscribe(
      response => {
        alert('Atividade criada com sucesso!');
        this.router.navigate(['/atividades']);  // Navega para a página de visualização de atividades
      },
      error => {
        console.error('Erro ao criar atividade', error);
        alert('Erro ao criar atividade');
      }
    );
  }
}
