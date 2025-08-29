import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { CarroselComponent } from './carrosel-fotos/carrosel/carrosel.component';
import { ConteudoComponent } from './conteudo-principal/conteudo/conteudo.component';
import { Conteudo2Component } from './conteudo-2/conteudo-2/conteudo-2.component';
import { Conteudo3Component } from './conteudo-3/conteudo-3/conteudo-3.component';
import { LazyLoadDirective } from './lazy-load.directive';
import { TranslocoModule, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { FooterComponent } from './footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-inicial',
  imports: [
    CommonModule,
    NavbarComponent,
    CarroselComponent,
    ConteudoComponent,
    Conteudo2Component,
    Conteudo3Component,
    LazyLoadDirective,
    TranslocoModule,
    TranslocoPipe,
    FooterComponent,
],
  templateUrl: './inicial.component.html',
  styleUrls: ['./inicial.component.scss']  
})
export class InicialComponent {

  constructor(private translocoService: TranslocoService) {}

  changeLanguage(lang: string) {
    this.translocoService.setActiveLang(lang);
  }

  getCurrentLang() {
    return this.translocoService.getActiveLang();
  }

  showConteudo3 = false;
  private timeoutId3?: any;

  showTitulo = false;
  private timeoutIdTitulo?: any;

  showConteudo2 = false;
  private timeoutId2?: any;

  loadConteudo2() {
    if (!this.showConteudo2) {
      this.showConteudo2 = true;
    }
    if (this.timeoutId2) {
      clearTimeout(this.timeoutId2);
      this.timeoutId2 = undefined;
    }
  }

  unloadConteudo2() {
    this.timeoutId2 = setTimeout(() => {
      this.showConteudo2 = false;
    }, 500); // espera 500ms antes de esconder
  }

  loadTitulo() {
    if (!this.showTitulo) {
      this.showTitulo = true;
    }
    if (this.timeoutIdTitulo) {
      clearTimeout(this.timeoutIdTitulo);
      this.timeoutIdTitulo = undefined;
    }
  }

  unloadTitulo() {
    this.timeoutIdTitulo = setTimeout(() => {
      this.showTitulo = false;
    }, 500);
  }

  loadConteudo3() {
  if (!this.showConteudo3) {
    this.showConteudo3 = true;
  }
  if (this.timeoutId3) {
    clearTimeout(this.timeoutId3);
    this.timeoutId3 = undefined;
  }
}

unloadConteudo3() {
  // Em vez de já sumir, aplica classe CSS de fade-out
  const el = document.querySelector('.conteudo3');
  if (el) {
    el.classList.add('fade-out');
    this.timeoutId3 = setTimeout(() => {
      this.showConteudo3 = false;
      el.classList.remove('fade-out');
    }, 500); // duração da animação
  }
}




}
