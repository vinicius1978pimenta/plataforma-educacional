import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ConteudoService } from '../../../../services/conteudo.service';
import { AtividadeService } from '../../../../services/atividade.service';
import { ConteudoCreate } from '../../../../services/interfaces/conteudo-create.model';

@Component({
  selector: 'app-criar-conteudo',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './criar-conteudo.component.html',
  styleUrls: ['./criar-conteudo.component.scss']
})
export class CriarConteudoComponent implements OnInit {
  form!: FormGroup;
  materias: any[] = [];
  tipos = ['texto', 'link', 'pdf'];
  selectedPdf: File | undefined;
  conteudos: any[] = [];
  editId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private conteudoService: ConteudoService,
    private atividadeService: AtividadeService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descricao: [''],
      texto: ['', Validators.required],
      materialId: ['', Validators.required],
      tipo: ['texto', Validators.required],
    });

    // Carregar matérias PRIMEIRO
    this.atividadeService.getMateriais().subscribe({
      next: (materiais: any[]) => {
        this.materias = materiais;
        // Só carregar conteúdos APÓS as matérias estarem disponíveis
        this.carregarConteudos();
      },
      error: (err) => console.error('Erro ao carregar matérias:', err)
    });
  }

  criarConteudo() {
    if (this.form.invalid) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const dto: ConteudoCreate = {
      titulo: this.form.value.titulo,
      descricao: this.form.value.descricao,
      texto: this.form.value.texto,
      materialId: this.form.value.materialId,
    };

    this.conteudoService.criarconteudo(dto).subscribe({
      next: () => {
        alert('Conteúdo criado com sucesso!');
        this.form.reset({ tipo: 'texto' });
        this.selectedPdf = undefined;
        this.carregarConteudos();
      },
      error: (err) => {
        console.error('Erro ao criar conteúdo:', err);
        alert('Erro ao criar conteúdo');
      }
    });
  }

  onPdfSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos!');
        return;
      }
      this.selectedPdf = file;
      this.form.patchValue({ texto: file.name });
    }
  }

  carregarConteudos() {
    this.conteudoService.listarconteudo().subscribe({
      next: (res) => {
        // Mapear cada conteúdo com o nome da matéria e ordenar
        this.conteudos = res.map(c => {
          const materia = this.materias.find(m => m.id === c.materialId);
          return { ...c, materialNome: materia ? materia.titulo : 'Matéria não encontrada' };
        }).sort((a, b) => {
          // Ordenar por data de criação (mais antigos primeiro)
          // Se não tiver campo de data, ordena por ID (assumindo que IDs crescem cronologicamente)
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else if (a.id && b.id) {
            return a.id.localeCompare(b.id);
          }
          return 0;
        });
      },
      error: (err) => console.error('Erro ao listar conteúdos:', err)
    });
  }

  deletarConteudo(id: string) {
    if (!confirm('Tem certeza que deseja deletar este conteúdo?')) return;

    this.conteudoService.deletarconteudo(id).subscribe({
      next: () => this.carregarConteudos(),
      error: (err) => console.error('Erro ao deletar conteúdo:', err)
    });
  }

  iniciarEdicao(conteudo: any) {
    console.log('Iniciando edição:', conteudo);
    this.editId = conteudo.id;

    this.form.patchValue({
      titulo: conteudo.titulo,
      descricao: conteudo.descricao,
      texto: conteudo.texto,
      materialId: conteudo.materialId,
      tipo: conteudo.tipo
    });
  }

  concluirEdicao() {
    if (!this.editId) return;

    // Cria o DTO apenas com os valores preenchidos
    const dto: any = {};
    if (this.form.value.titulo) dto.titulo = this.form.value.titulo;
    if (this.form.value.descricao) dto.descricao = this.form.value.descricao;
    if (this.form.value.texto) dto.texto = this.form.value.texto;
    if (this.form.value.materialId) dto.materialId = this.form.value.materialId;
    if (this.form.value.tipo) dto.tipo = this.form.value.tipo;

    if (!confirm('Deseja salvar alterações desse conteúdo?')) return;

    this.conteudoService.atualizarconteudo(this.editId, dto).subscribe({
      next: () => {
        alert('Conteúdo atualizado!');
        this.editId = null;
        this.form.reset({ tipo: 'texto' });
        this.selectedPdf = undefined;
        this.carregarConteudos();
      },
      error: (err) => console.error('Erro ao atualizar conteúdo:', err)
    });
  }

  cancelarEdicao() {
    this.editId = null;
    this.form.reset({ tipo: 'texto' });
    this.selectedPdf = undefined;
  }
}