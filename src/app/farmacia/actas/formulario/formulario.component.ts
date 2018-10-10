import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import  * as FileSaver    from 'file-saver';

import { Mensaje } from '../../../mensaje';

import { AlmacenesService } from '../../../catalogos/almacenes/almacenes.service';
import { ActasService } from '../actas.service';
import { Pedido } from '../../pedidos/pedido';
import { Almacen } from '../../../catalogos/almacenes/almacen';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
  host: { '(window:keydown)' : 'keyboardInput($event)'}
})


export class FormularioComponent implements OnInit {

  cargando: boolean = false;
  cargandoAlmacenes: boolean = false;
  cargandoInsumos: boolean = false;
  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION

  //Harima: para ver si el formulaior es para crear o para editar
  formularioTitulo:string = 'Nuevo';
  esEditar:boolean = false;

  // # SECCION: Modal Insumos
  mostrarModalInsumos = false;
  //Harima: Lista de claves agregadas al pedido, para checar duplicidad
  listaClaveAgregadas: Array<string> = [];
  // # FIN SECCION

  // # SECCION: Pedido

  almacenes: Almacen[];

  // Los pedidos tienen que ser en un array por si se va a generar mas de un pedido de golpe
  pedidos: Pedido[] = [];
  // esta variable es para saber el pedido seleccionado (por si hay mas)
  pedidoActivo:number = 0;

  // # FIN SECCION


  // # SECCION: Reportes
  pdfworker:Worker;
  cargandoPdf:boolean = false;
  // # FIN SECCION


  constructor(
    private title: Title,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private _ngZone: NgZone,
    private actasService: ActasService,
    private almacenesService: AlmacenesService,
    private fb: FormBuilder
  ) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.title.setTitle('Nuevo pedido / Farmacia');

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker("web-workers/farmacia/pedidos/imprimir.js")

    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    var self = this;
    var $ngZone = this._ngZone;

    //Harima:cargamos catalogos
    this.cargarAlmacenes();

    this.pdfworker.onmessage = function( evt ) {
      // Esto es un hack porque estamos fuera de contexto dentro del worker
      // Y se usa esto para actualizar alginas variables
      $ngZone.run(() => {
         self.cargandoPdf = false;
      });

      FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
      //open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
    };

    this.pdfworker.onerror = function( e ) {
      $ngZone.run(() => {
         self.cargandoPdf = false;
      });
      console.log(e)
    };

    // Inicialicemos el pedido
    this.pedidos.push(new Pedido(true) );

    this.route.params.subscribe(params => {
      //this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      if(params['id']){
        this.pedidos[0].id = params['id'];
        //cargar datos del pedido
        this.esEditar = true;
        this.formularioTitulo = 'Editar';

        this.actasService.ver(params['id']).subscribe(
          pedido => {
            this.cargando = false;
            //this.datosCargados = true;
            this.pedidos[0].datos.patchValue(pedido);

            for(let i in pedido.insumos){
              let dato = pedido.insumos[i];
              let insumo = dato.insumos_con_descripcion;
              insumo.cantidad = +dato.cantidad_solicitada;
              this.pedidos[0].lista.push(insumo);
              this.listaClaveAgregadas.push(insumo.clave);
            }
            this.pedidos[0].indexar();
            this.pedidos[0].listar(1);
          },
          error => {
            this.cargando = false;

            this.mensajeError = new Mensaje(true);
            this.mensajeError = new Mensaje(true);
            this.mensajeError.mostrar;

            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }

            } catch(e){

              if (error.status == 500 ){
                this.mensajeError.texto = "500 (Error interno del servidor)";
              } else {
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
              }
            }
          }
        );
        console.log('editar pedido');
      }else{
        console.log('nuevo pedido');
      }
      //this.cargarDatos();
    });
    //this.pedidos[0].nombre = "General";
    //this.pedidos[0].observaciones = null;
  }

  obtenerDireccion(): string{
    console.log('dpdpd');
    if(this.pedidos[this.pedidoActivo].status == 'AB'){
      return '/farmacia/pedidos/abiertos';
    }else{
      return '/farmacia/pedidos/en-espera';
    }
  }

  toggleModalInsumos(){
    //console.log(this.mostrarModalInsumos)
    this.mostrarModalInsumos = !this.mostrarModalInsumos
    //console.log(this.mostrarModalInsumos)
  }

  // # SECCION Funciones globales

  agregarItem(item:any = {}){
    let auxPaginasTotales = this.pedidos[this.pedidoActivo].paginacion.totalPaginas;

    this.pedidos[this.pedidoActivo].lista.push(item);

    this.pedidos[this.pedidoActivo].indexar();

    // El siguiente proceso es para cambiar de página automáticamente si se encuentra en la última.

    if(this.pedidos[this.pedidoActivo].paginacion.lista.length == this.pedidos[this.pedidoActivo].paginacion.resultadosPorPagina
      && this.pedidos[this.pedidoActivo].paginacion.paginaActual == auxPaginasTotales
      && !this.pedidos[this.pedidoActivo].filtro.activo){
        this.pedidos[this.pedidoActivo].listar(this.pedidos[this.pedidoActivo].paginacion.paginaActual + 1);
    } else {
      this.pedidos[this.pedidoActivo].listar(this.pedidos[this.pedidoActivo].paginacion.paginaActual);
    }

  }

  buscar(e: KeyboardEvent, input:HTMLInputElement, inputAnterior: HTMLInputElement,  parametros:any[]){

    let term = input.value;

    // Quitamos la busqueda
    if(e.keyCode == 27){
      e.preventDefault();
      e.stopPropagation();
      input.value = "";
      inputAnterior.value = "";

      this.pedidos[this.pedidoActivo].filtro.activo = false;
      this.pedidos[this.pedidoActivo].filtro.lista = [];

      return;
    }


    //Verificamos que la busqueda no sea la misma que la anterior para no filtrar en vano
    if(inputAnterior.value == term){

      return
    }

    e.preventDefault();
    e.stopPropagation();

    inputAnterior.value = term;

    if(term != ""){
      this.pedidos[this.pedidoActivo].filtro.activo = true;
    } else {
      this.pedidos[this.pedidoActivo].filtro.activo = false;
      this.pedidos[this.pedidoActivo].filtro.lista = [];
      return;
    }

    var arregloResultados:any[] = []
    for(let i in parametros){

      let termino = (parametros[i].input as HTMLInputElement).value;
      if(termino == ""){
        continue;
      }

      let listaFiltrada = this.pedidos[this.pedidoActivo].lista.filter((item)=> {
        var cadena = "";
        let campos = parametros[i].campos;
        for (let l in campos){
          try{
            // Esto es por si escribieron algo como "objeto.propiedad" en lugar de: "propiedad"
            let prop = campos[l].split(".");
            if (prop.length > 1){
              cadena += " " + item[prop[0]][prop[1]].toLowerCase();
            } else {
               cadena += " " + item[campos[l]].toLowerCase();
            }

          } catch(e){}

        }
        return cadena.includes(termino.toLowerCase())
      });

      arregloResultados.push(listaFiltrada)
    }

    if(arregloResultados.length > 1 ){
      // Ordenamos Ascendente

      arregloResultados = arregloResultados.sort( function(a,b){ return  a.length - b.length });

      var filtro = arregloResultados[0];
      var match: any[] = [];
      for(let k = 1; k <  arregloResultados.length ; k++){

        for(let i in arregloResultados[k]){
          for(let j in filtro){
            if(arregloResultados[k][i] === filtro[j]){
              match.push(filtro[j]);
            }
          }
        };
      }
      this.pedidos[this.pedidoActivo].filtro.lista = match;
    } else {
      this.pedidos[this.pedidoActivo].filtro.lista = arregloResultados[0];
    }


    this.pedidos[this.pedidoActivo].filtro.indexar(false);

    this.pedidos[this.pedidoActivo].filtro.paginacion.paginaActual = 1;
    this.pedidos[this.pedidoActivo].filtro.listar(1);

  }

  //Harima: necesitamos eliminar también de la lista de claves agregadas
  eliminarInsumo(item,index,filtro:boolean = false){
    //Harima: eliminar el elemento en la lista de claves agregadas, para poder agregarla de nuevo si se desea
    var i = this.listaClaveAgregadas.indexOf(item.clave);
    this.listaClaveAgregadas.splice(i,1);

    //Harima: si no es el filtro(busqueda), borrar de la lista principal de insumos
    if(!filtro){
      this.pedidos[this.pedidoActivo].eliminarItem(item,index);
    }else{
      this.pedidos[this.pedidoActivo].filtro.eliminarItem(item,index);
    }
  }

  mostrarFichaInformativa(e, clave: string){
    e.preventDefault();
    e.stopPropagation();

    // Mostrar el componente de Ficha Informativa
    // Falta hacerlo sumamiiiii :)
    alert(clave);
    console.log(clave);
  }

  finalizar(){
    this.guardar(true);
  }

  guardar(finalizar:boolean = false){
    this.cargando = true;
    var guardar_pedidos = [];
    for(var i in this.pedidos){
      guardar_pedidos.push(this.pedidos[i].obtenerDatosGuardar());
    }

    if(finalizar){
      for(var i in guardar_pedidos){
        guardar_pedidos[i].datos.status = 'ES';
      }
    }

    if(this.esEditar){
      this.actasService.editar(this.pedidos[0].id,guardar_pedidos).subscribe(
        pedido => {
          this.cargando = false;
          console.log('Pedido editado');
          if(pedido.status == 'ES'){
            this.router.navigate(['/farmacia/pedidos/ver/'+pedido.id]);
          }
          //hacer cosas para dejar editar
        },
        error => {
          this.cargando = false;
          console.log(error);
          this.mensajeError = new Mensaje(true);
          this.mensajeError.texto = 'No especificado';
          this.mensajeError.mostrar = true;

          try{
            let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
              // Problema de validación
              if (error.status == 409){
                this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
                /*for (var input in e.error){
                  // Iteramos todos los errores
                  for (var i in e.error[input]){

                    if(input == 'id' && e.error[input][i] == 'unique'){
                      this.usuarioRepetido = true;
                    }
                    if(input == 'id' && e.error[input][i] == 'email'){
                      this.usuarioInvalido = true;
                    }
                  }
                }*/
              }
          }catch(e){
            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              console.log(e);
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
          }
        }
      );
    }else{
      this.actasService.crear(guardar_pedidos).subscribe(
        pedido => {
          this.cargando = false;
          console.log('Pedido creado');
          console.log(pedido);
          this.router.navigate(['/farmacia/pedidos/editar/'+pedido.id]);
          //hacer cosas para dejar editar
        },
        error => {
          this.cargando = false;
          console.log(error);
          this.mensajeError = new Mensaje(true);
          this.mensajeError.texto = 'No especificado';
          this.mensajeError.mostrar = true;

          try{
            let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }
              // Problema de validación
              if (error.status == 409){
                this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
                /*for (var input in e.error){
                  // Iteramos todos los errores
                  for (var i in e.error[input]){

                    if(input == 'id' && e.error[input][i] == 'unique'){
                      this.usuarioRepetido = true;
                    }
                    if(input == 'id' && e.error[input][i] == 'email'){
                      this.usuarioInvalido = true;
                    }
                  }
                }*/
              }
          }catch(e){
            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor)";
            } else {
              console.log(e);
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
          }
        }
      );
    }
  }

  cargarAlmacenes() {
    this.cargandoAlmacenes = true;
    this.almacenesService.catalogo().subscribe(
        almacenes => {
          this.cargandoAlmacenes = false;
          this.almacenes = almacenes;

          if(almacenes.length == 1 && !this.esEditar){
            for(let i in this.pedidos){
              this.pedidos[i].datos.setValue({almacen_proveedor:almacenes[0].id,descripcion:'',observaciones:''});
            }
          }

          console.log("Almacenes cargados.");

          if (this.almacenes.length == 0){
            this.mensajeAdvertencia = new Mensaje(true);
            this.mensajeAdvertencia.texto = `No hay almacenes registrados en el sistema, póngase en contacto con un administrador.`;
            this.mensajeAdvertencia.mostrar = true;
          }
        },
        error => {
          this.cargandoAlmacenes = false;

          this.mensajeError = new Mensaje(true);
          this.mensajeError.texto = "No especificado.";
          this.mensajeError.mostrar = true;

          try {

            let e = error.json();

            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para ver los almacenes.";
            }

            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor). No se pudieron cargar los almacenes";
            }
          } catch(e){

            if (error.status == 500 ){
              this.mensajeError.texto = "500 (Error interno del servidor). No se pudieron cargar los almacenes";
            } else {
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.  No se pudieron cargar los almacenes";
            }
          }

        }
      );
  }

  // # SECCION: Eventos del teclado
  keyboardInput(e: KeyboardEvent) {

    if(e.keyCode == 32 &&  e.ctrlKey){ // Ctrl + barra espaciadora
      event.preventDefault();
      event.stopPropagation();

      this.mostrarModalInsumos = true;
    }

    // Cambiar página hacia adelante ctrl + shift + ->
    if (e.keyCode == 39 && ((e.ctrlKey && e.shiftKey) || e.ctrlKey )){
      event.preventDefault();
      event.stopPropagation();

      if (!this.pedidos[this.pedidoActivo].filtro.activo){
        this.pedidos[this.pedidoActivo].paginaSiguiente();
      } else {
        this.pedidos[this.pedidoActivo].filtro.paginaSiguiente();
      }

    }
    // Cambiar página hacia adelante ctrl + shift + <-
    if (e.keyCode == 37 && ((e.ctrlKey && e.shiftKey) || e.ctrlKey )){

      event.preventDefault();
      event.stopPropagation();

      if (!this.pedidos[this.pedidoActivo].filtro.activo){
        this.pedidos[this.pedidoActivo].paginaAnterior();
      } else {
        this.pedidos[this.pedidoActivo].filtro.paginaAnterior();
      }

    }


  }

  // # SECCION - Webworkers

  imprimir() {
    try {
      console.log(this.pedidos[this.pedidoActivo]);
      this.cargandoPdf = true;
      var pedidos_imprimir = {
        datos:{almacen:'solicitar',solicitante:'unidad',observaciones:'texto'},
        lista: this.pedidos[this.pedidoActivo].lista
      };
      this.pdfworker.postMessage(JSON.stringify(pedidos_imprimir));
    } catch (e){
      this.cargandoPdf = false;
      console.log(e);
    }

  }

  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }
}
