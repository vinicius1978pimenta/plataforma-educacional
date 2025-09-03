import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-card',
  imports: [RouterModule,CommonModule, TranslocoModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit{

  constructor(private readonly transloco: TranslocoService){}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  
   getCurrentLang() {
    return this.transloco.getActiveLang();
  }
  
   changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
      }
  

}
