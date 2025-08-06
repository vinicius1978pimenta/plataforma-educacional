import { Routes } from '@angular/router';
import { LoginComponent } from '../auth/undefined/login/login.component';
import { RegisterComponent } from '../auth/undefined/register/register.component';
import { DashboardProfessorComponent } from '../dashboard/professor/dashboard-professor.component';
import { DashboardAlunoComponent } from '../dashboard/aluno/dashboard-aluno.component';
import { DahsboardResponsaveisComponent } from '../dashboard/responsaveis/dahsboard-responsaveis.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CriarAtividadeComponent } from '../dashboard/professor/Atividades/criar-atividade/criar-atividade.component';
import { ListarAtividadesComponent } from '../dashboard/professor/Atividades/listar-atividades/listar-atividades.component';
import { EditarAtividadeComponent } from '../dashboard/professor/Atividades/editar-atividade/editar-atividade.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

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

  { path: 'criar-atividade', component: CriarAtividadeComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },

{ path: 'atividades', component: ListarAtividadesComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },
{ path: 'atividades/editar/:id', component: EditarAtividadeComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },

  // Rota genérica de dashboard (você pode adaptar isso melhor depois)
  {
    path: 'dashboard',
    component: LoginComponent, // temporário — pode ser substituído por um redirecionamento inteligente
    canActivate: [AuthGuard]
  },

  // Rota fallback
  { path: '**', redirectTo: '/login' },


];
