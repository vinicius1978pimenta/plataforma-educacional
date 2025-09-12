import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { ConteudoService } from '../../../../services/conteudo.service';
import { AtividadeService } from '../../../../services/atividade.service';
import { ConteudoCreate, ConteudoLink, ConteudoUpdate } from '../../../../services/interfaces/conteudo-create.model';
import { Navbar2Component } from "../../../../navbar2/navbar2.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-criar-conteudo',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule, Navbar2Component],
  templateUrl: './criar-conteudo.component.html',
  styleUrls: ['./criar-conteudo.component.scss']
})
export class CriarConteudoComponent implements OnInit {
  @ViewChild('modalAviso') modalAviso!: TemplateRef<any>;
  @ViewChild('modalExclusao') modalExclusao!: TemplateRef<any>;

  form!: FormGroup;
  tipoConteudo: 'TEXTO' | 'PDF' | 'LINK' = 'TEXTO';
  selectedPdf: File | null = null;
  materiais: any[] = []; 
  loading = false;
  conteudo: any[] = [];
  
  // Variáveis para edição
  editandoConteudo = false;
  conteudoEditando: any = null;
  
  // Variáveis para modal
  conteudoSelecionado: any = null;
  // conteudoParaDeletar não é mais necessário
  tituloModal: string = '';
  mensagemModal: string = '';

  constructor(
    private fb: FormBuilder,
    private conteudoService: ConteudoService,
    private atividadeservice: AtividadeService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
    this.listarconteudo();
    this.carregarMateriais();
  }

  inicializarForm() {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      texto: [''],
      url: [''],
      materialId: ['', Validators.required]
    });
  }

  listarconteudo() {
    this.conteudoService.listarconteudo('').subscribe({
      next: (res) => {
        this.conteudo = res;
      },
      error: (err) => {
        console.error('Erro ao carregar conteúdo', err);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Não foi possível carregar a lista de conteúdos.';
        this.modalService.open(this.modalAviso, { centered: true });
      }
    });
  }

  carregarMateriais() {
    this.atividadeservice.getMateriais().subscribe({
      next: (res) => {
        this.materiais = res;
      },
      error: (err) => {
        console.error('Erro ao carregar materiais', err);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Não foi possível carregar a lista de matérias.';
        this.modalService.open(this.modalAviso, { centered: true });
      }
    });
  }

  setTipo(tipo: 'TEXTO' | 'PDF' | 'LINK') {
    this.tipoConteudo = tipo;
    const currentMaterialId = this.form.get('materialId')?.value;
    this.form.reset();
    this.form.patchValue({ materialId: currentMaterialId });
    this.selectedPdf = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10 MB
      this.selectedPdf = file;
    } else {
      this.tituloModal = 'Atenção';
      this.mensagemModal = 'O arquivo deve ter no máximo 10 MB.';
      this.modalService.open(this.modalAviso, { centered: true });
      this.selectedPdf = null;
      // Limpa o input de arquivo se o arquivo for inválido
      const fileInput = event.target as HTMLInputElement;
      fileInput.value = '';
    }
  }

  criarConteudo() {
    if (this.form.invalid && this.tipoConteudo !== 'PDF' && !this.form.get('titulo')?.value) {
      this.tituloModal = 'Atenção';
      this.mensagemModal = 'Preencha todos os campos obrigatórios.';
      this.modalService.open(this.modalAviso, { centered: true });
      return;
    }

    this.loading = true;
    const dados = this.form.value;

    const onSucesso = () => {
      this.tituloModal = 'Sucesso!';
      this.mensagemModal = 'Conteúdo criado com sucesso!';
      this.modalService.open(this.modalAviso, { centered: true });
      this.resetarForm();
      this.listarconteudo();
    };

    const onError = (mensagem: string) => {
      this.tituloModal = 'Erro';
      this.mensagemModal = mensagem;
      this.modalService.open(this.modalAviso, { centered: true });
    };

    if (this.tipoConteudo === 'TEXTO') {
      const dto: ConteudoCreate = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        texto: dados.texto,
        materialId: dados.materialId
      };
      this.conteudoService.criarconteudo(dto).subscribe({
        next: onSucesso,
        error: (err) => { console.error(err); onError('Erro ao criar conteúdo de texto.'); },
        complete: () => { this.loading = false; }
      });
    } 
    else if (this.tipoConteudo === 'PDF') {
      if (!this.selectedPdf || !dados.titulo || !dados.descricao || !dados.materialId) {
        this.tituloModal = 'Atenção';
        this.mensagemModal = 'Título, descrição, matéria e um arquivo PDF são obrigatórios.';
        this.modalService.open(this.modalAviso, { centered: true });
        this.loading = false;
        return;
      }
      this.conteudoService.uploadPdf(this.selectedPdf, {
        titulo: dados.titulo,
        descricao: dados.descricao,
        texto: dados.texto,
        materialId: dados.materialId
      }).subscribe({
        next: onSucesso,
        error: (err) => { console.error(err); onError('Erro ao enviar o PDF.'); },
        complete: () => { this.loading = false; }
      });
    } 
    else if (this.tipoConteudo === 'LINK') {
      const dto: ConteudoLink = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        texto: dados.texto,
        url: dados.url,
        materialId: dados.materialId
      };
      this.conteudoService.criarLink(dto).subscribe({
        next: onSucesso,
        error: (err) => { console.error(err); onError('Erro ao criar o link.'); },
        complete: () => { this.loading = false; }
      });
    }
  }

  visualizarConteudo(conteudo: any) {
    this.conteudoSelecionado = conteudo;
  }

  fecharModal() {
    this.conteudoSelecionado = null;
  }

  editarConteudo(conteudo: any) {
    this.editandoConteudo = true;
    this.conteudoEditando = conteudo;
    this.form.patchValue({
      titulo: conteudo.titulo,
      descricao: conteudo.descricao,
      texto: conteudo.texto || '',
      url: conteudo.url || '',
      materialId: conteudo.materialId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  atualizarConteudo() {
    if (this.form.invalid) {
      this.tituloModal = 'Atenção';
      this.mensagemModal = 'Preencha todos os campos obrigatórios.';
      this.modalService.open(this.modalAviso, { centered: true });
      return;
    }

    this.loading = true;
    const formValues = this.form.value;
    const payload: ConteudoUpdate = {};
    if (formValues.titulo) payload.titulo = formValues.titulo;
    if (formValues.descricao) payload.descricao = formValues.descricao;
    if (formValues.texto) payload.texto = formValues.texto;
    if (formValues.url && (formValues.url.startsWith('http://') || formValues.url.startsWith('https://'))) {
      payload.url = formValues.url;
    }

    this.conteudoService.atualizar(this.conteudoEditando.id, payload).subscribe({
      next: () => {
        this.tituloModal = 'Sucesso!';
        this.mensagemModal = 'Conteúdo atualizado com sucesso!';
        this.modalService.open(this.modalAviso, { centered: true });
        this.cancelarEdicao();
        this.listarconteudo();
      },
      error: (err) => {
        console.error(err);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Erro ao atualizar o conteúdo.';
        this.modalService.open(this.modalAviso, { centered: true });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  cancelarEdicao() {
    this.editandoConteudo = false;
    this.conteudoEditando = null;
    this.resetarForm();
  }

  // Deletar conteúdo (SUA FUNÇÃO JÁ CORRIGIDA)
  excluirConteudo(conteudo: any) {
    this.modalService.open(this.modalExclusao, { centered: true }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.loading = true;
          this.conteudoService.deletar(conteudo.id).subscribe({
            next: () => {
              this.tituloModal = 'Sucesso!';
              this.mensagemModal = 'Conteúdo excluído com sucesso!';
              this.modalService.open(this.modalAviso, { centered: true });
              this.listarconteudo();
              this.loading = false;
            },
            error: (err) => {
              console.error(err);
              this.tituloModal = 'Erro';
              this.mensagemModal = 'Erro ao excluir conteúdo.';
              this.modalService.open(this.modalAviso, { centered: true });
              this.loading = false;
            }
          });
        }
      },
      (reason) => {
        console.log('Exclusão cancelada.');
      }
    );
  }

  downloadPdf(id: string, titulo: string) {
    this.conteudoService.downloadPdf(id).subscribe({
      next: (blob) => {
        this.conteudoService.baixarArquivo(blob, `${titulo}.pdf`);
      },
      error: (err) => {
        console.error(err);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Erro ao fazer o download do PDF.';
        this.modalService.open(this.modalAviso, { centered: true });
      }
    });
  }

  private resetarForm() {
    const currentMaterialId = this.form.get('materialId')?.value;
    this.form.reset();
    this.selectedPdf = null;
    this.tipoConteudo = 'TEXTO';
    this.form.patchValue({ materialId: currentMaterialId });
  }

  formatarTamanhoArquivo(tamanhoBytes: number): string {
    if (tamanhoBytes === 0) return '0 Bytes';
    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(tamanhoBytes) / Math.log(k));
    return parseFloat((tamanhoBytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
  }
}