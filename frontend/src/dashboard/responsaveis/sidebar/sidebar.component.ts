import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,TranslocoModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isCollapsed: boolean = false;
    professor: any;
    currentUser: any;
    
  
    constructor(private authService: AuthService ,
       private router: Router,
       private transloco: TranslocoService  ) {}
  
    ngOnInit(): void {
      // Restaurar estado do sidebar
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState) {
        this.isCollapsed = savedState === 'true';
      }
  
      // Pegar usuário logado do AuthService
      this.currentUser = this.authService.getCurrentUser();
  
      // Caso o AuthService não tenha método, pegar direto do localStorage
      if (!this.currentUser) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
        }
      }
    }
  
    toggleSidebar(): void {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
    }


    getCurrentLang() {
    return this.transloco.getActiveLang();
  }
  
   changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
      }

}
