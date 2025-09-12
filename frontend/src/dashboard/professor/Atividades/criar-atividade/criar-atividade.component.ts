import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Material, MaterialService } from '../../../../app/material/material.service';
import { Navbar2Component } from "../../../../navbar2/navbar2.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface AtividadeForm {
  titulo: string;
  descricao: string;
  conteudo: string;
  materia: Material; // Sempre será um objeto Material
  tipo: string;
  dificuldade: string;
  ativa: boolean;
  pontuacao: number | null;
  tempoEstimado: number | null;
  instrucoes: string;
  dataVencimento: string | null;
  materialId: string; // Aqui você quer garantir que sempre seja enviado o ID do material
}

@Component({
  selector: 'app-criar-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './criar-atividade.component.html',
  styleUrls: ['./criar-atividade.component.scss']
})
export class CriarAtividadeComponent {
@ViewChild('meuModal') meuModal!: TemplateRef<any>;

  atividade: AtividadeForm = {
    titulo: '',
    descricao: '',
    conteudo: '',
    materia: {
      id: '',
      titulo: '',
      conteudo: '',
      traducao: '',
      professorId: '',
      createdAt: '',
      updatedAt: ''
    },
    tipo: 'EXERCICIO',
    dificuldade: 'MEDIO',
    ativa: true,
    pontuacao: null,
    tempoEstimado: null,
    instrucoes: '',
    dataVencimento: null,
    materialId: ''
  };

  tipos = ['EXERCICIO', 'AULA', 'PROVA'];
  dificuldades = ['FACIL', 'MEDIO', 'DIFICIL'];
  materiais: Material[] = [];
  loadingMateriais = false;
  // Variáveis para o conteúdo dinâmico do modal
  tituloModal: string = '';
  mensagemModal: string = '';

  constructor(
    private atividadeService: AtividadeService,
    private router: Router,
    private materialService: MaterialService,
   	private modalService:  NgbModal,
  ) {}

 criarAtividade() {
  const atividadeToSend = {
    ...this.atividade,
    materia: this.atividade.materia.titulo,  // Mantém apenas o título
    materialId: this.atividade.materia.id     // Envia o ID
  };

  console.log('Dados enviados para criar atividade:', atividadeToSend);

  this.atividadeService.criarAtividade(atividadeToSend).subscribe({
    next: (response) => {
      this.tituloModal = 'Sucesso!';
      this.mensagemModal = 'Atividade criada com sucesso!';
       // Abre o modal e espera o resultado (quando o usuário clica em OK)
      this.modalService.open(this.meuModal).result.then(
        (result) => {
          // SÓ EXECUTA DEPOIS que o usuário clica no botão "OK" (modal.close())
          console.log('Modal fechado com sucesso:', result);
          this.router.navigate(['/atividades']);
    },
    )
  },
    error: (error) => {
      this.tituloModal = 'Erro';
      this.mensagemModal = 'Ocorreu um erro ao criar a atividade. Por favor, tente novamente.';
      this.modalService.open(this.meuModal); // Aqui, apenas abrimos o modal de erro
    }
  });
}



  ngOnInit() {
    this.carregarMateriais();
  }

  carregarMateriais() {
    this.loadingMateriais = true;
    this.materialService.findAll({}).subscribe({
      next: (materiais) => {
        this.materiais = materiais;
        this.loadingMateriais = false;
      },
      error: (err) => {
        console.error('Erro ao carregar materiais:', err);
        this.loadingMateriais = false;
      }
    });
  }
}
