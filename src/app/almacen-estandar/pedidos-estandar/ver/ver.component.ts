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
import { PedidosEstandarService } from '../pedidos.service';
import { Pedido } from '../pedido';
import { Almacen } from '../../../catalogos/almacenes/almacen';

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css'],
  host: { '(window:keydown)' : 'keyboardInput($event)'}
})


export class VerComponent implements OnInit {

  cargando: boolean = false;
  cargandoAlmacenes: boolean = false;
  cargandoInsumos: boolean = false;
  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION  

  mostrarImprimirDialogo:boolean = false;
  mostrarCancelarDialogo:boolean = false;
  mostrarPedidoAlternoDialogo:boolean = false;
  tiposSubPedidos:string[] = [];
  subPedidos:any = {};
  listaInsumosPedidoAlterno:any=[];

  recepciones:any = {};
  tieneRecepcionIniciada:boolean = false;

  meses:any = {1:'Enero', 2:'Febrero', 3:'Marzo', 4:'Abril', 5:'Mayo', 6:'Junio', 7:'Julio', 8:'Agosto', 9:'Septiembre', 10:'Octubre', 11:'Noviembre', 12:'Diciembre'};

  dialogCancelarFechaTransferencia: any = {};
  dialogCancelarMeses: any[] = [];
  errorCancelarPedido: boolean = false;
  errorCancelarPedidoTexto: string = '';
  cancelandoPedido:boolean = false;
  
  errorCancelarTransferencia: boolean = false;
  errorCancelarTransferenciaTexto: string = '';
  mostrarCancelarTransferenciaDialogo: boolean = false;
  motivosCancelarTransferencia: string = '';
  
  puedeCancelarTransferencia:boolean = false;

	//Pedido alterno
	errorGenerarPedidoAlterno: boolean = false;
	errorGenerarPedidoAlternoTexto: string = '';
	generandoPedidoAlterno:boolean = false;
	acta:any = {
		fecha: new Date(),
		hora_inicio: new Date(),
		hora_termino: new Date((new Date()).setHours( (new Date()).getHours() + 1 )),
		ciudad: null,
		lugar_reunion: null
	}
	errores_acta = {
		fecha: null,
		hora_inicio: null,
		hora_termino: null,
		ciudad: null,
		lugar_reunion: null,
	}
  //Harima: para ver si el formulaior es para crear o para editar
  formularioTitulo:string = 'Nuevo';
  esEditar:boolean = false;
  
  // # SECCION: Modal Insumos
  mostrarModalInsumos = false;
  //Harima: Lista de claves agregadas al pedido, para checar duplicidad
  //listaClaveAgregadas: Array<string> = [];
  // # FIN SECCION

  // # SECCION: Pedido

  almacenes: Almacen[];
  pedido: Pedido;
  
  porcentageTotalPedido: number = 0.00;
  // # FIN SECCION

  // # SECCION: Reportes
  pdfworker:Worker;
  cargandoPdf:any = {};
  errorEnPDF:boolean = false;
  pdfworkerActa:Worker;
  cargandoActa:boolean = false;
  errorPDFActa:boolean = false;
  // # FIN SECCION

  usuario:any = {};
  permisos:any[] = []; 

  permisoCancelarPedido = false;

  cambiarEntornoSuscription: Subscription;

  constructor(
    private title: Title, 
    private location: Location, 
    private router: Router,
    private route: ActivatedRoute,
    private _ngZone: NgZone, 
    private pedidosService: PedidosEstandarService,
    private almacenesService: AlmacenesService,
    private fb: FormBuilder,
    private cambiarEntornoService:CambiarEntornoService
  ) { }

  ngOnInit() {
    this.title.setTitle('Nuevo pedido / Almacén');
    this.usuario = JSON.parse(localStorage.getItem("usuario"));

    this.permisos = this.usuario.permisos.split('|');

    for(let i in this.permisos){
      if(this.permisos[i] == 'pVJrPewkPFwidvmECcgg8BqVXn7FtH7E'){        
        this.permisoCancelarPedido = true;
      }
    }

    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.router.navigate(['/almacen/pedidos']);
    });

    // Inicializamos el objeto para los reportes con web Webworkers
    //this.pdfworker = new Worker("web-workers/farmacia/pedidos/imprimir.js")
    this.pdfworker = new Worker("web-workers/farmacia/pedidos/pedido-proveedor.js")
    this.pdfworkerActa = new Worker("web-workers/farmacia/actas/imprimir.js")
    
    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    let self = this;    
    var $ngZone = this._ngZone;
    
    this.pdfworker.onmessage = function( evt ) {       
      // Esto es un hack porque estamos fuera de contexto dentro del worker
      // Y se usa esto para actualizar alginas variables
      $ngZone.run(() => {
        console.log(evt);
        self.cargandoPdf[evt.data.tipoPedido] = false;
      });

      FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
      //open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
    };

    this.pdfworker.onerror = function( e ) {
      $ngZone.run(() => {
        console.log(e);
        self.errorEnPDF = true;
        //self.cargandoPdf[error.tipoPedido] = false;
      });
      //console.log(e)
    };
    this.pdfworkerActa.onmessage = function( evt ) {       
		// Esto es un hack porque estamos fuera de contexto dentro del worker
		// Y se usa esto para actualizar alginas variables
		$ngZone.run(() => {
			console.log(evt);
			self.cargandoActa = false;
		});

		FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
		//open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
	};

	this.pdfworkerActa.onerror = function( e ) {
		$ngZone.run(() => {
			console.log(e);
			self.errorPDFActa = true;
			//self.cargandoPdf[error.tipoPedido] = false;
		});
	//console.log(e)
	};

    
    // Inicialicemos el pedido
    this.pedido = new Pedido(true);

    this.route.params.subscribe(params => {
      //this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      if(params['id']){
        this.cargando = true;
        this.pedido.id = params['id'];
        this.pedido.status = 'PS';
        //cargar datos del pedido
        this.esEditar = true;
        this.formularioTitulo = 'Editar';

        this.pedidosService.ver(params['id']).subscribe(
          pedido => {
            //this.datosCargados = true;
            //this.pedidos[0].datos.patchValue(pedido);
            this.pedido.datosImprimir = pedido;
            this.pedido.status = pedido.status;
            this.pedido.recepcionPermitida = pedido.recepcion_permitida;
            this.pedido.tipo_pedido = pedido.tipo_pedido_id;

            let enviado_sin_recibir = 0;

            for(let i in pedido.insumos){
              let dato = pedido.insumos[i];
              let insumo = dato.insumos_con_descripcion;
              insumo.cantidad = +dato.cantidad_solicitada;
              insumo.cantidad_recibida = (+dato.cantidad_recibida||0);
              insumo.monto = +dato.monto_solicitado;
              insumo.monto_recibido = (+dato.monto_recibido||0);
							insumo.precio = +dato.precio_unitario;
              
              if(dato.cantidad_enviada){
                enviado_sin_recibir += dato.cantidad_enviada - dato.cantidad_recibida;
              }

							//Akira: Tuve que agregar el tipo_insumo_id para cuando se cree el pedido alterno
							insumo.tipo_insumo_id = dato.tipo_insumo_id;

              this.pedido.lista.push(insumo);
              //this.listaClaveAgregadas.push(insumo.clave);
              //let tipo_insumo = 'ST';
              
              let clave_tipo_insumo = 'SC';
              
              clave_tipo_insumo = dato.tipo_insumo.clave;
              
              if(!this.subPedidos[clave_tipo_insumo]){
                let tiene_iva = false;
                if(dato.tipo_insumo.clave == 'MC'){
                  tiene_iva = true;
                }
                this.tiposSubPedidos.push(clave_tipo_insumo);
                this.cargandoPdf[clave_tipo_insumo] = false;
                this.subPedidos[clave_tipo_insumo] = {
                  'titulo':dato.tipo_insumo.nombre,
                  'clave_folio':clave_tipo_insumo,
                  'claves':0,
                  'cantidad':0,
                  'monto':0,
                  'iva':0,
                  'tiene_iva':tiene_iva,
                  'lista':[]
                }
              }

              this.subPedidos[clave_tipo_insumo].claves++;
              this.subPedidos[clave_tipo_insumo].cantidad += insumo.cantidad;
              this.subPedidos[clave_tipo_insumo].monto += insumo.monto;
              this.subPedidos[clave_tipo_insumo].lista.push(insumo);
            }

            if(pedido.tipo_pedido_id == 'PEA' && (pedido.status == 'ET' || pedido.status == 'SD')){
              for(var i in pedido.historial_transferencia_completo){
                let historial = pedido.historial_transferencia_completo[i];

                if(historial.evento == 'CAPTURA PEA'){
                  this.puedeCancelarTransferencia = true;
                }else if(historial.evento == 'SURTIO PEA'){
                  this.puedeCancelarTransferencia = false;
                }else if(historial.evento == 'RECEPCION PEA' && enviado_sin_recibir == 0){
                  this.puedeCancelarTransferencia = true;
                }
              }
              this.puedeCancelarTransferencia = true;
            }else{
              for(let i in pedido.recepciones){
                if(pedido.recepciones[i].entrada){
                  if(pedido.recepciones[i].entrada.status == 'BR'){
                    this.tieneRecepcionIniciada = true;
                  }
                }
              }
            }
            
            pedido.insumos = undefined;
            this.pedido.indexar();
            this.pedido.listar(1);

            let porcentajeClaves = ((this.pedido.datosImprimir.total_claves_recibidas||0) / this.pedido.lista.length) * 100; 
            let porcentajeCantidad = ((this.pedido.datosImprimir.total_cantidad_recibida||0) / this.pedido.totalInsumos) * 100;
            let porcentajeMonto = ((this.pedido.datosImprimir.total_monto_recibido||0) / this.pedido.totalMonto) * 100;
            
            this.porcentageTotalPedido = (porcentajeCantidad + porcentajeClaves + porcentajeMonto)/3;

            this.cargando = false;
          },
          error => {
            this.cargando = false;

            this.mensajeError = new Mensaje(true,5);

            try {
              let e = error.json();
              if (error.status == 401 ){
                this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
              }else{
                this.mensajeError.texto = e.error;
              }
              this.mensajeError.mostrar;
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
    if(this.pedido.status){
      if(this.pedido.status == 'PS'){
        return '/almacen-estandar/pedidos/por-surtir';
      }else if(this.pedido.status == 'ET'){
        return '/almacen-estandar/pedidos/en-transito';
      }else if(this.pedido.status == 'FI'){
        return '/almacen-estandar/pedidos/finalizados';
      }else if(this.pedido.status == 'EF'){
        return '/almacen-estandar/pedidos/farmacia-subrogada';
      }else if(this.pedido.status == 'EX'){
        return '/almacen-estandar/pedidos/expirados';
      }else if(this.pedido.status == 'EX-CA'){
        return '/almacen-estandar/pedidos/expirados-cancelados';
      }else if(this.pedido.status == 'PV' || this.pedido.status == 'VAL'){
        return '/almacen-estandar/pedidos/alternos';
      }else{
        return '/almacen-estandar/pedidos/todos';
      }
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

  mostrarFichaInformativa(e, clave: string){
    e.preventDefault();
    e.stopPropagation();

    // Mostrar el componente de Ficha Informativa
    // Falta hacerlo sumamiiiii :)
    alert(clave);
    console.log(clave);
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

  imprimir(tipo:string = '') {
    try {
      this.cargandoPdf[tipo] = true;
      var pedidos_imprimir = {
        datos: this.pedido.datosImprimir,
        insumos: this.subPedidos[tipo]
      };
      this.pdfworker.postMessage(JSON.stringify(pedidos_imprimir));
    } catch (e){
      this.cargandoPdf[tipo] = false;
      console.log(e);
    }
  }

  imprimirActa() {
		try {
			this.cargandoActa = true;
			
			this.pdfworkerActa.postMessage(JSON.stringify(this.pedido.datosImprimir.acta));
		} catch (e){
			this.cargandoActa = false;
			console.log(e);
		}
	}

  mostrarDialogo(){
    this.mostrarImprimirDialogo = true;
  }

  cerrarDialogo(){
    this.mostrarImprimirDialogo = false;
  }

  mostrarDialogoCancelarPedido(){
    this.dialogCancelarMeses = [];
    this.errorCancelarPedido = false;
    this.errorCancelarPedidoTexto = 'Ocurrio un error al intentar cancelar el pedido';
    let fecha_pedido = this.pedido.datosImprimir.fecha.split('-');

    let now = new Date();
    let anio = now.getFullYear();
    let mes = now.getMonth()+1;

    let mes_pedido = parseInt(fecha_pedido[1]);

    this.dialogCancelarMeses.push({
      anio: parseInt(fecha_pedido[0]),
      mes: mes,
      descripcion: this.meses[mes] + ' ' + fecha_pedido[0]
    });

    for(var i = 1; i <= 2; i++){
      mes += 1;
      if(mes <= 12){
        this.dialogCancelarMeses.push({
          anio: parseInt(fecha_pedido[0]),
          mes: mes,
          descripcion: this.meses[mes] + ' ' + fecha_pedido[0]
        });
      }
    }
    
    this.dialogCancelarFechaTransferencia = this.dialogCancelarMeses[0];

    this.mostrarCancelarDialogo = true;
  }

  mostrarDialogoCancelarTransferencia(){
    this.errorCancelarTransferencia = false;
    this.errorCancelarTransferenciaTexto = 'Ocurrio un error al intentar cancelar el pedido';
    this.mostrarCancelarTransferenciaDialogo = true;
    this.motivosCancelarTransferencia = '';
  }

  mostrarDialogoPedidoAlternoPedido(){
    //
    this.mostrarPedidoAlternoDialogo = true;
    this.listaInsumosPedidoAlterno = [];
    
    for(let i in this.pedido.lista){
      let insumo = this.pedido.lista[i];

      let faltante = insumo.cantidad - insumo.cantidad_recibida;

      if(faltante){
        this.listaInsumosPedidoAlterno.push(
          {
            'clave':insumo.clave,
            'descripcion':insumo.descripcion,
            'cantidad_limite': faltante,
            'cantidad':faltante,
						'precio':insumo.precio,
						'tipo':insumo.tipo,
						'tipo_insumo_id':insumo.tipo_insumo_id,
						'es_causes':insumo.es_causes 
          }
        );
      }
    }
  }
  
  cancelarTransferencia(){
    var validacion_palabra = prompt("Para confirmar esta transacción, por favor escriba: CANCELAR TRANSFERENCIA");
    if(validacion_palabra == 'CANCELAR TRANSFERENCIA'){

      if(this.motivosCancelarTransferencia == ''){
        this.errorCancelarTransferencia = true;
        this.errorCancelarTransferenciaTexto = "No se especificó ningún motivo.";
        return false;
      }

      this.cancelandoPedido = true;
      
      let parametros = {motivos:this.motivosCancelarTransferencia};

      this.pedidosService.cancelarTransferencia(this.pedido.datosImprimir.id,parametros).subscribe(
        respuesta => {
          //this.transaccion_clues_origen = {clues:''}; //"";
          this.pedido.status = 'EX-CA';

          this.cancelandoPedido = false;
          this.mostrarCancelarTransferenciaDialogo = false;
          this.errorCancelarTransferencia = false;
          // Akira: Quizás aquí deberia limpiar el filtro pa ver el registro.
        }, error =>{
          console.log(error);
          this.errorCancelarTransferencia = true;
          this.cancelandoPedido = false;
          this.mostrarCancelarTransferenciaDialogo = true;

          try {

            let e = error.json();

            if (error.status == 401 ){
              this.errorCancelarTransferenciaTexto = "No tiene permiso para esta acción.";
            }
            if (error.status == 500 ){
              this.errorCancelarTransferenciaTexto = "500 (Error interno del servidor)";
            }

            if(e.error){
              this.errorCancelarTransferenciaTexto = e.error;
            }
          } catch(e){

            if (error.status == 500 ){
              this.errorCancelarTransferenciaTexto = "500 (Error interno del servidor)";
            } else {
              this.errorCancelarTransferenciaTexto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }          
          }
        }
      );
    }else{
      if(validacion_palabra != null){
        alert("Error al ingresar el texto para confirmar la transferencia.");
      }
      return false;
    }
  }

  transferirRecurso(){
    var validacion_palabra = prompt("Para confirmar esta transacción, por favor escriba: CANCELAR PEDIDO");
    if(validacion_palabra == 'CANCELAR PEDIDO'){
      this.cancelandoPedido = true;

      let parametros = {
        transferir_a_mes: this.dialogCancelarFechaTransferencia.mes,
        transferir_a_anio: this.dialogCancelarFechaTransferencia.anio
      };

      this.pedidosService.cancelarPedidoTransferir(this.pedido.datosImprimir.id,parametros).subscribe(
        respuesta => {
          //this.transaccion_clues_origen = {clues:''}; //"";
          this.pedido.status = 'EX-CA';

          this.cancelandoPedido = false;
          this.mostrarCancelarDialogo = false;
          this.errorCancelarPedido = false;
          // Akira: Quizás aquí deberia limpiar el filtro pa ver el registro.
        }, error =>{
          console.log(error);
          this.errorCancelarPedido = true;
          this.cancelandoPedido = false;
          this.mostrarCancelarDialogo = true;

          try {

            let e = error.json();

            if (error.status == 401 ){
              this.errorCancelarPedidoTexto = "No tiene permiso para esta acción.";
            }
            if (error.status == 500 ){
              this.errorCancelarPedidoTexto = "500 (Error interno del servidor)";
            }

            if(e.error){
              this.errorCancelarPedidoTexto = e.error;
            }
          } catch(e){

            if (error.status == 500 ){
              this.errorCancelarPedidoTexto = "500 (Error interno del servidor)";
            } else {
              this.errorCancelarPedidoTexto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }          
          }
        }
      );
    }else{
      if(validacion_palabra != null){
        alert("Error al ingresar el texto para confirmar la transferencia.");
      }
      return;
    }
  }

  cerrarDialogoCancelarPedido(){
    this.mostrarCancelarDialogo = false;
  }

  cerrarDialogoCancelarTransferencia(){
    this.mostrarCancelarTransferenciaDialogo = false;
  }

  cerrarDialogoPedidoAlterno(){
    this.mostrarPedidoAlternoDialogo = false;
  }

  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
	}
	
	elaborarPedidoAlterno()
	{
		// Akira:
		console.log(this.acta.hora_termino);
		var validacion_palabra = prompt("Para confirmar esta transacción, por favor escriba: PEDIDO ALTERNO");
		if(validacion_palabra == 'PEDIDO ALTERNO'){
			this.generandoPedidoAlterno = true;
			this.errores_acta = {
				fecha: null,
				hora_inicio: null,
				hora_termino: null,
				ciudad: null,
				lugar_reunion: null,
			}
			let parametros = {
				insumos: this.listaInsumosPedidoAlterno,
				ciudad: this.acta.ciudad,
				lugar_reunion: this.acta.lugar_reunion,
				fecha: this.acta.fecha.getFullYear() + "-" + this.acta.fecha.getMonth() + "-" + this.acta.fecha.getDate(),
				hora_inicio: this.acta.hora_inicio.getHours() + ":" + this.acta.hora_inicio.getMinutes() + ":00",
				hora_termino: this.acta.hora_termino.getHours() + ":" + this.acta.hora_termino.getMinutes() + ":00"
			}
			this.pedidosService.generarPedidoAlterno(this.pedido.datosImprimir.id, parametros).subscribe(
				respuesta => {
					this.generandoPedidoAlterno = false;
					this.router.navigate(['/almacen-estandar/pedidos/actas/'+ respuesta.id]);
          //window.location.reload();
				}, error => {
					this.generandoPedidoAlterno = false;
					this.errorGenerarPedidoAlterno = true;
		
					try {		
						let e = error.json();		
						if (error.status == 401 ){
							this.errorGenerarPedidoAlternoTexto = "No tiene permiso para esta acción.";
						} else
						if (error.status == 409 ){
							this.errorGenerarPedidoAlternoTexto = "Verifique los campos marcados de color rojo.";

							for (var input in e.error){
								// Iteramos todos los errores
								for (var i in e.error[input]){
								  this.errores_acta[input] = e.error[input][i];
								}                      
							   }
						} else
						if (error.status == 500 ){
							this.errorGenerarPedidoAlternoTexto = "500 (Error interno del servidor)";
						} else
		
						if(e.error){
							this.errorGenerarPedidoAlternoTexto = e.error;
						}
					} catch(e){		
						if (error.status == 500 ){
							this.errorGenerarPedidoAlternoTexto = "500 (Error interno del servidor)";
						} else {
							this.errorGenerarPedidoAlternoTexto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
						}          
					}
				}
			);
		} else {
		if(validacion_palabra != null){
			alert("Error al ingresar el texto para confirmar la generación del pedido alterno.");
		}
		return;
		}    
	}
	validarCantidad(input){
		if(input.value < 0 || isNaN(input.value) || Math.sign(input.value) == 0) {
			input.value = 0;
		}
	}

  ngOnDestroy(){
    this.cambiarEntornoSuscription.unsubscribe();
  }
}
