import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription }   from 'rxjs/Subscription';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { EntregasService } from '../entregas.service';
import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

import { Pedido } from '../../pedidos/pedido';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'farmacia-entregas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  providers: [EntregasService]
})
export class ListaComponent implements OnInit {

  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  // # SECCION: Lista
  status: string = 'PS';
  titulo: string = '';
  icono: string = 'f';
  pedidos: Pedido[] = [];
  paginaActual = 1;
  resultadosPorPagina = 5;
  total = 0;
  paginasTotales = 0;
  indicePaginas:number[] = []
  // # FIN SECCION

  // # SECCION: Resultados de búsqueda
  ultimoTerminoBuscado = '';
  terminosBusqueda = new Subject<string>();
  resultadosBusqueda: Pedido[] = [];
  busquedaActivada:boolean = false;
  paginaActualBusqueda = 1;
  resultadosPorPaginaBusqueda = 5;
  totalBusqueda = 0;
  paginasTotalesBusqueda = 0;
  indicePaginasBusqueda:number[] = []
  // # FIN SECCION

  // # SECCION: Cambios de Entorno
  cambiarEntornoSuscription: Subscription;
  // # FIN SECCION

  constructor(private title: Title, private route:ActivatedRoute, private entregasService: EntregasService, private cambiarEntornoService:CambiarEntornoService) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {

    switch(this.route.snapshot.url[0].path){

      case 'finalizadas':
          this.status = 'FI';
          this.icono = 'fa-check-circle';

          if (this.route.snapshot.url.length > 1){
            if(this.route.snapshot.url[1].path == 'completas'){
              this.titulo = 'Finalizadas (completas)';
            } else if(this.route.snapshot.url[1].path == 'incompletas'){
              this.titulo = 'Finalizadas (incompletas)';
            } else {
              this.titulo = 'Finalizadas';
            }
          } else {
            this.titulo = 'Finalizadas';
          }



      break;
      default: this.status = 'PS'; this.titulo = 'Por surtir'; this.icono = 'fa-inbox'; break;
    }


    this.title.setTitle('Entregas / Farmacia');



    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.listar(this.paginaActual);
    });



    this.listar(1);
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();

    var self = this;

    var busquedaSubject = this.terminosBusqueda
    .debounceTime(300) // Esperamos 300 ms pausando eventos
    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
    .switchMap((term:string)  =>  {
      console.log('Cargando búsqueda.');
      this.busquedaActivada = term != '' ? true: false;

      this.ultimoTerminoBuscado = term;
      this.paginaActualBusqueda = 1;
      this.cargando = true;
      return term  ? this.entregasService.buscar(this.status, term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda) : Observable.of<any>({data:[]})
    }


    ).catch( function handleError(error){

      self.cargando = false;
      self.mensajeError.mostrar = true;
      self.ultimaPeticion = function(){self.listarBusqueda(self.ultimoTerminoBuscado,self.paginaActualBusqueda);};//OJO
      try {
        let e = error.json();
        if (error.status == 401 ){
          self.mensajeError.texto = 'No tiene permiso para hacer esta operación.';
        }
      } catch(e){
        console.log('No se puede interpretar el error');

        if (error.status == 500 ){
          self.mensajeError.texto = '500 (Error interno del servidor)';
        } else {
          self.mensajeError.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
        }
      }
      // Devolvemos el subject porque si no se detiene el funcionamiento del stream
      return busquedaSubject

    });

    busquedaSubject.subscribe(
      resultado => {
        this.cargando = false;
        this.resultadosBusqueda = resultado.data as Pedido[];
        this.totalBusqueda = resultado.total | 0;
        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

        this.indicePaginasBusqueda = [];
        for(let i=0; i< this.paginasTotalesBusqueda; i++){
          this.indicePaginasBusqueda.push(i+1);
        }

        console.log('Búsqueda cargada.');
      }

    );
  }
  buscar(term: string): void {
    this.terminosBusqueda.next(term);
  }

  listarBusqueda(term:string ,pagina:number): void {
    this.paginaActualBusqueda = pagina;
    console.log('Cargando búsqueda.');

    this.cargando = true;
    this.entregasService.buscar(this.status, term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
        resultado => {
          this.cargando = false;


          let parsed = resultado.data ;
          for(var i in parsed) {
            parsed[i].created_at = parsed[i].created_at.replace(' ','T');

          }
          this.resultadosBusqueda = parsed as Pedido[];

          this.totalBusqueda = resultado.total | 0;
          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

          this.indicePaginasBusqueda = [];
          for(let i=0; i< this.paginasTotalesBusqueda; i++){
            this.indicePaginasBusqueda.push(i+1);
          }

          console.log('Búsqueda cargada.');

        },
        error => {
          this.cargando = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = function(){this.listarBusqueda(term,pagina);};
          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = 'No tiene permiso para hacer esta operación.';
            }

            if (error.status == 403 ){
              this.mensajeError.texto = e.error;
            } else {
              this.mensajeError.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
            }
          } catch(e){
            console.log('No se puede interpretar el error');

            if (error.status == 500 ){
              this.mensajeError.texto = '500 (Error interno del servidor)';
            } else {
              this.mensajeError.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
            }
          }

        }
      );
  }


  listar(pagina:number): void {
    this.paginaActual = pagina;
    console.log('Cargando items.');

    this.cargando = true;
    this.entregasService.lista(this.status, pagina,this.resultadosPorPagina).subscribe(
        resultado => {
          this.cargando = false;

          let parsed = resultado.data ;
          for(var i in parsed) {
            console.log(parsed[i].created_at.replace(' ','T'))
            parsed[i].created_at = parsed[i].created_at.replace(' ','T');

          }
          this.pedidos = parsed  as Pedido[];;

          //this.pedidos = resultado.data as Pedido[];

          this.total = resultado.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }

          console.log('Pedidos cargados.');

        },
        error => {
          this.cargando = false;
          this.mensajeError.mostrar = true;
          this.ultimaPeticion = this.listar;

          try {
            let e = error.json();
            if (error.status == 401 ){
              this.mensajeError.texto = 'No tiene permiso para hacer esta operación.';
            }
            if (error.status == 403 ){
              this.mensajeError.texto = e.error;
            } else {
              this.mensajeError.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
            }
          } catch(e){
            console.log('No se puede interpretar el error');

            if (error.status == 500 ){
              this.mensajeError.texto = '500 (Error interno del servidor)';
            } else {
              this.mensajeError.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
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
