import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-conteudo-2',
  imports: [TranslocoModule],
  templateUrl: './conteudo-2.component.html',
  styleUrl: './conteudo-2.component.scss'
})
export class Conteudo2Component {
  constructor(private translocoService: TranslocoService) {}
      
        changeLanguage(lang: string) {
          this.translocoService.setActiveLang(lang);
        }
      
        getCurrentLang() {
          return this.translocoService.getActiveLang();
        }

}
