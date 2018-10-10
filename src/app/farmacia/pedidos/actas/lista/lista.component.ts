import { Component, OnInit,NgZone } from '@angular/core';
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

import  * as FileSaver    from 'file-saver'; 

import { PedidosService } from '../../pedidos.service';
import { ActasService } from '../actas.service';
import { CambiarEntornoService } from '../../../../perfil/cambiar-entorno.service';

import { Pedido } from '../../pedido';
import { Mensaje } from '../../../../mensaje';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  providers: [ActasService]
})
export class ListaComponent implements OnInit {
  cargando: boolean = false;
  cargandoActa: boolean = false;

 
  pdfworker:Worker;
  errorPDFActa:boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  // # SECCION: Lista
  status: string;
  tipo:string = '';

  pedidos: Pedido[] = [];
  presupuesto:any = false;
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

  cambiarEntornoSuscription: Subscription;

  constructor(private title: Title, private route: ActivatedRoute, private apiService: ActasService, private pedidosService: PedidosService, private cambiarEntornoService:CambiarEntornoService, private _ngZone: NgZone, ) { }

  	ngOnInit() {
   
		console.log('inicializar lista de actas');
		this.title.setTitle("Actas");

		this.cargarPresupuestoAnual();

		this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
		console.log('subscripcion en lista de actas');
		this.listar(this.paginaActual);
		this.cargarPresupuestoAnual();
		});

		this.listar(1);
		this.mensajeError = new Mensaje();
		this.mensajeExito = new Mensaje();

		// Este es un hack para poder usar variables del componente dentro de una funcion del worker
		var self = this;    
		var $ngZone = this._ngZone;

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
		}).catch( function handleError(error){ 
		
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
		this.pdfworker = new Worker("web-workers/farmacia/actas/imprimir.js")
		this.pdfworker.onmessage = function( evt ) {       
			// Esto es un hack porque estamos fuera de contexto dentro del worker
			// Y se usa esto para actualizar alginas variables
			$ngZone.run(() => {
				console.log(evt);
				self.cargandoActa = false;
			});
	
			FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
			//open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
		};
	
		this.pdfworker.onerror = function( e ) {
			$ngZone.run(() => {
				console.log(e);
				self.errorPDFActa = true;
				//self.cargandoPdf[error.tipoPedido] = false;
			});
		//console.log(e)
		};
	}

	cargarPresupuestoAnual(){
		this.pedidosService.presupuesto().subscribe(
		response => {
			this.cargando = false;
			//this.presupuesto = response.data;
			this.presupuesto = {};
			
			this.presupuesto.causes_modificado = +response.data.causes_modificado;
			this.presupuesto.causes_comprometido = +response.data.causes_comprometido;
			this.presupuesto.causes_devengado = +response.data.causes_devengado;
			this.presupuesto.causes_disponible = +response.data.causes_disponible;
			
			this.presupuesto.material_curacion_modificado = +response.data.material_curacion_modificado;
			this.presupuesto.material_curacion_comprometido = +response.data.material_curacion_comprometido;
			this.presupuesto.material_curacion_devengado = +response.data.material_curacion_devengado;
			this.presupuesto.material_curacion_disponible = +response.data.material_curacion_disponible;
			
			this.presupuesto.no_causes_modificado = +response.data.no_causes_modificado;
			this.presupuesto.no_causes_comprometido = +response.data.no_causes_comprometido;
			this.presupuesto.no_causes_devengado = +response.data.no_causes_devengado;
			this.presupuesto.no_causes_disponible = +response.data.no_causes_disponible;
		},
		error => {
			this.cargando = false;
			console.log(error);
		}
		);
	}

	obtenerDireccion(id:string, status:string): string{
		if(status == 'BR'){
		return '/almacen/pedidos/editar/'+id;
		}else{
		return '/almacen/pedidos/ver/'+id;
		}
	}
  
	buscar(term: string): void {
		this.terminosBusqueda.next(term);
	}

	listarBusqueda(term:string ,pagina:number): void {
		this.paginaActualBusqueda = pagina;
		console.log("Cargando búsqueda.");
	
		this.cargando = true;
		

		
		this.apiService.buscar( term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
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
		
		this.apiService.lista(pagina,this.resultadosPorPagina).subscribe(
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

	ngOnDestroy(){
		this.cambiarEntornoSuscription.unsubscribe();
	}
	imprimir(item) {
		try {
			
			item.cargando = true;
			this.apiService.ver(item.id).subscribe(
				acta => {
					this.cargandoActa = true;
					this.pdfworker.postMessage(JSON.stringify(acta));
					item.cargando = false;
				}, error => {
					item.cargando = false;
					console.log(error);
				}
			)
			
		} catch (e){
			item.cargando = false;
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
