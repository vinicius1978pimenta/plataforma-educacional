import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-carrosel',
  imports: [CommonModule,TranslocoModule],
  templateUrl: './carrosel.component.html',
  styleUrl: './carrosel.component.scss'
})
export class CarroselComponent {
    constructor(private translocoService: TranslocoService) {}
  
    changeLanguage(lang: string) {
      this.translocoService.setActiveLang(lang);
    }
  
    getCurrentLang() {
      return this.translocoService.getActiveLang();
    }
 
 
}



