import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { ConteudoService } from '../../../../services/conteudo.service';
import { AtividadeService } from '../../../../services/atividade.service';
import { ConteudoCreate, ConteudoLink, ConteudoUpdate } from '../../../../services/interfaces/conteudo-create.model';
import { Navbar2Component } from "../../../../navbar2/navbar2.component";

@Component({
  selector: 'app-criar-conteudo',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule, Navbar2Component],
  templateUrl: './criar-conteudo.component.html',
  styleUrls: ['./criar-conteudo.component.scss']
})
export class CriarConteudoComponent implements OnInit {
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
  conteudoParaDeletar: any = null;


  constructor(
    private fb: FormBuilder,
    private conteudoService: ConteudoService,
    private atividadeservice: AtividadeService,
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
    this.conteudoService.listarconteudo().subscribe({
      next: (res) => {
        this.conteudo = res;
      },
      error: (err) => {
        console.error('Erro ao carregar conteúdo', err);
        alert('Erro ao carregar conteúdo');
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
        alert('Erro ao carregar materiais');
      }
    });
  }

  // Escolher tipo de conteúdo
  setTipo(tipo: 'TEXTO' | 'PDF' | 'LINK') {
    this.tipoConteudo = tipo;
    const currentMaterialId = this.form.get('materialId')?.value;
    this.form.reset();
    this.form.patchValue({ materialId: currentMaterialId });
    this.selectedPdf = null;
  }

  // Seleção de PDF
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10 MB
      this.selectedPdf = file;
    } else {
      alert('Arquivo deve ter no máximo 10 MB');
      this.selectedPdf = null;
    }
  }

  // Criar conteúdo
  criarConteudo() {
    if (this.form.invalid && this.tipoConteudo !== 'PDF') {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;
    const dados = this.form.value;

    if (this.tipoConteudo === 'TEXTO') {
      const dto: ConteudoCreate = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        texto: dados.texto,
        materialId: dados.materialId
      };
      
      this.conteudoService.criarconteudo(dto).subscribe({
        next: () => {
          alert('Conteúdo criado com sucesso!');
          this.resetarForm();
          this.listarconteudo();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao criar conteúdo');
        },
        complete: () => {
          this.loading = false;
        }
      });
    } 
    else if (this.tipoConteudo === 'PDF') {
      if (!this.selectedPdf) {
        alert('Selecione um arquivo PDF');
        this.loading = false;
        return;
      }

      this.conteudoService.uploadPdf(this.selectedPdf, {
        titulo: dados.titulo,
        descricao: dados.descricao,
        texto: dados.texto,
        materialId: dados.materialId
      }).subscribe({
        next: () => {
          alert('PDF enviado com sucesso!');
          this.resetarForm();
          this.listarconteudo();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao enviar PDF');
        },
        complete: () => {
          this.loading = false;
        }
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
        next: () => {
          alert('Link criado com sucesso!');
          this.resetarForm();
          this.listarconteudo();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao criar link');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  // Visualizar conteúdo
  visualizarConteudo(conteudo: any) {
    this.conteudoSelecionado = conteudo;
  }

  // Fechar modal de visualização
  fecharModal() {
    this.conteudoSelecionado = null;
  }

  // Editar conteúdo
  editarConteudo(conteudo: any) {
    this.editandoConteudo = true;
    this.conteudoEditando = conteudo;
    
    // Preenche o formulário com os dados do conteúdo
    this.form.patchValue({
      titulo: conteudo.titulo,
      descricao: conteudo.descricao,
      texto: conteudo.texto || '',
      url: conteudo.url || '',
      materialId: conteudo.materialId
    });

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Atualizar conteúdo
  atualizarConteudo() {
    if (this.form.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;
    const formValues = this.form.value;

  // Cria payload apenas com campos preenchidos
    const payload: ConteudoUpdate = {};
    if (formValues.titulo) payload.titulo = formValues.titulo;
    if (formValues.descricao) payload.descricao = formValues.descricao;
    if (formValues.texto) payload.texto = formValues.texto;

  // Só envia url se não for vazio e começar com http/https
    if (formValues.url && (formValues.url.startsWith('http://') || formValues.url.startsWith('https://'))) {
      payload.url = formValues.url;
    }

    this.conteudoService.atualizar(this.conteudoEditando.id, payload).subscribe({
    next: () => {
      alert('Conteúdo atualizado com sucesso!');
      this.cancelarEdicao();
      this.listarconteudo();
    },
    error: (err) => {
      console.error(err);
      alert('Erro ao atualizar conteúdo');
    },
    complete: () => {
      this.loading = false;
    }
  });

  }

  // Cancelar edição
  cancelarEdicao() {
    this.editandoConteudo = false;
    this.conteudoEditando = null;
    this.resetarForm();
  }

  // Confirmar deleção
  confirmarDelecao(conteudo: any) {
    this.conteudoParaDeletar = conteudo;
  }

  // Cancelar deleção
  cancelarDelecao() {
    this.conteudoParaDeletar = null;
  }

  // Deletar conteúdo
  deletarConteudo() {
    if (!this.conteudoParaDeletar) return;

    this.loading = true;

    this.conteudoService.deletar(this.conteudoParaDeletar.id).subscribe({
      next: () => {
        alert('Conteúdo excluído com sucesso!');
        this.cancelarDelecao();
        this.listarconteudo();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao excluir conteúdo');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Download de PDF
  downloadPdf(id: string, titulo: string) {
    this.conteudoService.downloadPdf(id).subscribe({
      next: (blob) => {
        this.conteudoService.baixarArquivo(blob, `${titulo}.pdf`);
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao fazer download do PDF');
      }
    });
  }

  // Resetar formulário
  private resetarForm() {
    this.form.reset();
    this.selectedPdf = null;
    this.tipoConteudo = 'TEXTO';
  }

  // Formatar tamanho do arquivo
  formatarTamanhoArquivo(tamanhoBytes: number): string {
    if (tamanhoBytes === 0) return '0 Bytes';
    
    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(tamanhoBytes) / Math.log(k));
    
    return parseFloat((tamanhoBytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
  }


  //teste 

  
  
}

