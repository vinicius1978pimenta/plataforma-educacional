import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-conteudo-3',
  imports: [RouterModule,CommonModule,TranslocoModule],
  templateUrl: './conteudo-3.component.html',
  styleUrl: './conteudo-3.component.scss',
  
})
export class Conteudo3Component {
  constructor(private translocoService: TranslocoService) {}
    
      changeLanguage(lang: string) {
        this.translocoService.setActiveLang(lang);
      }
    
      getCurrentLang() {
        return this.translocoService.getActiveLang();
      }

  
}
