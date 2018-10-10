import { Component, OnInit, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router'

import { Subscription }   from 'rxjs/Subscription';

import  * as FileSaver    from 'file-saver'; 

import { ActasService } from '../actas.service';
import { PedidosService } from '../../pedidos.service';
import { CambiarEntornoService } from '../../../../perfil/cambiar-entorno.service';

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css'],
  providers: [ActasService]
})
export class VerComponent implements OnInit {

	id:any;
	acta:any;
	pedido_original: any;
	pedidos_alternos: any[] = [];
	presupuesto:any;

	cargando: boolean = false;
	cargandoActa: boolean = false;
	cargandoPresupuesto: boolean = false;

	pdfworker:Worker;
	errorPDFActa:boolean = false;
	
	cambiarEntornoSuscription: Subscription;

  	constructor(
		  	private title: Title, 
			private location: Location, 
			private router: Router,
			private route: ActivatedRoute,
			private _ngZone: NgZone,
			private apiService: ActasService, 
			private pedidosService: PedidosService, 
			private cambiarEntornoService:CambiarEntornoService) { }

  	ngOnInit() {

		this.title.setTitle("Ver Acta");
		this.cargarPresupuestoAnual();
		
		this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
			console.log("cambiar a listas")
		});
		this.route.params.subscribe(params => {
			this.id = params['id'];
		});

		// Este es un hack para poder usar variables del componente dentro de una funcion del worker
		var self = this;    
		var $ngZone = this._ngZone;

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

		this.cargando = true;
    	this.apiService.ver(this.id).subscribe(
			acta => {
				this.acta = acta;				
				this.cargando = false;

				for(var i in this.acta.pedidos){
					if(this.acta.pedidos[i].tipo_pedido_id != 'PALT'){
						this.pedido_original = this.acta.pedidos[i];
					} else {
						this.pedidos_alternos.push(this.acta.pedidos[i]);
					}
				}
			}, error => {
				this.cargando = false;
				console.log(error);
			}
		)
	}
	

	cargarPresupuestoAnual(){
		this.cargandoPresupuesto = true;
		this.pedidosService.presupuesto().subscribe(
		response => {
			this.cargandoPresupuesto = false;
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
			this.cargandoPresupuesto = false;
			console.log(error);
		}
		);
	}
	imprimir(){
		this.cargandoActa = true;
		this.pdfworker.postMessage(JSON.stringify(this.acta));

	}
	base64ToBlob( base64, type ) {
		var bytes = atob( base64 ), len = bytes.length;
		var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
		for ( var i=0 ; i < len ; i++ )
		view[i] = bytes.charCodeAt(i) & 0xff;
		return new Blob( [ buffer ], { type: type } );
	}
  

}
