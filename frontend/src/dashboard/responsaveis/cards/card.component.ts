import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslocoModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent { 
  constructor(private readonly transloco: TranslocoService) {}

  
  getCurrentLang() {
    return this.transloco.getActiveLang();
  }
  
  changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
  }
}
