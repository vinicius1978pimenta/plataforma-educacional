import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvisosService, CreateAvisoDto, Aviso } from '../../../services/avisos.service';

@Component({
  selector: 'app-criar-aviso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './criar-aviso.component.html',
  styleUrl: './criar-aviso.component.scss'
})
export class CriarAvisoComponent implements OnInit {
  avisoForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  meusAvisos: Aviso[] = [];
  loadingAvisos = false;

  tiposAviso = [
    { value: 'GERAL', label: 'Geral' },
    { value: 'URGENTE', label: 'Urgente' },
    { value: 'EVENTO', label: 'Evento' },
    { value: 'LEMBRETE', label: 'Lembrete' },
    { value: 'COMUNICADO', label: 'Comunicado' }
  ];

  prioridades = [
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' }
  ];

  constructor(
    private fb: FormBuilder,
    private avisosService: AvisosService,
    private router: Router
  ) {
    this.avisoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      conteudo: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['GERAL', Validators.required],
      prioridade: ['NORMAL', Validators.required],
      dataExpiracao: [''],
      ativo: [true]
    });
  }

  ngOnInit(): void {
    this.carregarMeusAvisos();
  }

  carregarMeusAvisos(): void {
    this.loadingAvisos = true;
    this.avisosService.getMeusAvisos().subscribe({
      next: (avisos) => {
        this.meusAvisos = avisos;
        this.loadingAvisos = false;
      },
      error: (error) => {
        console.error('Erro ao carregar avisos:', error);
        this.loadingAvisos = false;
      }
    });
  }

  onSubmit(): void {
    console.log(' INÍCIO DO onSubmit()'); // Debug
    
    if (this.avisoForm.invalid) {
      console.log(' Formulário inválido:', this.avisoForm.errors); // Debug
      this.markFormGroupTouched();
      return;
    }

    console.log(' Formulário válido, iniciando criação...'); // Debug
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.avisoForm.value;
    console.log(' Dados do formulário:', formData); // Debug

    console.log(' Chamando AvisosService.createAviso()...'); // Debug
    this.avisosService.createAviso(formData).subscribe({
      next: (response) => {
        console.log(' Aviso criado com sucesso:', response); // Debug
        this.loading = false;
        this.successMessage = 'Aviso criado com sucesso!';
        
        // Recarregar lista de avisos
        this.carregarMeusAvisos();
        
        // Resetar formulário após 2 segundos
        setTimeout(() => {
          this.avisoForm.reset();
          this.avisoForm.patchValue({
            tipo: 'GERAL',
            prioridade: 'NORMAL',
            ativo: true
          });
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        console.log(' Erro ao criar aviso:', error); // Debug
        this.loading = false;
        
        if (error.status === 401) {
          console.log(' Erro 401 - redirecionando para login...'); // Debug
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.errorMessage = 'Você não tem permissão para criar avisos.';
        } else {
          this.errorMessage = 'Erro ao criar aviso. Tente novamente.';
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.avisoForm.controls).forEach(key => {
      const control = this.avisoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.avisoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  voltar(): void {
    this.router.navigate(['/dashboard-professor']);
  }

  toggleAtivo(aviso: Aviso): void {
    this.avisosService.toggleAtivoAviso(aviso.id).subscribe({
      next: () => {
        this.carregarMeusAvisos();
      },
      error: (error) => {
        console.error('Erro ao alterar status do aviso:', error);
      }
    });
  }

  excluirAviso(aviso: Aviso): void {
    if (confirm(`Tem certeza que deseja excluir o aviso "${aviso.titulo}"?`)) {
      this.avisosService.deleteAviso(aviso.id).subscribe({
        next: () => {
          this.carregarMeusAvisos();
        },
        error: (error) => {
          console.error('Erro ao excluir aviso:', error);
        }
      });
    }
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposAviso.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getPrioridadeLabel(prioridade: string): string {
    const prioridadeObj = this.prioridades.find(p => p.value === prioridade);
    return prioridadeObj ? prioridadeObj.label : prioridade;
  }

  getPrioridadeClass(prioridade: string): string {
    switch (prioridade) {
      case 'CRITICA': return 'prioridade-critica';
      case 'ALTA': return 'prioridade-alta';
      case 'NORMAL': return 'prioridade-normal';
      case 'BAIXA': return 'prioridade-baixa';
      default: return 'prioridade-normal';
    }
  }

  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'URGENTE': return 'tipo-urgente';
      case 'EVENTO': return 'tipo-evento';
      case 'LEMBRETE': return 'tipo-lembrete';
      case 'COMUNICADO': return 'tipo-comunicado';
      case 'GERAL': return 'tipo-geral';
      default: return 'tipo-geral';
    }
  }
}
