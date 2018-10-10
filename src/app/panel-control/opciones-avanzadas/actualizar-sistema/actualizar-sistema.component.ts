import { Component, OnInit, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Headers, Http, Response, RequestOptions, ResponseContentType } from '@angular/http';

import { OpcionesAvanzadasService } from '../opciones-avanzadas.service';
import { environment } from '../../../../environments/environment';
import { PATCHES } from '../../../patches';

@Component({
  selector: 'app-actualizar-sistema',
  templateUrl: './actualizar-sistema.component.html',
  styleUrls: ['./actualizar-sistema.component.css']
})
export class ActualizarSistemaComponent implements OnInit {
  cargando: boolean = false;
  mostrarLog:boolean = false;
  logActualizacion:string = "";

  tabOnline = false;
  tabParches = true;
  tabParchesCliente = true;
  tabParchesAPI = false;


  errores = {
		archivo: null
	}
  cargandoParches = false;
  mostrarModalSubirParche:boolean = false;
  mensajeErrorSync:string = "";
  archivo:File = null;
  archivoSubido:boolean = false;
  enviandoDatos: boolean = false;
  progreso: number = 0;

  parches_cliente:any[] = [];
  parches_api:any[] = [];
  
  constructor(private apiService:OpcionesAvanzadasService, private http:Http) {}

  ngOnInit() {
		this.listarParches();
		this.parches_cliente = PATCHES;
  }

  actualizarViaGit() {
    this.apiService.actualizarViaGit().subscribe(
			respuesta => {
				this.cargando = false;				
				this.logActualizacion = respuesta;
				this.mostrarLog = true;
				
			
			},
			error => {
				this.cargando = false;				
				console.log(error);

			}
		);
  }

  listarParches() {
    this.cargandoParches = true;
    this.apiService.listarParches().subscribe(
			respuesta => {
				this.cargandoParches = false;
				console.log(respuesta);
				
				this.parches_api = respuesta.api;
				for(let i in this.parches_cliente){
					if(respuesta.cliente[this.parches_cliente[i].nombre]){
						this.parches_cliente[i].fecha_aplicacion = respuesta.cliente[this.parches_cliente[i].nombre]+'';
					}
				}
			},
			error => {
				this.cargandoParches = false;				
				console.log(error);

			}
		);
  }

  ejecutarParcheApi(parche){
	this.enviandoDatos = true;
	this.apiService.ejecutarParche(parche).subscribe(
		respuesta => {
			this.enviandoDatos = false;
			console.log(respuesta);
			parche.fecha_ejecucion = true;
		},
		error => {
			this.enviandoDatos = false;				
			console.log(error);

		}
	);
  }

  adjuntarParche(){		
		if(this.archivo){

			this.errores = {
				archivo: null
			}
			this.mensajeErrorSync = "";
			this.archivoSubido = false;
			this.enviandoDatos = true;
			
			let formData:FormData = new FormData();
			formData.append('patch', this.archivo, this.archivo.name);

			let usuario = JSON.parse(localStorage.getItem("usuario"));
			
			let headers = new Headers();
			headers.delete('Content-Type');
			headers.append('Authorization',  'Bearer ' + localStorage.getItem('token'));
			headers.append('X-Clues',usuario.clues_activa.clues);
			headers.append('X-Almacen-Id',usuario.almacen_activo.id);
			let options = new RequestOptions({ headers: headers });
			//let options = new RequestOptions({ headers: headers });
			
			var responseHeaders:any;
      		var contentDisposition:any;
			
			this.http.post(`${environment.API_URL}/patches/ejecutar`, formData, options)										
				.subscribe(
					response => {
						this.logActualizacion = response.json().data;
						
						let parche = {nombre: response.json().parche, fecha_ejecucion:false};

						this.mostrarLog = true;
						this.archivoSubido = true;
						this.enviandoDatos = false;
						
						this.progreso = 100;
						this.archivo = null;

						//this.mostrarModalSubirArchivoSQL = false;
						//this.listarParches();
						//window.location.reload();

						/*
						this.apiService.ejecutarParche(parche).subscribe(
							respuesta => {
								this.enviandoDatos = false;
								console.log(respuesta);
								parche.fecha_ejecucion = true;

								this.mostrarLog = true;
								this.archivoSubido = true;
								this.enviandoDatos = false;
								
								this.progreso = 100;
								this.archivo = null;
							},
							error => {
								this.enviandoDatos = false;
								console.log(error);
					
							}
						);
						*/
					},
					error => {
            			if(error.status == 500){
							try{
								let e = error.json();
								this.mensajeErrorSync = e.error;
							} catch(e){
								this.mensajeErrorSync = "Error interno del servidor";
							}
							
						} else if(error.status == 409){
							let e = error.json();
							this.mensajeErrorSync = "Error en el parche";
							this.logActualizacion = e.error;
            				this.mostrarLog = true;
						} else {
							let e = error.json();
							this.mensajeErrorSync = e.error;
						}
            
						this.archivoSubido = false;
						
						this.progreso = 100;
						this.enviandoDatos = false;
					}
					
				);
		}

  }

  recargarCliente(){
	window.location.reload();
  }

  fileChange(event){
		let fileList: FileList = event.target.files;
		if(fileList.length > 0) {
			this.archivo = fileList[0];
		}
	}

}
