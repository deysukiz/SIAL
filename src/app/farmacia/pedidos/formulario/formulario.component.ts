import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

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

import  * as FileSaver    from 'file-saver'; 

import { environment } from '../../../../environments/environment';

import { Mensaje } from '../../../mensaje';

import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';

import { AlmacenesService } from '../../../catalogos/almacenes/almacenes.service';
import { PedidosService } from '../pedidos.service';
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
  soloLectura: boolean = false;

  almacenDelUsuario:any = {};

  erroresEnInsumos:any = {lista:{}, errores:0};

  esPedidoJurisdiccional: boolean = false;
  esOficinaJurisdiccional: boolean = false;

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
  
  //Harima: Estos totales solo te toman en cuenta cuando el pedido ya estuvo en Por Surtir, y recibio insumos, pero por alguna razon se regreso a Borrador, es para ajustar el presupuesto disponible
  totalMontoComprometidoCausesMaterial: number = 0;
  totalMontoComprometidoNoCauses: number = 0;

  // # SECCION: Modal Insumos
  mostrarModalInsumos = false;
  //Harima: Lista de claves agregadas al pedido, para checar duplicidad
  //listaClaveAgregadas: Array<string> = [];

  // Akira: Lo volvy tipo any en lugar de string porque en pedidos jurisdiccionales se agregan más datos :P
  listaClaveAgregadas: any[] = [];
  // # FIN SECCION

  // # SECCION: Pedido
  almacenes: Almacen[];
  presupuesto:any = {causes_disponible:0,no_causes_disponible:0,material_curacion_disponible:0,insumos_disponible:0};
  mes:number = 0;
  anio:number = 0;
  subrogados: {} = {};
  es_almacen_subrogado: boolean = false;
  almacenSeleccionado: any = {};

  fechasValidas: any[] = [];

  // Harima: Se genera un unico pedido
  pedido: Pedido;
  proveedor: any = {};
  // # FIN SECCION

  // # SECCION: Reportes
  pdfworker:Worker;
  cargandoPdf:boolean = false;
  // # FIN SECCION

  // ######### PEDIDOS JURISDICCIONALES #########

  mostrarModalListaClues = false;
  loteSeleccionado: any = null;

  // ############################################

  cambiarEntornoSuscription: Subscription;

  constructor(
    private title: Title, 
    private location: Location, 
    private router: Router,
    private route: ActivatedRoute,
    private _ngZone: NgZone, 
    private pedidosService: PedidosService,
    private almacenesService: AlmacenesService,
    private fb: FormBuilder,
    private cambiarEntornoService:CambiarEntornoService
  ) { }

  ngOnInit() {

    // ######### PEDIDOS JURISDICCIONALES #########

    var usuario =  JSON.parse(localStorage.getItem("usuario"));
    
    if(usuario.clues_activa.tipo == "OA"){
      this.esOficinaJurisdiccional = true;
    }

    // ############################################
    
    this.soloLectura = usuario.solo_lectura;

    if(usuario.almacen_activo.subrogado){
      this.soloLectura = true;
    }
    
    //Harima: actualizacion para pedidos entre almacenes
    this.almacenDelUsuario = usuario.almacen_activo;

    this.title.setTitle('Formulario pedido');

    // Inicializamos el objeto para los reportes con web Webworkers
    this.pdfworker = new Worker("web-workers/farmacia/pedidos/imprimir.js")
    
    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    var self = this;    
    var $ngZone = this._ngZone;

    //Harima: Cargar el presupuesto del mes actual
    //this.cargarPresupuesto();
    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.router.navigate(['/almacen/pedidos']);
    });

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
            //Harima:calcular fechas validas
            let now = new Date();
            let dia = now.getDate();
            let mes_actual = now.getMonth()+1;

            let fecha_pedido = pedido.fecha.split('-');
            let mes_pedido = parseInt(fecha_pedido[1]);
            
            if(fecha_pedido[0] < now.getFullYear()){
              this.fechasValidas.push({fecha:fecha_pedido[0] + "-" + fecha_pedido[1] + "-" + fecha_pedido[2], descripcion: this.meses[mes_pedido] + " " + fecha_pedido[0]}); //fecha diferente año
            }else if(mes_pedido < mes_actual && fecha_pedido[0] == now.getFullYear()){
              this.fechasValidas.push({fecha:fecha_pedido[0] + "-" + fecha_pedido[1] + "-" + fecha_pedido[2], descripcion: this.meses[mes_pedido] + " " + fecha_pedido[0]}); //fecha anterior mismo año
            }

            if(mes_pedido == mes_actual && fecha_pedido[0] == now.getFullYear()){
              this.fechasValidas.push({fecha:fecha_pedido[0] + "-" + fecha_pedido[1] + "-" + fecha_pedido[2], descripcion: this.meses[mes_pedido] + " " + fecha_pedido[0]}); //fecha actual
            }else{ // if(dia < 20)
              //Mes actual y siguiente, se agrega mes actual
              let day = ("0" + dia).slice(-2);
              let month = ("0" + mes_actual).slice(-2);
              this.fechasValidas.push({fecha:now.getFullYear() + "-" + (month) + "-" + (day),descripcion: this.meses[mes_actual] + " " + now.getFullYear()}); //fecha actual
            }

            //Meses siguientes
            let mes_inicio = mes_actual+1;
            let day = '01';
            let anio = now.getFullYear();

            if(mes_inicio == 13){
              mes_inicio = 1;
              anio = now.getFullYear()+1;
            }

            for(let mes = mes_inicio; mes <= 12; mes++){
              
              let month = ("0" + (mes)).slice(-2);
              
              if(mes_pedido == mes && fecha_pedido[0] == anio){
                this.fechasValidas.push({fecha:fecha_pedido[0] + "-" + fecha_pedido[1] + "-" + fecha_pedido[2], descripcion: this.meses[mes_pedido] + " " + fecha_pedido[0]}); //fecha siguiente
              }else{
                this.fechasValidas.push({fecha:anio + "-" + (month) + "-" + (day),descripcion: this.meses[mes] + " " + anio}); //fecha siguiente
              }
            }
            

            //Harima:cargamos presupuesto apartado, en caso de que el pedido se este editando despues de tener recepciones
            if(pedido.presupuesto_apartado){
              let presupuesto_apartado = pedido.presupuesto_apartado;
              this.totalMontoComprometidoCausesMaterial = (+presupuesto_apartado.causes_comprometido)+(+presupuesto_apartado.causes_devengado)+(+presupuesto_apartado.material_curacion_comprometido)+(+presupuesto_apartado.material_curacion_devengado);
              this.totalMontoComprometidoNoCauses = (+presupuesto_apartado.no_causes_comprometido)+(+presupuesto_apartado.no_causes_devengado);
            }

            //this.datosCargados = true;
            this.pedido.datos.patchValue(pedido);
            this.pedido.status = pedido.status;
            this.pedido.presupuesto_id = (pedido.presupuesto_id)?pedido.presupuesto_id:0;
            this.proveedor = pedido.proveedor;

            //let fecha = pedido.fecha.split('-');
            //let mes = parseInt(fecha_pedido[1]);
            this.cargarPresupuesto(mes_pedido);
            this.cambioAlmacen();

            for(let i in pedido.insumos){
              let dato = pedido.insumos[i];
              //console.log(dato);
              let insumo = dato.insumos_con_descripcion;
              insumo.cantidad = +dato.cantidad_solicitada;
              insumo.monto = +dato.monto_solicitado;
              insumo.precio = +dato.precio_unitario;
              insumo.tipo_insumo_id = dato.tipo_insumo_id;

              if(dato.cantidad_recibida){
                insumo.cantidad_recibida = +dato.cantidad_recibida;
              }else{
                insumo.cantidad_recibida = 0;
              }

              if(pedido.tipo_pedido_id != "PJS"){
                this.pedido.lista.push(insumo);
                this.listaClaveAgregadas.push(insumo.clave);
                this.esPedidoJurisdiccional = false;
              }else { // ######### PEDIDOS JURISDICCIONALES #########

                this.esPedidoJurisdiccional = true;
                insumo.lista_clues = dato.lista_clues;
                this.pedido.lista.push(insumo);
                this.listaClaveAgregadas.push({
                    clave: insumo.clave,
                    lista: []
                });   
                let ultimo = this.listaClaveAgregadas.length - 1;
                for( var j in insumo.lista_clues){
                  console.log(insumo.lista_clues[j])
                  this.listaClaveAgregadas[ultimo].lista.push(insumo.lista_clues[j].clues);
                }
              }
              // ############################################

              
            }
            this.pedido.indexar();
            this.pedido.listar(1);
            this.cargando = false;

            //Harima:cargamos catalogos
            this.cargarAlmacenes();
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
        //Harima:calcular fechas validas
        let now = new Date();
        let dia = now.getDate();
        let mes = now.getMonth()+1;

        //if(dia < 20){
          //Mes actual y siguiente, se agrega mes actual
        let day = ("0" + dia).slice(-2);
        let month = ("0" + mes).slice(-2);
        this.fechasValidas.push({fecha:now.getFullYear() + "-" + (month) + "-" + (day),descripcion: this.meses[mes] + " " + now.getFullYear()}); //fecha actual
        //}

        //Meses siguientes
        let mes_inicio = mes+1;
        day = '01';
        let anio = now.getFullYear();

        if(mes_inicio == 13){
          mes_inicio = 1;
          anio = now.getFullYear()+1;
        }
        
        for(let mes = mes_inicio; mes <= 12; mes++){
          let month = ("0" + (mes)).slice(-2);
          this.fechasValidas.push({fecha:anio + "-" + (month) + "-" + (day),descripcion: this.meses[mes] + " " + anio}); //fecha siguiente
        }

        this.title.setTitle('Nuevo pedido');
        this.cargarPresupuesto();

        //Harima:cargamos catalogos
        this.cargarAlmacenes();
      }
      

      //this.cargarDatos();
    });
    //this.pedidos[0].nombre = "General";
    //this.pedidos[0].observaciones = null;
  }

  obtenerDireccion(): string{
    //if(this.pedidos[this.pedidoActivo].status == 'AB'){
    if(this.pedido.status == 'BR'){
      return '/almacen/pedidos/borradores';
    }else{
      return '/almacen/pedidos/todos';
    }
  }

  toggleModalInsumos(){
    //console.log(this.mostrarModalInsumos)
    this.mostrarModalInsumos = !this.mostrarModalInsumos
    //console.log(this.mostrarModalInsumos)
  }

  // ######### PEDIDOS JURISDICCIONALES #########

  toggleModalListaClues(item:any){
    this.loteSeleccionado = item;
    this.mostrarModalListaClues = !this.mostrarModalListaClues
  }

  // ############################################

  // # SECCION Funciones globales
  
  agregarItem(item:any = {}){
    let auxPaginasTotales = this.pedido.paginacion.totalPaginas;

    if(!this.esPedidoJurisdiccional){
      if(!item.cantidad_recibida){
        item.cantidad_recibida = 0;
      }
      item.monto = item.cantidad * item.precio;    
      this.pedido.lista.push(item);
    } 
    // ######### PEDIDOS JURISDICCIONALES #########
    else {
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

          //console.log(this.pedido.lista[i].lista_clues);
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
        });
        insumo.cantidad_recibida = 0;
        insumo.cantidad = item.cantidad;
        insumo.monto = insumo.cantidad * insumo.precio;
        
        this.pedido.lista.push(insumo);
      }
    }
    // ############################################

    this.pedido.indexar();    

    if(this.pedido.paginacion.lista.length == this.pedido.paginacion.resultadosPorPagina
        && this.pedido.paginacion.paginaActual == auxPaginasTotales
        && !this.pedido.filtro.activo){
          this.pedido.listar(this.pedido.paginacion.paginaActual + 1);
    } else {
      this.pedido.listar(this.pedido.paginacion.paginaActual);
    }
    console.log(this.pedido);
  }
  
  modificarItem(item:any = {}){
    item.monto = item.cantidad * item.precio;
    this.pedido.actualizarTotales();

    //quitamos el error si existe
    if(this.erroresEnInsumos.lista[item.clave]){
      delete this.erroresEnInsumos.lista[item.clave];
      this.erroresEnInsumos.errores -= 1;
    }

    //validamos la cantidad, para determinar si hay un error y agregarlo
    if(item.cantidad < item.cantidad_recibida || item.cantidad <= 0){
      this.erroresEnInsumos.lista[item.clave] = true;
      this.erroresEnInsumos.errores += 1;
    }

    //console.log(this.erroresEnInsumos);
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

  deshabilitarAlmacen(almacen):boolean{
    if(this.esPedidoJurisdiccional && this.pedido.lista.length > 0 && this.subrogados[almacen.id]){
      return true;
    }else if(this.esOficinaJurisdiccional && this.pedido.lista.length > 0 && !this.subrogados[almacen.id]){
      return true;
    }
    return false;
  }

  //Harima: necesitamos eliminar también de la lista de claves agregadas
  eliminarInsumo(item,index,filtro:boolean = false){
    //Harima: si el insumo tiene cantidad recibida mayor a cero, no podemos eliminarla
    if(item.cantidad_recibida > 0){
      return false;
    }

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
    
    //Harima: si el insumo que estamos eliminando tiene un error, quitamos el error del arreglo
    if(this.erroresEnInsumos.lista[item.clave]){
      delete this.erroresEnInsumos.lista[item.clave];
      this.erroresEnInsumos.errores -= 1;
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
    var validacion_palabra = prompt("Atención el pedido ya no podra editarse, para confirmar que desea concluir el pedido por favor escriba: CONCLUIR PEDIDO");
    if(validacion_palabra == 'CONCLUIR PEDIDO'){
      this.guardar(true);
    }else{
      if(validacion_palabra != null){
        alert("Error al ingresar el texto para confirmar la acción.");
      }
      return false;
    }
  }

  guardar(finalizar:boolean = false){
    this.guardando = true;
    var guardar_pedido;
    this.mensajeError.mostrar = false;
    /*var guardar_pedidos = [];
    for(var i in this.pedidos){
      guardar_pedidos.push(this.pedidos[i].obtenerDatosGuardar());
    }*/
    if(this.almacenDelUsuario.tipo_almacen != 'ALMPAL'){
      this.pedido.datos.controls['almacen_solicitante'].setValue(this.almacenDelUsuario.id);
    }else{
      this.pedido.datos.controls['almacen_proveedor'].setValue('SIN ALMACEN PROVEEDOR');
    }

    if(this.pedido.datos.invalid){
      this.pedido.datos.get('almacen_solicitante').markAsTouched();
      this.pedido.datos.get('almacen_proveedor').markAsTouched();
      this.pedido.datos.get('descripcion').markAsTouched();
      this.pedido.datos.get('fecha').markAsTouched();
      this.guardando = false;
      return false;
    }

    if(this.erroresEnInsumos.errores > 0){
      var insumos_errores = [];
      for(var i in this.erroresEnInsumos.lista){
        insumos_errores.push(i);
      }
      this.mensajeError = new Mensaje(false);
      this.mensajeError.texto = 'Se encontaron errores en los siguientes insumos: ' + insumos_errores.join(', ');
      this.mensajeError.mostrar = true;
      this.guardando = false;
      return false;
    }

    guardar_pedido = this.pedido.obtenerDatosGuardar();

    if(finalizar){
      guardar_pedido.datos.status = 'CONCLUIR';

      if(this.almacenDelUsuario.tipo_almacen == 'ALMPAL'){
        let causes_material_disponible = this.totalMontoComprometidoCausesMaterial + (this.presupuesto.insumos_disponible - (+this.pedido.totalMontoCauses.toFixed(2) + +this.pedido.totalMontoMaterialCuracion.toFixed(2)));
        let no_causes_disponible = this.totalMontoComprometidoNoCauses + this.presupuesto.no_causes_disponible - +this.pedido.totalMontoNoCauses.toFixed(2);
  
        //if((this.presupuesto.causes_disponible - +this.pedido.totalMontoCauses.toFixed(2)) < 0 || (this.presupuesto.no_causes_disponible - +this.pedido.totalMontoNoCauses.toFixed(2)) < 0 || (this.presupuesto.material_curacion_disponible - +this.pedido.totalMontoMaterialCuracion.toFixed(2)) < 0){
        if( causes_material_disponible < 0 || no_causes_disponible < 0){
          this.guardando = false;
          this.mensajeError = new Mensaje(true);
          this.mensajeError.texto = 'Presupuesto insuficiente';
          this.mensajeError.mostrar = true;
          return false;
        }
      }
      
      /*for(var i in guardar_pedidos){
        guardar_pedidos[i].datos.status = 'ES';
      }*/
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
            this.router.navigate(['/almacen/pedidos/ver/'+pedido.id]);
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
          //this.guardando = false;
          //console.log('Pedido creado');
          //console.log(pedido);
          this.router.navigate(['/almacen/pedidos/editar/'+pedido.id]);
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
    this.cargarPresupuesto(this.mes,this.anio);

    this.almacenSeleccionado = {id:almacen_seleccionado,subrogado:this.es_almacen_subrogado};

    if(this.esOficinaJurisdiccional && !this.subrogados[almacen_seleccionado]){
      this.esPedidoJurisdiccional = true;
    }else{
      this.esPedidoJurisdiccional = false;
    }
  }

  cargarAlmacenes() {
    this.cargandoAlmacenes = true;

    // ######### PEDIDOS JURISDICCIONALES #########
    
    var subrogado = null;
    if(this.esPedidoJurisdiccional && this.esEditar && this.esOficinaJurisdiccional){
      subrogado = 0;
    }else if(!this.esPedidoJurisdiccional && this.esEditar && this.esOficinaJurisdiccional){
      subrogado = 1;
    }
    
    // ############################################
    
    this.almacenesService.catalogo(subrogado).subscribe(
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
          // ######### PEDIDOS JURISDICCIONALES #########
          else {
            // Akira: esto es para seleccionar por default al primero
            if(this.esPedidoJurisdiccional){
              /*this.pedido.datos.patchValue({
                almacen_solicitante: this.almacenes[0].id
              });
              this.cambioAlmacen();
              */
            }
            
          }
          // ############################################
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
    console.log(fecha);
    let fecha_valida = fecha.split('-');
    if(fecha_valida.length == 3){
      let mes:any = fecha_valida[1];
      let anio:any = fecha_valida[0];
      if(mes.length == 2 && anio.length == 4){
        mes = parseInt(mes);
        anio = parseInt(anio);
        if((mes != this.mes || anio != this.anio) && (mes > 0 && mes < 13)){
          this.cargarPresupuesto(mes,anio);
        }
      }
    }
  }

  cargarPresupuesto(mes:number = 0, anio:number = 0){
    if(mes == 0){
      let now = new Date();
      mes = (now.getMonth() + 1);
    }

    if(anio == 0){
      let now = new Date();
      anio = now.getFullYear();
    }

    this.mes = mes;
    this.anio = anio;

    let almacen_seleccionado = this.pedido.datos.get('almacen_solicitante').value;
    if(almacen_seleccionado){
      this.cargandoPresupuestos = true;
      let presupuesto_id = 0;
      if(this.esEditar){
        presupuesto_id = this.pedido.presupuesto_id;
      }
      this.pedidosService.presupuesto(mes,anio,almacen_seleccionado,presupuesto_id).subscribe(
        response => {
          this.cargando = false;
          if(response.data){
            this.presupuesto = response.data;
            console.log(this.presupuesto);
          }else{
            
            this.presupuesto.insumos_disponible = 0;
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
    window.open(`${environment.API_URL}/generar-excel-pedido/${this.pedido.id}?${query}`); 
    //window.open(environment.API_URL+"/generar-excel-pedido/"+this.pedido.id, "_blank");
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

  ngOnDestroy(){
    this.cambiarEntornoSuscription.unsubscribe();
  }
}
