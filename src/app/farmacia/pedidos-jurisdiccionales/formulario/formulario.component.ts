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

import { environment } from '../../../../environments/environment';

import { Mensaje } from '../../../mensaje';

import { AlmacenesService } from '../../../catalogos/almacenes/almacenes.service';
import { PedidosJurisdiccionalesService } from '../pedidos-jurisdiccionales.service';
import { Pedido } from '../pedido';
import { Almacen } from '../../../catalogos/almacenes/almacen';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
  host: { '(window:keydown)' : 'keyboardInput($event)'}
})


export class FormularioComponent implements OnInit {

  cargando: boolean = false;
  guardando: boolean = false;
  cargandoAlmacenes: boolean = false;
  cargandoInsumos: boolean = false;
  cargandoPresupuestos: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION  

  meses:any = {0:'Sin seleccionar' ,1:'Enero', 2:'Febrero', 3:'Marzo', 4:'Abril', 5:'Mayo', 6:'Junio', 7:'Julio', 8:'Agosto', 9:'Septiembre', 10:'Octubre', 11:'Noviembre', 12:'Diciembre'};

  //Harima: para ver si el formulaior es para crear o para editar
  formularioTitulo:string = 'Nuevo';
  esEditar:boolean = false;
  
  // # SECCION: Modal Insumos
  mostrarModalInsumos = false;  
  //Harima: Lista de claves agregadas al pedido, para checar duplicidad
  listaClaveAgregadas: any[] = [];
  // # FIN SECCION

  // # SECCION: Modal Lista clues
  mostrarModalListaClues = false;
  loteSeleccionado: any = null;
  // # FIN SECCION

  // # SECCION: Pedido
  almacenes: Almacen[];
  presupuesto:any = {causes_disponible:0,no_causes_disponible:0,material_curacion_disponible:0};
  mes:number = 0;
  subrogados: {} = {};
  es_almacen_subrogado: boolean = false;

  fechasValidas: any[] = [];

  // Harima: Se genera un unico pedido
  pedido: Pedido;
  proveedor: any = {};
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
    private pedidosService: PedidosJurisdiccionalesService,
    private almacenesService: AlmacenesService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.title.setTitle('Formulario pedido');

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker("web-workers/farmacia/pedidos/imprimir.js")
    
    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    var self = this;    
    var $ngZone = this._ngZone;

    //Harima: Cargar el presupuesto del mes actual
    //this.cargarPresupuesto();

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
    
    // Harima: Inicializamos el pedido
    this.pedido = new Pedido(true);

    //Harima:calcular fechas validas
    let now = new Date();
    let dia = now.getDate();
    let mes = now.getMonth()+1;

    if(dia < 20){
      //Mes actual y siguiente, se agrega mes actual
      let day = ("0" + dia).slice(-2);
      let month = ("0" + mes).slice(-2);
      this.fechasValidas.push({fecha:now.getFullYear() + "-" + (month) + "-" + (day),descripcion: this.meses[mes] + " " + now.getFullYear()}); //fecha actual
    }
    //Mes siguiente
    let day = '01';
    let month = ("0" + (mes+1)).slice(-2);
    let anio = now.getFullYear();

    if(mes+1 == 13){
      let month = '01';
      let anio = now.getFullYear() + 1;
      mes = 0;
    }
    
    this.fechasValidas.push({fecha:anio + "-" + (month) + "-" + (day),descripcion: this.meses[mes+1] + " " + now.getFullYear()}); //fecha actual
    
    this.route.params.subscribe(params => {
      //this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      if(params['id']){
        this.cargando = true;
        this.pedido.id = params['id'];

        //cargar datos del pedido
        this.esEditar = true;
        this.formularioTitulo = 'Editar';
        this.title.setTitle('Editar pedido');

        this.pedidosService.ver(params['id']).subscribe(
          pedido => {
            //this.datosCargados = true;
            this.pedido.datos.patchValue(pedido);
            this.pedido.status = pedido.status;

            this.proveedor = pedido.proveedor;

            let fecha = pedido.fecha.split('-');
            let mes = parseInt(fecha[1]);
            this.cargarPresupuesto(mes);
            this.cambioAlmacen();

            for(let i in pedido.insumos){
              let dato = pedido.insumos[i];
              //console.log(dato);
              let insumo = dato.insumos_con_descripcion;
              insumo.cantidad = +dato.cantidad_solicitada;
              insumo.monto = +dato.monto_solicitado;
              insumo.precio = +dato.precio_unitario;
              insumo.tipo_insumo_id = dato.tipo_insumo_id;
              insumo.lista_clues = dato.lista_clues;
              this.pedido.lista.push(insumo);

              this.listaClaveAgregadas.push({
                  clave: insumo.clave,
                  lista: []
              });   

              console.log(dato.lista_clues)
              let ultimo = this.listaClaveAgregadas.length - 1;

              for( var j in insumo.lista_clues){
                console.log(insumo.lista_clues[j])
                this.listaClaveAgregadas[ultimo].lista.push(insumo.lista_clues[j].clues);
              }

            }
            this.pedido.indexar();
            this.pedido.listar(1);
            this.cargando = false;
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
      }else{
        this.title.setTitle('Nuevo pedido jurisdiccional');
        this.cargarPresupuesto();
      }
      //Harima:cargamos catalogos
      this.cargarAlmacenes();

      //this.cargarDatos();
    });
    //this.pedidos[0].nombre = "General";
    //this.pedidos[0].observaciones = null;
  }

  obtenerDireccion(): string{
    //if(this.pedidos[this.pedidoActivo].status == 'AB'){
    if(this.pedido.status == 'BR'){
      return '/almacen/pedidos-jurisdiccionales/borradores';
    }else{
      return '/almacen/pedidos-jurisdiccionales/todos';
    }
  }

  toggleModalInsumos(){
    //console.log(this.mostrarModalInsumos)
    this.mostrarModalInsumos = !this.mostrarModalInsumos
    //console.log(this.mostrarModalInsumos)
  }

  toggleModalListaClues(item:any){
    //console.log(this.mostrarModalInsumos)
    this.loteSeleccionado = item;
    this.mostrarModalListaClues = !this.mostrarModalListaClues
    //console.log(this.mostrarModalInsumos)
  }

  // # SECCION Funciones globales
  
  agregarItem(item:any = {}){
  
    
    let auxPaginasTotales = this.pedido.paginacion.totalPaginas;


    let insumo = item.insumo;
    var existe = false;

    //var total
    for( var i in this.pedido.lista){

      var cantidad = 0;

      if(this.pedido.lista[i].clave == insumo.clave){
        existe = true;

        this.pedido.lista[i].lista_clues.push({
          clues:item.clues,
          nombre:item.nombre,
          cantidad: item.cantidad
        });

        console.log(this.pedido.lista[i].lista_clues);


        for(var j in this.pedido.lista[i].lista_clues){
          cantidad += this.pedido.lista[i].lista_clues[j].cantidad;
        }
        this.pedido.lista[i].cantidad  = cantidad;
        this.pedido.lista[i].monto  = insumo.precio * cantidad;
      }
    }
    if(!existe){
      //insumo.monto = insumo.cantidad * insumo.precio;
      if(!insumo.lista_clues){
        insumo.lista_clues = [];
      }
      
      insumo.lista_clues.push( {
        clues:item.clues,
        nombre:item.nombre,
        cantidad: item.cantidad
      })
      insumo.cantidad = item.cantidad;
      insumo.monto = insumo.cantidad * insumo.precio;
      
      this.pedido.lista.push(insumo);
    }
    
    this.pedido.indexar();

    if(this.pedido.paginacion.lista.length == this.pedido.paginacion.resultadosPorPagina
      && this.pedido.paginacion.paginaActual == auxPaginasTotales
      && !this.pedido.filtro.activo){
        this.pedido.listar(this.pedido.paginacion.paginaActual + 1);
    } else {
      this.pedido.listar(this.pedido.paginacion.paginaActual);
    }
    
  }
  
  modificarItem(item:any = {}){
    item.monto = item.cantidad * item.precio;
    this.pedido.actualizarTotales();
  }

  buscar(e: KeyboardEvent, input:HTMLInputElement, inputAnterior: HTMLInputElement,  parametros:any[]){
    
    let term = input.value;

    // Quitamos la busqueda
    if(e.keyCode == 27){
      e.preventDefault();
      e.stopPropagation();
      input.value = "";
      inputAnterior.value = "";

      this.pedido.filtro.activo = false;
      this.pedido.filtro.lista = [];

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
      this.pedido.filtro.activo = true;
    } else {
      this.pedido.filtro.activo = false;
      this.pedido.filtro.lista = [];
      return;
    }

    var arregloResultados:any[] = []
    for(let i in parametros){

      let termino = (parametros[i].input as HTMLInputElement).value;
      if(termino == ""){
        continue;
      }
      
      let listaFiltrada = this.pedido.lista.filter((item)=> {   
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
      this.pedido.filtro.lista = match;
    } else {
      this.pedido.filtro.lista = arregloResultados[0];
    }
    this.pedido.filtro.indexar(false);
    this.pedido.filtro.paginacion.paginaActual = 1;
    this.pedido.filtro.listar(1); 
  }

  //Harima: necesitamos eliminar también de la lista de claves agregadas
  eliminarInsumo(item,index,filtro:boolean = false){
       
    //Harima: eliminar el elemento en la lista de claves agregadas, para poder agregarla de nuevo si se desea
    var i = this.listaClaveAgregadas.indexOf(item.clave);
    this.listaClaveAgregadas.splice(i,1);
    
    //Harima: si no es el filtro(busqueda), borrar de la lista principal de insumos
    
    if(!filtro){
    
      //this.pedidos[this.pedidoActivo].eliminarItem(item,index);
      this.pedido.eliminarItem(item,index);
    }else{
    
      //this.pedidos[this.pedidoActivo].filtro.eliminarItem(item,index);
      this.pedido.filtro.eliminarItem(item,index);
    }
  }

  mostrarFichaInformativa(e, clave: string){
    e.preventDefault();
    e.stopPropagation();

    // Mostrar el componente de Ficha Informativa
    // Falta hacerlo sumamiiiii :)
    alert(clave);
    //console.log(clave);
  }

  finalizar(){
    if(confirm('Atención el pedido ya no podra editarse, Esta seguro de concluir el pedido?')){
      this.guardar(true);
    }
  }

  guardar(finalizar:boolean = false){
    this.guardando = true;
    var guardar_pedido;

    if(this.pedido.datos.invalid){
      this.pedido.datos.get('almacen_solicitante').markAsTouched();
      this.pedido.datos.get('descripcion').markAsTouched();
      this.pedido.datos.get('fecha').markAsTouched();
      this.guardando = false;
      return false;
    }

    guardar_pedido = this.pedido.obtenerDatosGuardar();

    if(finalizar){
      guardar_pedido.datos.status = 'CONCLUIR';

      if((this.presupuesto.causes_disponible - +this.pedido.totalMontoCauses.toFixed(2)) < 0 || (this.presupuesto.no_causes_disponible - +this.pedido.totalMontoNoCauses.toFixed(2)) < 0 || (this.presupuesto.material_curacion_disponible - +this.pedido.totalMontoMaterialCuracion.toFixed(2)) < 0){
        this.guardando = false;
        this.mensajeError = new Mensaje(true);
        this.mensajeError.texto = 'Presupuesto insuficiente';
        this.mensajeError.mostrar = true;
        return false;
      }
    }else{
      guardar_pedido.datos.status = 'BR';
    }

    if(this.esEditar){
      //this.pedidosService.editar(this.pedidos[0].id,guardar_pedidos).subscribe(
      this.pedidosService.editar(this.pedido.id,guardar_pedido).subscribe(
        pedido => {
          this.guardando = false;
          //console.log('Pedido editado');
          if(pedido.status != 'BR'){
            this.router.navigate(['/almacen/pedidos-jurisdiccionales/ver/'+pedido.id]);
          }
          //hacer cosas para dejar editar
        },
        error => {
          this.guardando = false;
          //console.log(error);
          this.mensajeError = new Mensaje(true);
          this.mensajeError.texto = 'No especificado';
          this.mensajeError.mostrar = true;
          console.log(this.pedido);
          if(this.pedido.status == 'CONCLUIR'){
            this.pedido.status = 'BR';
          }

          try{
            let e = error.json();
            console.log(e);
            if (error.status == 401 ){
              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
            }
            // Problema de validación
            if (error.status == 409){
              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
            }
            
            if(error.status == 500){
              if(e.error){
                this.mensajeError.texto = e.error;
                this.mensajeError.cuentaAtras = 1000;
              }
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
      this.pedidosService.crear(guardar_pedido).subscribe(
        pedido => {
          this.guardando = false;
          //console.log('Pedido creado');
          //console.log(pedido);
          this.router.navigate(['/almacen/pedidos-jurisdiccionales/editar/'+pedido.id]);
          //hacer cosas para dejar editar
        },
        error => {
          this.guardando = false;
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
              }
              if(error.status == 500){
                if(e.error){
                  this.mensajeError.texto = e.error;
                  this.mensajeError.cuentaAtras = 1000;
                }
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

  cambioAlmacen(){
    let almacen_seleccionado = this.pedido.datos.get('almacen_solicitante').value;
    if(this.subrogados[almacen_seleccionado]){
      this.es_almacen_subrogado = true;
    }else{
      this.es_almacen_subrogado = false;
    }
    this.cargarPresupuesto(this.mes);
  }

  cargarAlmacenes() {
    this.cargandoAlmacenes = true;
    this.almacenesService.catalogo(0).subscribe(
        almacenes => {
          this.cargandoAlmacenes = false;
          this.almacenes = almacenes;

          for(let i in almacenes){
            if(almacenes[i].subrogado == 1 && almacenes[i].tipo_almacen == 'FARSBR'){
              this.subrogados[almacenes[i].id] = true;
            }
          }

          //Harima:Si no es editar, inicializamos el formulario
          if(!this.esEditar){
            let datos_iniciales:any = {}

            this.pedido.inicializarDatos(datos_iniciales);
          }
          
          console.log("Almacenes cargados.");

          if (this.almacenes.length == 0){
            this.mensajeAdvertencia = new Mensaje(true);
            this.mensajeAdvertencia.texto = `No hay almacenes registrados en el sistema, póngase en contacto con un administrador.`;
            this.mensajeAdvertencia.mostrar = true;
          } 
          // Akira: esto es para seleccionar por default al primero
          else {
            this.pedido.datos.patchValue({
              almacen_solicitante: this.almacenes[0].id
            });
            this.cambioAlmacen();
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

  recargarPresupuesto(fecha:string){
    let fecha_valida = fecha.split('-');
    if(fecha_valida.length == 3){
      let mes:any = fecha_valida[1];
      if(mes.length == 2){
        mes = parseInt(mes);
        if(mes != this.mes && (mes > 0 && mes < 13)){
          this.cargarPresupuesto(mes);
        }
      }
    }
  }

  cargarPresupuesto(mes:number = 0){
    if(mes == 0){
      let now = new Date();
      mes = (now.getMonth() + 1);
    }
    this.mes = mes;
    let almacen_seleccionado = this.pedido.datos.get('almacen_solicitante').value;
    if(almacen_seleccionado){
      this.cargandoPresupuestos = true;
      this.pedidosService.presupuesto(mes,almacen_seleccionado).subscribe(
        response => {
          this.cargando = false;
          if(response.data){
            this.presupuesto = response.data;
          }else{
            this.presupuesto.causes_disponible = 0;
            this.presupuesto.no_causes_disponible = 0;
            this.presupuesto.material_curacion_disponible = 0;
          }
          this.cargandoPresupuestos = false;
        },
        error => {
          this.cargando = false;
          this.cargandoPresupuestos = false;
          console.log(error);
        }
      );
    }
    
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

      if (!this.pedido.filtro.activo){
        this.pedido.paginaSiguiente();
      } else {
        this.pedido.filtro.paginaSiguiente();
      }
      
    }
    // Cambiar página hacia adelante ctrl + shift + <-
    if (e.keyCode == 37 && ((e.ctrlKey && e.shiftKey) || e.ctrlKey )){
      
      event.preventDefault();
      event.stopPropagation();

      if (!this.pedido.filtro.activo){
        this.pedido.paginaAnterior();
      } else {
        this.pedido.filtro.paginaAnterior();
      }
    }
    
        
  }

  // # SECCION - Webworkers

  imprimirExcel(){
    var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/generar-excel-pedido-jurisdiccional/${this.pedido.id}?${query}`); 
  }

  imprimir() {
    try {
      console.log(this.pedido);
      this.cargandoPdf = true;
      var pedidos_imprimir = {
        datos:{almacen:'solicitar',solicitante:'unidad',observaciones:'texto'},
        lista: this.pedido.lista
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
