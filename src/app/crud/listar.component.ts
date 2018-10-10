/**
* <h1>Listar Component</h1>
*<p>
* El componente listar se encarga obtener una lista de elementos
* de la api con los parametros y filtros que se especifiquen,
* interactua con el servicio crud
* </p>
*
* @author  Eliecer Ramirez Esquinca
* @version 1.0
* @since   2017-05-08
*/

import { Observable } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { AuthService } from '../auth.service';
import { CrudService } from './crud.service';

import { Mensaje } from '../mensaje';
import { NotificationsService } from 'angular2-notifications';

@Component({
    selector: 'listar',
    template: `<simple-notifications [options]="options"></simple-notifications>
    <div class="modal" id="confirmarEliminar">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
            <p class="modal-card-title"><i class="fa fa-warning"></i> Alerta</p>
            <button class="delete" (click)="cancelarModal()"></button>
            </header>
            <section class="modal-card-body">
                <div class="content">
                    <h1>¿Esta seguro de eliminar el elemento?</h1>
                    <p>Ya no se podra recuperar la información</p>
                </div>
            </section>
            <footer class="modal-card-foot">
            <a class="button is-success" (click)="borrar(borrarItem, borrarIndex)" [ngClass]="{'is-loading': borrarCargando}">Continuar</a>
            <a class="button" (click)="cancelarModal()">Cancelar</a>
            </footer>
        </div>
    </div>`
})

export class ListarComponent implements OnInit {
    /**
     * Calcula el tamaño de la pantalla
     */
    tamano = document.body.clientHeight;
    cargando: boolean = false;
    borrarCargando: boolean = false;
    // # SECCION: Esta sección es para mostrar mensajes

    ultimaPeticion: any;
    // # FIN SECCION

    // # SECCION: Lista de dato

    //dato es el modelo general que contiene los datos del formulario
    dato: any[] = [];
    respuesta: any[] = [];
    mensajeResponse: Mensaje = new Mensaje(true);

    paginaActual = 1;
    resultadosPorPagina = 20;
    total = 0;
    paginasTotales = 0;
    indicePaginas: number[] = [];
    // # FIN SECCION

    // # SECCION: Resultados de búsqueda
    ultimoTerminoBuscado = "";
    terminosBusqueda = new Subject<string>();
    resultadosBusqueda: any[] = [];
    busquedaActivada: boolean = false;
    paginaActualBusqueda = 1;
    resultadosPorPaginaBusqueda = 20;
    totalBusqueda = 0;
    paginasTotalesBusqueda = 0;
    indicePaginasBusqueda: number[] = [];
    // # FIN SECCION

    cargarDatosCatalogo;
    @Input() URL: string;
    @Input() titulo: string;

    /**
     * Este método inicializa la carga de las dependencias
     * que se necesitan para el funcionamiento del modulo
     */
    constructor(private title: Title, private crudService: CrudService, private authService: AuthService, private notificacion: NotificationsService) {

    }

    /**
     * Este método se dispara al iniciar la carga de la vista asociada
     * en este caso se utiliza para cargar la lista inicial
     * @return void
     */
    ngOnInit() {
        this.listar(1);

        this.title.setTitle(this.titulo);
        var self = this;

        var busquedaSubject = this.terminosBusqueda
            .debounceTime(300) // Esperamos 300 ms pausando eventos
            .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
            .switchMap((term: string) => {

                this.busquedaActivada = term != "" ? true : false;

                this.ultimoTerminoBuscado = term;
                this.paginaActualBusqueda = 1;
                this.cargando = true;
                return term ? this.crudService.buscar(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda, this.URL) : Observable.of<any>({ data: [] })
            }


            ).catch(function handleError(error) {

                self.cargando = false;
                self.mensajeResponse.mostrar = true;
                self.ultimaPeticion = function () { self.listarBusqueda(self.ultimoTerminoBuscado, self.paginaActualBusqueda); };//OJO
                try {
                    let e = error.json();
                    if (error.status == 401) {
                        self.mensajeResponse.texto = "No tiene permiso para hacer esta operación.";
                        self.mensajeResponse.clase = "danger";
                        this.mensaje(2);
                    }
                } catch (e) {
                    if (error.status == 500) {
                        self.mensajeResponse.texto = "500 (Error interno del servidor)";
                    } else {
                        self.mensajeResponse.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
                    }
                    self.mensajeResponse.clase = "danger";
                    this.mensaje(2);
                }
                // Devolvemos el subject porque si no se detiene el funcionamiento del stream
                return busquedaSubject

            })

        busquedaSubject.subscribe(
            resultado => {
                this.cargando = false;
                if (resultado.data) {
                    this.resultadosBusqueda = resultado.data as any[];
                } else {
                    this.resultadosBusqueda = resultado as any[];
                }
                this.totalBusqueda = resultado.total | 0;
                this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

                this.indicePaginasBusqueda = [];
                for (let i = 0; i < this.paginasTotalesBusqueda; i++) {
                    this.indicePaginasBusqueda.push(i + 1);
                }
            }

        );
    }

    /**
     * Este método es un intermediario para realizar la busqueda en
     * api con los filtros que se especifiquen en la vista
     * @param term contiene las palabras de busqueda
     * @return void
     */
    buscar(term: string): void {
        this.terminosBusqueda.next(term);
    }

    /**
     * Este método obtiene una lista de elementos de la
     * api con los filtros que se especifiquen en la vista
     * @param term contiene las palabras de busqueda
     * @param pagina  inicio de la página para mostrar resultados
     * @return void
     */
    listarBusqueda(term: string, pagina: number): void {
        this.paginaActualBusqueda = pagina;

        this.cargando = true;
        this.crudService.buscar(term, pagina, this.resultadosPorPaginaBusqueda, this.URL).subscribe(
            resultado => {
                this.cargando = false;

                this.resultadosBusqueda = resultado.data as any[];

                this.totalBusqueda = resultado.total | 0;
                this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

                this.indicePaginasBusqueda = [];
                for (let i = 0; i < this.paginasTotalesBusqueda; i++) {
                    this.indicePaginasBusqueda.push(i + 1);
                }
            },
            error => {
                this.cargando = false;
                this.mensajeResponse.mostrar = true;
                this.ultimaPeticion = function () { this.listarBusqueda(term, pagina); };
                try {
                    let e = error.json();
                    if (error.status == 401) {
                        this.mensajeResponse.texto = "No tiene permiso para hacer esta operación.";
                        this.mensajeResponse.clase = 'danger';
                        this.mensaje(2);
                    }
                } catch (e) {
                    if (error.status == 500) {
                        this.mensajeResponse.texto = '500 (Error interno del servidor)';
                    } else {
                        this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                    }
                    this.mensajeResponse.clase = 'danger';
                    this.mensaje(2);
                }

            }
        );
    }

    /**
     * Este método obtiene una lista de elementos de la api
     * @param pagina  inicio de la página para mostrar resultados
     * @return void
     */
    listar(pagina: number): void {
        this.paginaActual = pagina;

        this.cargando = true;
        this.crudService.lista(pagina, this.resultadosPorPagina, this.URL).subscribe(
            resultado => {
                this.cargando = false;

                if(resultado.data)
                    this.dato = resultado.data as any[];
                else
                    this.dato = resultado as any[];

                this.total = resultado.total | 0;
                this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

                this.indicePaginas = [];
                for (let i = 0; i < this.paginasTotales; i++) {
                    this.indicePaginas.push(i + 1);
                }
                this.mensajeResponse.mostrar = true;
                this.mensajeResponse.texto = 'lista cargada';
                this.mensajeResponse.clase = 'success';
                this.mensaje(2);
            },
            error => {
                this.cargando = false;
                this.mensajeResponse.mostrar = true;
                this.ultimaPeticion = this.listar;
                try {
                    let e = error.json();
                    if (error.status == 401) {
                        this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                        this.mensajeResponse.clase = 'danger';
                        this.mensaje(2);
                    }
                } catch (e) {
                    if (error.status == 500) {
                        this.mensajeResponse.texto = '500 (Error interno del servidor)';
                    } else {
                        this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                    }
                    this.mensajeResponse.clase = 'danger';
                    this.mensaje(2);
                }

            }
        );
    }
    //abre una modal para confirmar la eliminacion
    borrarItem = ''; borrarIndex = '';

    /**
     * Este método es intermediario para la eliminación de un elemento
     * en la api, abre una ventana modal para confirmar la acción
     * @param item contiene el valod del elemento a eliminar
     * @param index  indica la posicion del elemento en la lista cargada
     * @return void
     */
    eliminar(item: any, index): void {
        this.borrarItem = item;
        this.borrarIndex = index;
        document.getElementById('confirmarEliminar').classList.add('is-active');
    }

    /**
     * Este método cierra el modal de la de confirmación de eleimnación
     * @return void
     */
    cancelarModal() {
        document.getElementById('confirmarEliminar').classList.remove('is-active');
    }

    /**
     * Este método se encarga de la eliminacion de un elemento
     * en la api
     * @param item contiene el valod del elemento a eliminar
     * @param index  indica la posicion del elemento en la lista cargada
     * @return void
     */
    borrar(item: any, index, key: any = 'id'): void {
        item.cargando = true;
        this.borrarCargando = true;
        this.crudService.eliminar(item[key], this.URL).subscribe(
            data => {
                item.cargando = false;
                this.borrarCargando = false;

                this.dato.splice(index, 1);

                this.mensajeResponse.mostrar = true;
                this.mensajeResponse.texto = 'Se eliminó el elemento de la lista.';
                this.mensajeResponse.clase = 'success';
                this.mensaje(2);

                this.cancelarModal();
            },
            error => {
                item.cargando = false;
                this.borrarCargando = false;

                this.mensajeResponse.mostrar = true;
                this.ultimaPeticion = function () {
                    this.eliminar(item, index);
                }
                this.cancelarModal();

                try {
                    let e = error.json();
                    if (error.status == 401) {
                        this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                        this.mensajeResponse.clase = 'danger';
                        this.mensaje(2);
                    }
                } catch (e) {
                    if (error.status == 500) {
                        this.mensajeResponse.texto = '500 (Error interno del servidor)';
                    } else {
                        this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                    }
                    this.mensajeResponse.clase = 'danger';
                    this.mensaje(2);
                }


            }
        );
    }

    // # SECCION: Paginación

    /**
     * Este método es intermediario para el listado incrementa en uno la paginación
     * @return void
     */
    paginaSiguiente(): void {
        this.listar(this.paginaActual + 1);
    }

    /**
     * Este método es intermediario para el listado decrementa en uno la paginación
     * @return void
     */
    paginaAnterior(): void {
        this.listar(this.paginaActual - 1);
    }

    /**
     * Este método es intermediario para el listado, con busqueda activa incrementa en uno la paginación
     * @return void
     */
    paginaSiguienteBusqueda(term: string): void {
        this.listarBusqueda(term, this.paginaActualBusqueda + 1);
    }

    /**
     * Este método es intermediario para el listado, con busqueda activa decrementa en uno la paginación
     * @return void
     */
    paginaAnteriorBusqueda(term: string): void {
        this.listarBusqueda(term, this.paginaActualBusqueda - 1);
    }


    //mostrar notificaciones
    public options = {
        position: ['bottom', 'left'],
        timeOut: 2000,
        lastOnBottom: true
    };

    cambiar_filas_pagina(totalPorPagina: HTMLInputElement){
        if(this.busquedaActivada){
            this.resultadosPorPaginaBusqueda = parseInt(totalPorPagina.value);
            var term = <HTMLInputElement> document.getElementById("search-box");
            this.listarBusqueda(term.value, this.paginaActual);
        }else{
            this.resultadosPorPagina = parseInt(totalPorPagina.value);
            this.listar(this.paginaActual);
        }
    }

    /**
     * Este método muestra los mensajes resultantes de los llamados de la api
     * @param cuentaAtras numero de segundo a esperar para que el mensaje desaparezca solo
     * @param posicion  array de posicion [vertical, horizontal]
     * @return void
     */
    mensaje(cuentaAtras: number = 6, posicion: any[] = ['bottom', 'left']): void {
        var objeto = {
            showProgressBar: true,
            pauseOnHover: false,
            clickToClose: true,
            maxLength: this.mensajeResponse.texto.length
        };

        this.options = {
            position: posicion,
            timeOut: cuentaAtras * 1000,
            lastOnBottom: true
        };
        if (this.mensajeResponse.titulo == '')
            this.mensajeResponse.titulo = this.titulo;

        if (this.mensajeResponse.clase == 'alert')
            this.notificacion.alert(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

        if (this.mensajeResponse.clase == 'success')
            this.notificacion.success(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

        if (this.mensajeResponse.clase == 'info')
            this.notificacion.info(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

        if (this.mensajeResponse.clase == 'warning' || this.mensajeResponse.clase == 'warn')
            this.notificacion.warn(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

        if (this.mensajeResponse.clase == 'error' || this.mensajeResponse.clase == 'danger')
            this.notificacion.error(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);

    }

     /**
     * Este metodo se encarga de cargar los datos de un catalogo para crear un select, grupos de radios o check
     * @param item nombre del modelo donde se guardaron los resultados
     * @param url  ruta de la pai donde se obtienen los valores
     * @return void
     */
    cargarCatalogo(item, url, id: string = "") {
      this.cargando = true;
      this.cargarDatosCatalogo = true;
      this.crudService.lista(0, 0, url).subscribe(

          resultado => {
              if (resultado.data) {
                  resultado.data.forEach(element => {
                      if (!element.text) {
                          element.text = element.nombre;
                      }
                  });
                  this[item] = resultado.data;
              }else {
                  if (Array.isArray(resultado)) {
                      resultado.forEach(element => {
                          if (!element.text) {
                              element.text = element.nombre;
                          }
                      });
                  }
                  this[item] = resultado;
              }
              this.cargando = false;
              if (resultado.length == 0) {
                  this.mensajeResponse.titulo = item;
                  this.mensajeResponse.texto = 'Esta vacio, póngase en contacto con un administrador.';
                  this.mensajeResponse.mostrar = true;
                  this.mensajeResponse.clase = 'warning';
                  this.mensaje(3);
              }
              this.cargarDatosCatalogo = false;
              if (id != '') {
                      setTimeout(() => {
                          if (document.getElementById(id)) {
                              document.getElementById(id).click();
                          }
                      }, 500);
              }
          },
          error => {
              this.mensajeResponse = new Mensaje(true);
              this.mensajeResponse.texto = 'No especificado.';
              this.mensajeResponse.mostrar = true;

              try {

                  let e = error.json();

                  if (error.status == 401) {
                      this.mensajeResponse.texto = "No tiene permiso para ver los roles.";
                  }

                  if (error.status == 500) {

                      this.mensajeResponse.texto = "500 (Error interno del servidor). No se pudieron cargar los roles";
                  }
              } catch (e) {

                  if (error.status == 500) {

                      this.mensajeResponse.texto = "500 (Error interno del servidor). No se pudieron cargar los roles";
                  } else {
                      this.mensajeResponse.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.  No se pudieron cargar los roles";
                  }
              }
              this.cargarDatosCatalogo = false;
          }
      );
  }
}
