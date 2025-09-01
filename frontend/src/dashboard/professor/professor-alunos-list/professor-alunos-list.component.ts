import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Navbar2Component } from '../../../navbar2/navbar2.component';

@Component({
  selector: 'app-professor-alunos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar2Component],
  templateUrl: './professor-alunos-list.component.html',
  styleUrls: ['./professor-alunos-list.component.scss']
})
export class ProfessorAlunosListComponent implements OnInit {
  alunos: any[] = [];
  loading = true;
  error = '';
  filtro = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAlunosForProfessor().subscribe({
      next: data => {
        this.alunos = data ?? [];
        this.loading = false;
      },
      error: _ => {
        this.error = 'Falha ao carregar alunos.';
        this.loading = false;
      }
    });
  }

  trackById = (_: number, a: any) => a.id;

  get alunosFiltrados() {
    if (!this.filtro) return this.alunos;
    const f = this.filtro.toLowerCase();
    return this.alunos.filter(a =>
      (a.name?.toLowerCase()?.includes(f)) ||
      (a.email?.toLowerCase()?.includes(f)) ||
      (a.responsavel?.name?.toLowerCase()?.includes(f)) ||
      (a.responsavel?.email?.toLowerCase()?.includes(f))
    );
  }
}
