import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';


import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { RolesService } from '../roles.service';

import { Mensaje } from '../../../mensaje'

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  /**
   * Calcula el tamaño de la pantalla
   */
  tamano = document.body.clientHeight;

  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION


  // # SECCION: Lista 
  lista: any[] = [];
  paginaActual = 1;
  resultadosPorPagina = 25;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = []
  // # FIN SECCION

  // # SECCION: Resultados de búsqueda
  ultimoTerminoBuscado = "";
  terminosBusqueda = new Subject<string>();
  resultadosBusqueda: any[] = [];
  busquedaActivada:boolean = false;
  paginaActualBusqueda = 1;
  resultadosPorPaginaBusqueda = 25;
  totalBusqueda = 0;
  paginasTotalesBusqueda = 0;
  indicePaginasBusqueda:number[] = []
  // # FIN SECCION

  constructor(    
    private title: Title, 
    private apiService: RolesService) { }

  ngOnInit() {
    this.title.setTitle("Roles / Panel de control");
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
      return term  ? this.apiService.buscar(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda) : Observable.of<any>({data:[]}) 
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
        this.resultadosBusqueda = resultado.data as any[];
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

  buscar(term: string): void {
    this.terminosBusqueda.next(term);
  }

  listarBusqueda(term:string ,pagina:number): void {
    this.paginaActualBusqueda = pagina;
    console.log("Cargando búsqueda.");
   
    this.cargando = true;
    this.apiService.buscar(term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
        resultado => {
          this.cargando = false;

          this.resultadosBusqueda = resultado.data as any[];

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
    console.log("Cargando items.");
   
    this.cargando = true;
    this.apiService.listaPaginada(pagina,this.resultadosPorPagina).subscribe(
        resultado => {
          this.cargando = false;
          this.lista = resultado.data as any[];

          this.total = resultado.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }

          console.log("Items cargados.");
          
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
  eliminar(item: any, index): void {
    item.cargando = true;
    this.apiService.eliminar(item.id).subscribe(
        data => {
          item.cargando = false;
          this.lista.splice(index, 1);  
          console.log("Se eliminó el elemento de la lista.");

          this.mensajeExito = new Mensaje(true)
          this.mensajeExito.mostrar = true;
          this.mensajeExito.texto = "item eliminado";
        },
        error => {
          item.cargando = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = function(){
            this.eliminar(item, index);
          }
        
          
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
