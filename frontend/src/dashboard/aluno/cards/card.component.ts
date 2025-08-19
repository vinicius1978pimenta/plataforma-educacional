import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VocabularioService } from '../../../services/vocabulario.service';
import { AtividadeService } from '../../../services/atividade.service';


@Component({
  standalone: true,
  selector: 'app-card',
  imports: [RouterModule, ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  private vocabularioService = inject(VocabularioService);
  private atividadeService = inject(AtividadeService);
  
   quantidadeAtividades: number = 0;
   totalPalavras: number = 0;
   totalMateria : number = 0;

  ngOnInit(): void {
    this.atividadeService.getAtividades().subscribe((atividades: any[]) => {
      this.quantidadeAtividades = atividades.length;
    });

    this.vocabularioService.carregarVocabularios().subscribe(() => {
    this.vocabularioService.totalPalavras$.subscribe(total => {
      this.totalPalavras = total;
    });
    });

    this.atividadeService.getMateriais().subscribe((_materias: any[])=>{
      this.totalMateria = _materias.length
    }
    )
    
   
  }
}
