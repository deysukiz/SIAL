import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'paginacion',
  templateUrl: './paginacion.component.html',
  styleUrls: ['./paginacion.component.css']
})
export class PaginacionComponent implements OnInit {
  
  
  @Input() total: number;
  @Input() paginasTotales: number;
  @Input() resultadosPorPagina: number;
  @Input() paginaActual: number;
  @Input() indicePaginas:number[];

  @Output() onSiguiente = new EventEmitter<void>();
  @Output() onAnterior = new EventEmitter<void>();
  @Output() onListar = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  siguiente() {
    console.log("siguiente");
    this.onSiguiente.emit();
  }
  anterior() {
    console.log("anterior");
    this.onAnterior.emit();
  }
  listar(pag: number = 1){
    console.log("listar:" + pag);
    this.onListar.emit(pag);
  }

}
