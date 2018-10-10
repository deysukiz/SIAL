import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pedidos-jurisdiccionales-lista-clues',
  templateUrl: './lista-clues.component.html',
  styleUrls: ['./lista-clues.component.css']
})
export class ListaCluesComponent implements OnInit {

  @Output() onCerrar = new EventEmitter<void>();
  @Output() onEnviar = new EventEmitter<any>();

  
  @Input() lectura: boolean = false;
  @Input() insumo: any;
  @Input() listaClaveAgregadas:  any[];

  constructor() { }

  ngOnInit() {
  }

  actualizarTotales(){
    this.insumo.monto = 0;
    this.insumo.cantidad = 0;
    for(var i in this.insumo.lista_clues){
      this.insumo.monto += this.insumo.lista_clues[i].cantidad * this.insumo.precio;
      this.insumo.cantidad += this.insumo.lista_clues[i].cantidad;
    }
      
  }
  eliminarInsumo(item,index){
    

    for(var i in this.listaClaveAgregadas){
      if(this.listaClaveAgregadas[i].clave == this.insumo.clave){

        for(var j in this.listaClaveAgregadas[i].lista){
          if(this.insumo.lista_clues[index].clues == this.listaClaveAgregadas[i].lista[j]){
            this.listaClaveAgregadas[i].lista.splice(j,1);
            break;
          }
        }
        break;
      }
    }

    this.insumo.lista_clues.splice(index,1);
    this.actualizarTotales();
  }
  cerrar(){
    this.onCerrar.emit();
  }
}
