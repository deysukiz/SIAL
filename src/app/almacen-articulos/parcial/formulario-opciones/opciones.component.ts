import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'formulario-opciones',
  templateUrl: './opciones.component.html'
})

export class FormularioOpcionesComponent{
  @Input() ctrl: any; 
  ngOnInit() {
    
  }
}