import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-conteudo',
  imports: [TranslocoModule],
  templateUrl: './conteudo.component.html',
  styleUrl: './conteudo.component.scss'
})
export class ConteudoComponent {
  constructor(private translocoService: TranslocoService) {}
        
          changeLanguage(lang: string) {
            this.translocoService.setActiveLang(lang);
          }
        
          getCurrentLang() {
            return this.translocoService.getActiveLang();
          }
  

}
