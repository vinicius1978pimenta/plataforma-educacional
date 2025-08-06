import { Routes } from '@angular/router';
import { LoginComponent } from '../auth/undefined/login/login.component';
import { RegisterComponent } from '../auth/undefined/register/register.component';
import { DashboardProfessorComponent } from '../dashboard/professor/dashboard-professor.component';
import { DashboardAlunoComponent } from '../dashboard/aluno/dashboard-aluno.component';
import { DahsboardResponsaveisComponent } from '../dashboard/responsaveis/dahsboard-responsaveis.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { InicialComponent } from '../components-tela-inicial/inicial.component';
import { SobreNosComponent } from '../components-tela-inicial/sobre-nos-card/sobre-nos/sobre-nos.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'home', component : InicialComponent },
  {path: 'sobre', component : SobreNosComponent },
  // Dashboards protegidos por autenticação e role específico
  {
    path: 'dashboard-professor',
    component: DashboardProfessorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },
  {
    path: 'dashboard-aluno',
    component: DashboardAlunoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ALUNO' }
  },
  {
    path: 'dashboard-responsaveis',
    component: DahsboardResponsaveisComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONSAVEL' }
  },

  // Rota genérica de dashboard 
  {
    path: 'dashboard',
    component: LoginComponent, // temporário — pode ser substituído por um redirecionamento inteligente
    canActivate: [AuthGuard]
  },

  // Rota fallback
  { path: '**', redirectTo: '/login' }
];
