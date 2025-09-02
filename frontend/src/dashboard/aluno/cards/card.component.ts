import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VocabularioService } from '../../../services/vocabulario.service';
import { AtividadeService } from '../../../services/atividade.service';
import { Aviso, AvisosService } from '../../../services/avisos.service';
import { TranslocoModule, TranslocoPipe, TranslocoService } from '@ngneat/transloco';



@Component({
  standalone: true,
  selector: 'app-card',
  imports: [RouterModule,TranslocoModule,TranslocoPipe],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  totalAvisos: number | undefined;

  constructor(private avisosService: AvisosService,
    private transloco: TranslocoService
  ) {}

  private vocabularioService = inject(VocabularioService);
  private atividadeService = inject(AtividadeService);
  
   quantidadeAtividades: number = 0;
   totalPalavras: number = 0;
   totalMateria : number = 0;
    pendentes: number = 0;
    concluidas: number = 0;

  ngOnInit(): void {
    this.atividadeService.getAtividades().subscribe((atividades: any[]) => {
    this.quantidadeAtividades = atividades.length;
    this.concluidas = atividades.filter(a => a.status === 'CORRIGIDA').length;
    });

      this.atividadeService.getPendentes().subscribe(qtd => {
      this.pendentes = qtd;   
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
    this.loadAvisos();
    this.getCurrentLang();
    this.changeLanguage
   
  }


  get porcentagemConcluidas(): number {
    const total = this.quantidadeAtividades;
    const pend  = this.pendentes;
    if (total > 0) {
      const pct = Math.round(((total - pend) / total) * 100);
      // clamp 0–100
      return Math.max(0, Math.min(100, pct));
    }
    return 0;
  }

      changeLanguage(lang: string) {
        this.transloco.setActiveLang(lang);
      }
    
      getCurrentLang() {
        return this.transloco.getActiveLang();
      }



  loadAvisos() {
    this.avisosService.getAllAvisos().subscribe({
      next: (avisos: Aviso[]) => {
        this.totalAvisos = avisos.length; // pega só a quantidade
      },
      error: (err) => {
        console.error('Erro ao buscar avisos', err);
      }
    });
  }
}
