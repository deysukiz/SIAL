import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, AfterViewInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { Mensaje } from '../../mensaje';

import { BuscarInsumosService } from './buscar-insumos.service';
import { InsumoMedico } from '../insumo-medico';

@Component({
  selector: 'buscar-insumos',
  templateUrl: './buscar-insumos.component.html',
  styleUrls: ['./buscar-insumos.component.css'], 
  host: { '(document:keydown)' : 'keyboardInput($event)'}
})

export class BuscarInsumosComponent implements OnInit, AfterViewInit {
  
  @ViewChildren('searchBox') searchBoxViewChildren;
  @ViewChildren('cantidadBox') cantidadBoxViewChildren;
  @ViewChildren('precioBox') precioBoxViewChildren;
  @ViewChildren('cluesSelect') cluesSelectViewChildren;
  @ViewChildren('stockSelect') stockSelectViewChildren;
  
  @Output() onCerrar = new EventEmitter<void>();
  @Output() onEnviar = new EventEmitter<any>();

  //Harima: Para evitar agregar insumos que ya estan en la lista
  @Input() listaAgregados: Array<string>;
  @Input() listaAgregadosConClues: any[] = [];
  @Input() listaAgregadosConStock: any = {}; 
  @Input() disponiblePedidos: boolean;
  @Input() conPrecios: boolean = false;
  @Input() conCantidad: boolean = true;
  @Input() conClues: boolean = false;
  @Input() conStock: boolean = false;
  @Input() establecerPrecio: boolean = false;
  @Input() conTipoInsumo: boolean = false;
  @Input() tipo: string = null;

  cargando: boolean = false;

  // # SECCION: Lista de insumos
  insumos: InsumoMedico[] = [];
  ultimoTerminoBuscado = "";
  terminosBusqueda = new Subject<string>();
  paginaActual = 1;
  resultadosPorPagina = 25;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = [];
  // # FIN SECCION

  listaTipoInsumos:any[] = [];
  tipoInsumo:any = -1;
  descripcionTipoInsumo:string = "";

   // # SECCION: Unidades Medicas dependientes

  listaClues:any[] = [];
  clues:any = -1;

  listaCluesUtilizadasConInsumo:any[] = [];

   // # FIN SECCION
   
  // # SECCION: stock
  cargandoStock:boolean = false;
  private listaStock:any[] = [];
  private stockSeleccionado:any = -1;

  private listaStockActualizadoConInsumo:any = {};
  // # FIN SECCION
  
  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
 // mensajeExito: Mensaje = new Mensaje();
  mensajeAgregado: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  cantidadValida: boolean = false;
  insumoSeleccionado:InsumoMedico;

  constructor(private buscarInsumosService: BuscarInsumosService) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    console.log("Se supone me vuelvo a ejectuar");
     console.log(this.listaAgregadosConClues);
    var self = this;

    var busquedaSubject = this.terminosBusqueda
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  { 
      console.log("Cargando búsqueda.");
      //this.busquedaActivada = term != "" ? true: false;

      this.ultimoTerminoBuscado = term;
      this.paginaActual = 1;
      this.cargando = true;
      return term  ? this.buscarInsumosService.buscar(term, this.paginaActual, this.resultadosPorPagina, this.conPrecios, this.tipo, this.disponiblePedidos) : Observable.of<any>({data:[]}) 
    }
      
    
    ).catch( function handleError(error){ 
     
      self.cargando = false;      
      self.mensajeError =  new Mensaje();
      self.mensajeError.mostrar = true;
      self.ultimaPeticion = function(){self.listar(self.ultimoTerminoBuscado,self.paginaActual);};//OJO
      try {
        let e = error.json();
        if (error.status == 401 ){
          self.mensajeError.texto = "No tiene permiso para hacer esta operación.";
        }
        
        if (error.status == 0 ){
          self.mensajeError.texto = "El servidor no responde.";
        }
      } catch(e){
        console.log("No se puede interpretar el error");
        
        if (error.status == 500 ){
          self.mensajeError.texto = "500 (Error interno del servidor)";
        } else {
          self.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
        }            
      }
      // Devolvemos el subject porque si no se detiene el funcionamiento del stream 
      return busquedaSubject
    
    });

    busquedaSubject.subscribe(
      resultado => {
        this.cargando = false;
        this.resetItemSeleccionado();
        this.insumos = resultado.data as InsumoMedico[];
        this.total = resultado.total | 0;
        this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

        this.indicePaginas = [];
        for(let i=0; i< this.paginasTotales; i++){
          this.indicePaginas.push(i+1);
        }
        
        console.log("Búsqueda cargada.");
      }

    );
    if(this.conClues){
      this.buscarInsumosService.clues().subscribe(
        respuesta => {
          this.listaClues = respuesta;
        }, error => {
          console.log(error);
        }
      );
    }

    if(this.conTipoInsumo){
      this.buscarInsumosService.tipoInsumos().subscribe(
        respuesta => {
          this.listaTipoInsumos = respuesta;
        }, error => {
          console.log(error);
        }
      );
    }
    


   
  }
  ngAfterViewInit() {
    try{
      // Por alguna razón si no implemento un setTimeout me lanza error
      // investigar porque ocurre esto

      // Poner el focus en la barra de busqueda
      setTimeout(() => { this.searchBoxViewChildren.first.nativeElement.focus();} ); 
      
    } catch(e){
      console.log(e);
    }           
      
  }

  cerrar(){
    this.searchBoxViewChildren.first.nativeElement.value = "";
    this.onCerrar.emit();
  }

  resetItemSeleccionado(){
    this.cantidadBoxViewChildren.first.nativeElement.value = "";
    this.insumoSeleccionado = null;
    this.cantidadValida = false;
  }

  seleccionar(item:InsumoMedico){
    this.insumoSeleccionado = item;
    this.cantidadBoxViewChildren.first.nativeElement.disabled = false;
    this.precioBoxViewChildren.first.nativeElement.disabled = false;
    
    if(this.conStock){
      this.cargandoStock = true;
      this.buscarInsumosService.obtenerStock(item.clave).subscribe(
        resultado => {
          this.cargandoStock = false;
          this.listaStock = resultado;
          setTimeout(() => { this.stockSelectViewChildren.first.nativeElement.focus();} ); 
          /*try{
            
          } catch(e){
            console.log(e);
          }  */
        },
        error => {
          this.cargando = false;
          this.mensajeError.mostrar = true;
          
          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }else{
              this.mensajeError.texto = e.error;
            }
          } catch(e){
            console.log("No se puede interpretar el error");
            
            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }            
          }

        }
      );
      let stocks_seleccionados = this.listaAgregadosConStock[item.clave];
    }

    if(this.conClues){
      this.listaCluesUtilizadasConInsumo = [];
      for(var i in this.listaAgregadosConClues){
        if(this.listaAgregadosConClues[i].clave == item.clave){
          for(var j in this.listaAgregadosConClues[i].lista){
            this.listaCluesUtilizadasConInsumo.push(this.listaAgregadosConClues[i].lista[j]);
          }
          break;          
        }
      }
      try{
          setTimeout(() => { this.cluesSelectViewChildren.first.nativeElement.focus();} ); 
          
        } catch(e){
          console.log(e);
        }  
    } 
    if(this.establecerPrecio){
      this.precioBoxViewChildren.first.nativeElement.focus();
    }
    if(!this.conStock && !this.conClues && !this.establecerPrecio){
      this.cantidadBoxViewChildren.first.nativeElement.focus();
    }
    
  }
  comprobarCantidadDecimales(value: any){
    if (value.replace(/[^0-9.]/g,'') == ""){
      this.cantidadValida = false;
      return false;
    }
    if (isNaN(value)){
      this.cantidadValida = false;
      return false;
    }
/*
    let x = value % 1;
    if ( x != 0 ){
      this.cantidadValida = false;
      return false;
    }*/
    this.cantidadValida = true;
    return true;

  }
  comprobarCantidad(value: any){
    if (value.replace(/ /g,'') == ""){
      this.cantidadValida = false;
      return false;
    }
    if (isNaN(value)){
      this.cantidadValida = false;
      return false;
    }

    let x = value % 1;
    if ( x != 0 ){
      this.cantidadValida = false;
      return false;
    }
    this.cantidadValida = true;
    return true;

  }

  enviar(e){
    e.preventDefault();
    console.log(this.clues);
    //Harima: Checamos si el insumo que seleccionamos no se encuentra agregado
    if(!this.conClues && !this.conStock && this.listaAgregados.indexOf(this.insumoSeleccionado.clave) >= 0 ){
      //Harima: Mostramos un mensaje de error al intentar agregar un insumo ya presente en la lista
      this.mensajeError = new Mensaje(true,2);
      this.mensajeError.texto = "El insumo seleccionado ya se encuentra en la lista";
      this.mensajeError.mostrar = true;
      return;
    }
   
    if(this.conClues){
      var existe = false;
      if(this.clues == "TODAS"){
        this.listaAgregadosConClues.push({
            clave: this.insumoSeleccionado.clave,
            lista: []
        }); 
        let ultimo = this.listaAgregadosConClues.length - 1;
        console.log(ultimo)
        for(var i in this.listaClues){
          this.listaAgregadosConClues[ultimo].lista.push(this.listaClues[i].clues);

          
          var item = {
            insumo: this.insumoSeleccionado,
            clues: this.listaClues[i].clues,
            nombre:this.listaClues[i].nombre,            
            cantidad: Number(this.cantidadBoxViewChildren.first.nativeElement.value)
          }
          console.log(item)
          this.listaCluesUtilizadasConInsumo.push(this.listaClues[i].clues);
          this.onEnviar.emit(item);
        } 
        this.mensajeAgregado = new Mensaje(true, 2);
        this.mensajeAgregado.mostrar = true;  

        
        this.cluesSelectViewChildren.first.nativeElement.value = -1;
        this.cantidadBoxViewChildren.first.nativeElement.value = "";
        this.clues = -1;
        try{
            setTimeout(() => { this.searchBoxViewChildren.first.nativeElement.focus();} ); 
            
        } catch(e){
          console.log(e);
        } 
      } else {
        for(var i in this.listaAgregadosConClues){
          if(this.listaAgregadosConClues[i].clave == this.insumoSeleccionado.clave){
            existe = true;

            if(this.listaAgregadosConClues[i].lista.indexOf(this.clues)>=0){
                this.mensajeError = new Mensaje(true,2);
                this.mensajeError.texto = "La unidad seleccionada ya tiene asignado ese insumo asignado";
                this.mensajeError.mostrar = true;
                return;
            } else {
              this.listaAgregadosConClues[i].lista.push(this.clues);
            }
            break;
          } 
        } 
        if(!existe){
          this.listaAgregadosConClues.push({
            clave: this.insumoSeleccionado.clave,
            lista: [this.clues]
          });        
        } 

        var um = { clues: '', nombre: ''};
        for(var i in this.listaClues){
          if(this.listaClues[i].clues == this.clues){
            um.clues = this.clues;
            um.nombre = this.listaClues[i].nombre;
          }
        }
        
        var _item = {
            insumo: this.insumoSeleccionado,
            clues: this.clues,
            nombre: um.nombre,            
            cantidad: Number(this.cantidadBoxViewChildren.first.nativeElement.value)
        }

        this.mensajeAgregado = new Mensaje(true, 2);
        this.mensajeAgregado.mostrar = true;   
        this.onEnviar.emit(_item);
        
        this.listaCluesUtilizadasConInsumo.push(this.clues);
        this.cluesSelectViewChildren.first.nativeElement.value = -1;
        this.clues = -1;
        try{
            setTimeout(() => { this.cluesSelectViewChildren.first.nativeElement.focus();} ); 
            
        } catch(e){
          console.log(e);
        }  
      }
    } 

    if(this.conStock){
      let cantidad = Number(this.cantidadBoxViewChildren.first.nativeElement.value);
      
      let stockSeleccionado = {existencia:0};
      for(var i in this.listaStock){
        if(this.listaStock[i].id == this.stockSeleccionado){
          stockSeleccionado = this.listaStock[i];
          break;
        }
      }

      if(this.stockSelectViewChildren.first.nativeElement.value == -1){
        this.mensajeError.texto = 'No se ha seleccionado lote.';
        this.mensajeError.mostrar = true;
        return false;
      }

      if(cantidad > stockSeleccionado.existencia){
        this.mensajeError.texto = 'La cantidad no puede exceder de las existencias.';
        this.mensajeError.mostrar = true;
        return false;
      }

      this.listaAgregadosConStock[this.stockSeleccionado] = cantidad;

      this.mensajeAgregado = new Mensaje(true, 2);
      this.mensajeAgregado.mostrar = true;    
      //this.insumoSeleccionado.cantidad = this.cantidadBoxViewChildren.first.nativeElement.value;
      let item = {
        insumo: this.insumoSeleccionado,
        lote: stockSeleccionado,
        cantidad: cantidad
      };
      
      this.onEnviar.emit(item);
      //this.searchBoxViewChildren.first.nativeElement.focus();
      this.cantidadBoxViewChildren.first.nativeElement.value = '';
      this.stockSelectViewChildren.first.nativeElement.value = -1;
      this.stockSelectViewChildren.first.nativeElement.focus();
      //this.resetItemSeleccionado();
    }

    if(this.establecerPrecio){
      this.mensajeAgregado = new Mensaje(true, 2);
      this.mensajeAgregado.mostrar = true;  
      var insumo = {
        precio: this.precioBoxViewChildren.first.nativeElement.value,
        insumo : this.insumoSeleccionado,
        tipo_insumo_id: this.tipoInsumo,
        descripcion_tipo_insumo: this.descripcionTipoInsumo
      }
      this.onEnviar.emit(insumo);
      this.precioBoxViewChildren.first.nativeElement.value = "";
      this.searchBoxViewChildren.first.nativeElement.focus();
      //Harima: Agregamos la clave al arreglo de items agregados
      this.listaAgregados.push(this.insumoSeleccionado.clave);
      this.resetItemSeleccionado();
    }

    if(!this.conClues && !this.conStock &&!this.establecerPrecio){
      this.mensajeAgregado = new Mensaje(true, 2);
      this.mensajeAgregado.mostrar = true;    
      this.insumoSeleccionado.cantidad = this.cantidadBoxViewChildren.first.nativeElement.value;
      this.onEnviar.emit(this.insumoSeleccionado);
      this.searchBoxViewChildren.first.nativeElement.focus();
      //Harima: Agregamos la clave al arreglo de items agregados
      this.listaAgregados.push(this.insumoSeleccionado.clave);
      this.resetItemSeleccionado();
    }
  }
  
  buscar(term: string): void {
    this.terminosBusqueda.next(term);
    this.mensajeError.mostrar = false;
  }

  listar(term:string, pagina:number): void {
    this.paginaActual = pagina;
    this.resetItemSeleccionado();
    console.log("Cargando insumos.");
   
    this.cargando = true;
    this.buscarInsumosService.buscar(term, pagina, this.resultadosPorPagina, this.conPrecios, this.tipo, this.disponiblePedidos).subscribe(
        resultado => {
          this.cargando = false;
          this.insumos = resultado.data as InsumoMedico[];

          this.total = resultado.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }

          console.log("Insumos cargados.");
          console.log(this.insumos);
        },
        error => {
          this.cargando = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = this.listar;
          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
          } catch(e){
            console.log("No se puede interpretar el error");
            
            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }            
          }

        }
      );
  }

  mostrarFichaInformativa(e, clave: string){    
    e.preventDefault();
    e.stopPropagation();

    // Mostrar el componente de Ficha Informativa
    // Falta hacerlo sumamiiiii :)
    alert(clave);
    console.log(clave);
  }

  // # SECCION: Paginación
  paginaSiguiente(term:string):void {
    if (this.paginaActual == this.paginasTotales){
        return;
    }
    this.resetItemSeleccionado();
    this.listar(term,this.paginaActual+1);
  }
  paginaAnterior(term:string):void {
     if (this.paginaActual == 1){
        return;
    }
    this.resetItemSeleccionado();
    this.listar(term,this.paginaActual-1);
  }

  keyboardInput(e: KeyboardEvent) {
    if(e.keyCode == 27 ){
      event.preventDefault();
      event.stopPropagation();
      this.cerrar();
    }
        

    // Cambiar página hacia adelante ctrl + shift + ->
    if (e.keyCode == 39 && ((e.ctrlKey && e.shiftKey) || e.ctrlKey )){
      event.preventDefault();
      event.stopPropagation();

      this.paginaSiguiente(this.searchBoxViewChildren.first.nativeElement.value);
      
    }
    // Cambiar página hacia adelante ctrl + shift + <-
    if (e.keyCode == 37 && ((e.ctrlKey && e.shiftKey) || e.ctrlKey )){
      event.preventDefault();
      event.stopPropagation();
      this.paginaAnterior(this.searchBoxViewChildren.first.nativeElement.value);
    }
  }
  seleccionarTipoInsumo(value){
    this.tipoInsumo = value;

    for(var i = 0; i<this.listaTipoInsumos.length; i++){
      if(this.tipoInsumo == this.listaTipoInsumos[i].id){
        this.descripcionTipoInsumo = this.listaTipoInsumos[i].clave + " - " + this.listaTipoInsumos[i].nombre;
      }
    }
    try{
      // Por alguna razón si no implemento un setTimeout me lanza error
      // investigar porque ocurre esto

      // Poner el focus en la barra de busqueda
      setTimeout(() => { this.precioBoxViewChildren.first.nativeElement.focus();} ); 
    } catch(e){
      console.log(e);
    }  
  }
  seleccionarClues(value){
    this.clues = value;
    try{
          // Por alguna razón si no implemento un setTimeout me lanza error
          // investigar porque ocurre esto

          // Poner el focus en la barra de busqueda
          setTimeout(() => { this.cantidadBoxViewChildren.first.nativeElement.focus();} ); 
        } catch(e){
          console.log(e);
        }  
  }

  seleccionarStock(value){
    this.stockSeleccionado = value;
    try{
          // Por alguna razón si no implemento un setTimeout me lanza error
          // investigar porque ocurre esto

          // Poner el focus en la barra de busqueda
          setTimeout(() => { this.cantidadBoxViewChildren.first.nativeElement.focus();} ); 
        } catch(e){
          console.log(e);
        }  
  }
}
