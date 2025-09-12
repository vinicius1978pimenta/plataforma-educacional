import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvisosService, Aviso } from '../../../services/avisos.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-criar-aviso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar2Component],
  templateUrl: './criar-aviso.component.html',
  styleUrl: './criar-aviso.component.scss'
})
export class CriarAvisoComponent implements OnInit {
  @ViewChild('modalAviso') modalAviso!: TemplateRef<any>;
  @ViewChild('modalExclusao') modalExclusao!: TemplateRef<any>;

  avisoForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  meusAvisos: Aviso[] = [];
  loadingAvisos = false;
   tituloModal: string = '';
  mensagemModal: string = '';

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
    private router: Router,
    private modalService:  NgbModal,
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
  if (this.avisoForm.invalid) {
    this.markFormGroupTouched();
    return;
  }

  this.loading = true;

  this.avisosService.createAviso(this.avisoForm.value).subscribe({
    next: (response) => {
      this.loading = false;
      this.tituloModal = 'Sucesso!';
      this.mensagemModal = 'Aviso criado com sucesso!';
      
      this.modalService.open(this.modalAviso, { centered: true }).result.then(() => {
        this.avisoForm.reset({
          tipo: 'GERAL',
          prioridade: 'NORMAL',
          ativo: true
        });
        this.carregarMeusAvisos(); // Recarrega a lista
      });
    },
    error: (error) => {
      this.loading = false;
      this.tituloModal = 'Erro';
      if (error.status === 403) {
        this.mensagemModal = 'Você não tem permissão para criar avisos.';
      } else {
        this.mensagemModal = 'Erro ao criar aviso. Tente novamente.';
      }
      this.modalService.open(this.modalAviso, { centered: true });
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
 
  this.modalService.open(this.modalExclusao, { centered: true }).result.then(
    (result) => {

      if (result === 'confirm') {
        this.avisosService.deleteAviso(aviso.id).subscribe({
          next: () => {
            this.tituloModal = 'Sucesso';
            this.mensagemModal = `O aviso "${aviso.titulo}" foi excluído.`;
            this.modalService.open(this.modalAviso, { centered: true });
            this.carregarMeusAvisos();
          },
          error: (error) => {
            console.error('Erro ao excluir aviso:', error);
            this.tituloModal = 'Erro';
            this.mensagemModal = 'Não foi possível excluir o aviso.';
            this.modalService.open(this.modalAviso, { centered: true });
          }
        });
      }
    },
    (reason) => {
      console.log('Exclusão cancelada.');
    }
  );
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
