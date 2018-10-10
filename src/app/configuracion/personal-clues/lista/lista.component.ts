import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'personal-clues-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent {
  clues_actual;
  ngOnInit() {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.clues_actual = usuario.clues_activa.clues;
    console.log(this.clues_actual);
  }
}