import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, TranslocoModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
botoes: any;
  constructor(private translocoService: TranslocoService) {}
  
    changeLanguage(lang: string) {
      this.translocoService.setActiveLang(lang);
    }
  
    getCurrentLang() {
      return this.translocoService.getActiveLang();
    }

    scrollToSection(sectionId: string) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
}

scrollToFooter() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
}

}