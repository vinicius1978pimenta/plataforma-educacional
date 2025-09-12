import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialService, CreateMaterialDto, UpdateMaterialDto } from '../material.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-form.html',
  styleUrl: './material-form.scss'
})
export class MaterialFormComponent implements OnInit {
  @ViewChild('modalAviso') modalAviso!: TemplateRef<any>;
  @ViewChild('modalCancelamento') modalCancelamento!: TemplateRef<any>;

    material: CreateMaterialDto = {
      titulo: '',
      conteudo: '',
      traducao: '',

    };
  
  isEditMode = false;
  materialId: string | null = null;
  loading = false;
  salvando = false;

   tituloModal: string = '';
  mensagemModal: string = '';

  constructor(
    private materialService: MaterialService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService:  NgbModal,
  ) {}

  ngOnInit(): void {
    this.materialId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.materialId;

    if (this.isEditMode && this.materialId) {
      this.carregarMaterial(this.materialId);
    }
  }

carregarMaterial(id: string): void {
  this.loading = true;
  this.materialService.findOne(id).subscribe({
    next: (material) => {
      this.material = material;
      this.loading = false;
    },
    error: (error) => {
      console.error('Erro ao carregar material:', error);
      this.loading = false;
      this.tituloModal = 'Erro';
      this.mensagemModal = 'Erro ao carregar os dados do material.';
      this.modalService.open(this.modalAviso, { centered: true }).result.then(() => {
        this.router.navigate(['/materiais']);
      });
    }
  });
}

  onSubmit(): void {
  if (this.salvando) return;
  this.salvando = true;

  if (this.isEditMode && this.materialId) {

    const updateData: UpdateMaterialDto = {
      titulo: this.material.titulo,
      conteudo: this.material.conteudo,
      traducao: this.material.traducao
    };
    this.materialService.update(this.materialId, updateData).subscribe({
      next: () => {
        this.tituloModal = 'Sucesso!';
        this.mensagemModal = 'Material atualizado com sucesso!';
        this.modalService.open(this.modalAviso, { centered: true }).result.then(() => {
          this.router.navigate(['/materiais']);
        });
      },
      error: (error) => {
        console.error('Erro ao atualizar material:', error);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Ocorreu um erro ao atualizar o material. Tente novamente.';
        this.modalService.open(this.modalAviso, { centered: true });
        this.salvando = false;
      }
    });
  } else {
    // --- LÓGICA DE CRIAÇÃO ---
    this.materialService.create(this.material).subscribe({
      next: (res) => {
        this.tituloModal = 'Sucesso!';
        this.mensagemModal = 'Material criado com sucesso!';
        this.modalService.open(this.modalAviso, { centered: true }).result.then(() => {
          this.router.navigate(['/materiais']);
        });
      },
      error: (err) => {
        console.error('Erro ao criar material:', err);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Ocorreu um erro ao criar o material. Tente novamente.';
        this.modalService.open(this.modalAviso, { centered: true });
        this.salvando = false;
      }
    });
  }
}

 cancelar(): void {
  this.modalService.open(this.modalCancelamento, { centered: true }).result.then(
    (result) => {
      // Este bloco só executa se o usuário clicar em "Sim, cancelar"
      if (result === 'confirm') {
        this.router.navigate(['/materiais']);
      }
    },
    (reason) => {
      // Este bloco executa se o usuário clicar em "Não", no "X", ou ESC
      console.log('Cancelamento abortado.');
    }
  );
}
}

