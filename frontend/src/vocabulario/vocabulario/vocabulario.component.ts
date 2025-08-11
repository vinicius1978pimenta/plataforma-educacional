import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VocabularioService } from '../../services/vocabulario.service';
import { Vocabulario, VocabularioDto } from '../../services/interfaces/vocabulario.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vocabulario',
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './vocabulario.component.html',
  styleUrl: './vocabulario.component.scss'
})
export class VocabularioComponent implements OnInit {
 
 private fb = inject(FormBuilder);
  private vocabularioService = inject(VocabularioService);

  vocabularioForm: FormGroup;
  vocabularios$ = this.vocabularioService.vocabularios$;
  
  carregando = false;
  carregandoLista = false;
  excluindo: string | null = null;
  mensagem: string | null = null;
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  constructor() {
    this.vocabularioForm = this.fb.group({
      palavra: ['', [Validators.required, Validators.minLength(1)]],
      traducao: [''],
      idioma: ['es']
    });
  }

  ngOnInit() {
    
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      this.mostrarMensagem('Você precisa estar logado para acessar o vocabulário', 'erro');
      return;
    }
    
    
    this.carregarVocabularios();
  }

  carregarVocabularios() {
    this.carregandoLista = true;
    this.vocabularioService.carregarVocabularios().subscribe({
      next: () => {
        this.carregandoLista = false;
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao carregar vocabulários', 'erro');
        this.carregandoLista = false;
      }
    });
  }

  adicionarPalavra() {
    if (this.vocabularioForm.valid) {
      this.carregando = true;
      
      const dto: VocabularioDto = {
        palavra: this.vocabularioForm.get('palavra')?.value.trim(),
        traducao: this.vocabularioForm.get('traducao')?.value?.trim() || undefined,
        idioma: this.vocabularioForm.get('idioma')?.value
      };

      this.vocabularioService.adicionarVocabulario(dto).subscribe({
        next: () => {
          this.vocabularioForm.reset({ idioma: 'es' });
          this.mostrarMensagem('Palavra adicionada com sucesso!', 'sucesso');
          this.carregando = false;
        },
        error: (error) => {
          this.mostrarMensagem('Erro ao adicionar palavra', 'erro');
          this.carregando = false;
        }
      });
    }
  }

  excluirPalavra(id: string, palavra: string) {
    if (confirm(`Tem certeza que deseja excluir a palavra "${palavra}"?`)) {
      this.excluindo = id;
      
      this.vocabularioService.excluirVocabulario(id).subscribe({
        next: () => {
          this.mostrarMensagem('Palavra excluída com sucesso!', 'sucesso');
          this.excluindo = null;
        },
        error: (error) => {
          this.mostrarMensagem('Erro ao excluir palavra', 'erro');
          this.excluindo = null;
        }
      });
    }
  }

  trackByVocabulario(index: number, vocab: Vocabulario): string {
    return vocab.id;
  }

  formatarData(data: string): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    
    setTimeout(() => {
      this.mensagem = null;
    }, 4000);
  }
}
