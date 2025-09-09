import { Component, Inject } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent2 {
  currentYear = new Date().getFullYear();
  email = 'contato@interlinguas.com';

  constructor(@Inject(DOCUMENT) private document: Document,
  private translocoService: TranslocoService


) {}



          changeLanguage(lang: string) {
            this.translocoService.setActiveLang(lang);
          }
        
          getCurrentLang() {
            return this.translocoService.getActiveLang();
          }



  backToTop() {
    this.document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollTo(id: string) {
    const el = this.document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
