import { Component, OnInit } from '@angular/core';
/**
 * Componente que muestra la lista de entradas del almacén de artículos.
 */
@Component({
  selector: 'entrada-lista',
  templateUrl: './lista.component.html'
})

export class ListaComponent{
  /**
   * Variable que contiene la altura de la pantalla.
   */
  tamano;

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.tamano = document.body.clientHeight;
  }
}