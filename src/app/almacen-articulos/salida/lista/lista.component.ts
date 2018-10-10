import { Component, OnInit } from '@angular/core';
/**
 * Componente que contiene la lista de salidas del almacén de artículos.
 */
@Component({
  selector: 'salida-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent{
  tamano;
  ngOnInit() {
    this.tamano = document.body.clientHeight;
  }
}