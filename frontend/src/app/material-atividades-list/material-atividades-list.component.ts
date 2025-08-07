import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-material-atividades-list',
  standalone: true,
  styleUrls: ['./material-atividades-list.component.scss'],
  templateUrl: './material-atividades-list.component.html',
  imports: [CommonModule, FormsModule,RouterModule],
})
export class MaterialAtividadesListComponent implements OnInit {
  atividades: any[] = [];
  loading = false;
  materialId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atividadeService: AtividadeService
  ) {}


ngOnInit(): void {
  this.materialId = this.route.snapshot.params['id'];
  console.log('Material ID:', this.materialId);
  this.carregarAtividades();
}

carregarAtividades(): void {
  this.atividadeService.findByMaterialId(this.materialId).subscribe({
    next: (atividades) => {
      this.atividades = atividades;
    },
    error: (error) => {
      console.error('Erro ao carregar atividades:', error);
      alert('Erro ao carregar atividades vinculadas.');
    }
  });
}
}
