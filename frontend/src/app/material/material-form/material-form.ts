import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialService, CreateMaterialDto, UpdateMaterialDto } from '../material.service';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-form.html',
  styleUrl: './material-form.scss'
})
export class MaterialFormComponent implements OnInit {
    material: CreateMaterialDto = {
      titulo: '',
      conteudo: '',
      traducao: '',

    };
  
  isEditMode = false;
  materialId: string | null = null;
  loading = false;
  salvando = false;

  constructor(
    private materialService: MaterialService,
    private router: Router,
    private route: ActivatedRoute
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
        this.material = {
          titulo: material.titulo,
          conteudo: material.conteudo,
          traducao: material.traducao
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar material:', error);
        this.loading = false;
        alert('Erro ao carregar material. Redirecionando para a lista.');
        this.router.navigate(['/materiais']);
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
          alert('Material atualizado com sucesso!');
          this.router.navigate(['/materiais']);
        },
        error: (error) => {
          console.error('Erro ao atualizar material:', error);
          alert('Erro ao atualizar material. Tente novamente.');
          this.salvando = false;
        }
      });
    } else {this.materialService.create(this.material).subscribe({
      next: (res) => {
        console.log('Material criado com sucesso:', res);
        alert('Material criado com sucesso!');
        this.router.navigate(['/materiais']);
      },
      error: (err) => {
        console.error('Erro ao criar material:', err);
        if (err.error?.message) {
          console.log('Mensagens de erro do backend:', err.error.message);
        }
      }
    });
            
    }
  }

  cancelar(): void {
    const confirmacao = confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.');
    if (confirmacao) {
      this.router.navigate(['/materiais']);
    }
  }
}

