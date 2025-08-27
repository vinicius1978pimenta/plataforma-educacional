import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isCollapsed: boolean = false;
    professor: any;
    currentUser: any;
    
  
    constructor(private authService: AuthService , private router: Router  ) {}
  
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


}
