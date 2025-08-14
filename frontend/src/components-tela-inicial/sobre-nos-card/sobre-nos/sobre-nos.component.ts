import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-sobre-nos',
  imports: [RouterModule,TranslocoModule],
  templateUrl: './sobre-nos.component.html',
  styleUrl: './sobre-nos.component.scss'
})
export class SobreNosComponent {
  constructor(private translocoService: TranslocoService) {}
          
            changeLanguage(lang: string) {
              this.translocoService.setActiveLang(lang);
            }
          
            getCurrentLang() {
              return this.translocoService.getActiveLang();
            }

}
