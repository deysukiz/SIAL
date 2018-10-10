import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { PedidosJurisdiccionalesService } from '../pedidos-jurisdiccionales.service';

import { Pedido } from '../pedido';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'almacen-pedidos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  providers: [PedidosJurisdiccionalesService]
})
export class ListaComponent implements OnInit {

    cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  // # SECCION: Lista
  status: string;
  titulo: string = "Pedidos";
  icono = "fa-file";
  pedidos: Pedido[] = [];
  presupuesto:any = {};
  paginaActual = 1;
  resultadosPorPagina = 10;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = []
  // # FIN SECCION

  // # SECCION: Resultados de búsqueda
  ultimoTerminoBuscado = "";
  terminosBusqueda = new Subject<string>();
  resultadosBusqueda: Pedido[] = [];
  busquedaActivada:boolean = false;
  paginaActualBusqueda = 1;
  resultadosPorPaginaBusqueda = 10;
  totalBusqueda = 0;
  paginasTotalesBusqueda = 0;
  indicePaginasBusqueda:number[] = []
  // # FIN SECCION

  constructor(private title: Title, private route: ActivatedRoute, private pedidosService: PedidosJurisdiccionalesService) { }

  ngOnInit() {
    switch(this.route.snapshot.url[0].path){
      //case 'todos': this.status = "TODO"; this.titulo = "Todos"; this.icono = "fa-file"; break;
      case 'borradores': this.status = "BR"; this.titulo = "Borradores"; this.icono = "fa-pencil-square-o"; break;
      case 'en-transito': this.status = "ET"; this.titulo = "En transito"; this.icono = "fa-clock-o"; break;
      case 'por-surtir': this.status = "PS"; this.titulo = "Por surtir"; this.icono = "fa-truck"; break;
      case 'expirados': this.status = "EX"; this.titulo = "Expirados"; this.icono = "fa-exclamation-circle"; break;
      case 'farmacia-subrogada': this.status = "EF"; this.titulo = "Farmacia Subrogada"; this.icono = "fa-building"; break;
      case 'finalizados': 
          this.status = "FI";
          this.icono = "fa-check-circle";
          if (this.route.snapshot.url.length > 1){
            if(this.route.snapshot.url[1].path == "completos"){
              this.titulo = "Finalizados (completos)";
            } else if(this.route.snapshot.url[1].path == "incompletos"){
              this.titulo = "Finalizados (incompletos)";
            } else if(this.route.snapshot.url[1].path == "cancelados"){
              this.titulo = "Finalizados (cancelados)";
            } else {
              this.titulo = "Finalizados";
            }
          } else {
            this.titulo = "Finalizados";
          }
      break;
      default: this.titulo = "Pedidos jurisdiccionales"; this.icono = "fa-file"; break;
    }

    this.pedidosService.presupuesto().subscribe(
      response => {
        this.cargando = false;
        this.presupuesto = response.data;
      },
      error => {
        this.cargando = false;
        console.log(error);
      }
    );

    this.title.setTitle("Pedidos jurisdiccionales");

    this.listar(1);
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();

    var self = this;

    var busquedaSubject = this.terminosBusqueda
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  { 
      console.log("Cargando búsqueda.");
      this.busquedaActivada = term != "" ? true: false;

      this.ultimoTerminoBuscado = term;
      this.paginaActualBusqueda = 1;
      this.cargando = true;
      return term  ? this.pedidosService.buscar(this.status,term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda) : Observable.of<any>({data:[]}) 
    }
      
    
    ).catch( function handleError(error){ 
     
      self.cargando = false;      
      self.mensajeError.mostrar = true;
      self.ultimaPeticion = function(){self.listarBusqueda(self.ultimoTerminoBuscado,self.paginaActualBusqueda);};//OJO
      try {
        let e = error.json();
        if (error.status == 401 ){
          self.mensajeError.texto = "No tiene permiso para hacer esta operación.";
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

        let parsed = resultado.data ;
        for(var i in parsed) {
          parsed[i].created_at = parsed[i].created_at.replace(" ","T");

        }

        this.resultadosBusqueda = parsed as Pedido[];
        this.totalBusqueda = resultado.total | 0;
        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

        this.indicePaginasBusqueda = [];
        for(let i=0; i< this.paginasTotalesBusqueda; i++){
          this.indicePaginasBusqueda.push(i+1);
        }
        
        console.log("Búsqueda cargada.");
      }

    );
  }

  obtenerDireccion(id:string, status:string): string{
    if(status == 'BR'){
      return '/almacen/pedidos-jurisdiccionales/editar/'+id;
    }else{
      return '/almacen/pedidos-jurisdiccionales/ver/'+id;
    }
  }
  

  buscar(term: string): void {
    this.terminosBusqueda.next(term);
  }

  listarBusqueda(term:string ,pagina:number): void {
    this.paginaActualBusqueda = pagina;
    console.log("Cargando búsqueda.");
   
    this.cargando = true;
    this.pedidosService.buscar(this.status, term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
        resultado => {
          this.cargando = false;

          let parsed = resultado.data ;
          for(var i in parsed) {
            parsed[i].created_at = parsed[i].created_at.replace(" ","T"); // En safari fallan las fechas por eso se pone esto

          }

          this.resultadosBusqueda = parsed as Pedido[];

          this.totalBusqueda = resultado.total | 0;
          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

          this.indicePaginasBusqueda = [];
          for(let i=0; i< this.paginasTotalesBusqueda; i++){
            this.indicePaginasBusqueda.push(i+1);
          }

          console.log("Búsqueda cargada.");
          
        },
        error => {
          this.cargando = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = function(){this.listarBusqueda(term,pagina);};
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

  listar(pagina:number): void {
    this.paginaActual = pagina;
    console.log("Cargando pedidos.");
   
    this.cargando = true;
    this.pedidosService.lista(this.status, pagina,this.resultadosPorPagina).subscribe(
        resultado => {
          this.cargando = false;
          this.pedidos = resultado.data as Pedido[];

          this.total = resultado.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }

          console.log("Pedidos cargados.");
          
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

  eliminar(pedido: Pedido, index): void {
    pedido.cargando = true;
    if(confirm('Desea eliminar el pedido?')){
      this.pedidosService.eliminar(pedido.id).subscribe(
        data => {
          pedido.cargando = false;
          this.pedidos.splice(index, 1);  
          console.log("Se eliminó el elemento de la lista.");

          this.mensajeExito = new Mensaje(true)
          this.mensajeExito.mostrar = true;
          this.mensajeExito.texto = "Pedido eliminado";
          
        },
        error => {
          pedido.cargando = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = function(){
            this.eliminar(pedido, index);
          }
        
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
    }else{
      pedido.cargando = false;
    }
  }

  // # SECCION: Paginación
  paginaSiguiente():void {
    this.listar(this.paginaActual+1);
  }
  paginaAnterior():void {
    this.listar(this.paginaActual-1);
  }

  paginaSiguienteBusqueda(term:string):void {
    this.listarBusqueda(term,this.paginaActualBusqueda+1);
  }
  paginaAnteriorBusqueda(term:string):void {
    this.listarBusqueda(term,this.paginaActualBusqueda-1);
  }

}
