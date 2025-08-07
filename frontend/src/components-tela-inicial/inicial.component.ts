import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { CarroselComponent } from './carrosel-fotos/carrosel/carrosel.component';
import { SobreNosComponent } from './sobre-nos-card/sobre-nos/sobre-nos.component';
import { ConteudoComponent } from './conteudo-principal/conteudo/conteudo.component';
import { Conteudo2Component } from './conteudo-2/conteudo-2/conteudo-2.component';
import { Conteudo3Component } from './conteudo-3/conteudo-3/conteudo-3.component';

@Component({
  standalone: true,
  selector: 'app-inicial',
  imports: [CommonModule,
    NavbarComponent
    ,CarroselComponent,
    SobreNosComponent,
    ConteudoComponent,
    Conteudo2Component,
    Conteudo3Component,],
  templateUrl: './inicial.component.html',
  styleUrl: './inicial.component.scss'
})
export class InicialComponent  {
   
}

