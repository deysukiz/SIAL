import { Component, OnInit, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Headers, Http, Response, RequestOptions, ResponseContentType } from '@angular/http';



import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-base-datos',
  templateUrl: './base-datos.component.html',
  styleUrls: ['./base-datos.component.css']
})
export class BaseDatosComponent implements OnInit {
  exportando: boolean = false;

	tabRestaurar = true;
	tabCargar = false;
	tabDescargar = false;

	servidor = {id:''};

  errores = {
		archivo: null
	}
	mostrarModalSubirArchivoSQL:boolean = false;
	mostrarModalSubirDatosServidor:boolean = false;

  mensajeErrorSync:string = "";
  archivo:File = null;
  archivoSubido:boolean = false;
  enviandoDatos: boolean = false;
  progreso: number = 0;


/*
  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

*/


  constructor(private http:Http) {}

  ngOnInit() {
		let usuario = JSON.parse(localStorage.getItem('usuario'));
		this.servidor = usuario.servidor;
  }

	descargarDatos(){
		var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/opciones-avanzadas/obtener-datos-central/?${query}`); 
	}

  exportar() {
    var query = "token="+localStorage.getItem('token');
    window.open(`${environment.API_URL}/opciones-avanzadas/exportar-base-datos/?${query}`); 
  }
/*
  onUploadOutput(output: UploadOutput): void {

    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      // const event: UploadInput = {
      //   type: 'uploadAll',
      //   url: '/upload',
      //   method: 'POST',
      //   data: { foo: 'bar' }
      // };
      // this.uploadInput.emit(event);
	} else if (output.type === 'addedToQueue'  && typeof output.file !== 'undefined') { // add file to array when added
	
		
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
	  this.files[index] = output.file;
	  
	  
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
      this.dragOver = false;
    } else if (output.type === 'drop') {
      this.dragOver = false;
	} else if(output.type == 'done'){
		if (output.file.responseStatus !== 200){
			try {
				
				this.mensajeErrorSync = output.file.response.error;
			} catch(e){
				this.mensajeErrorSync = "Error desconocido, verifique en la consola."
			}
			this.archivoSubido = false;
			
		} else {
			this.archivoSubido = true;
			this.archivo = null;
		}
		this.enviandoDatos = false;
	}
	if(typeof output.file !== 'undefined'){
		this.progreso = output.file.progress.data.percentage;
	}


	
  }

  startUpload(): void {
	
    const event: UploadInput = {
      type: 'uploadAll',
      url: `${environment.API_URL}/opciones-avanzadas/importar-base-datos/`,
	  method: 'POST',
	  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'),  'Accept': 'plain/text'},
	  fieldName: "sql",
	  
    };
	
	this.uploadInput.emit(event);
	this.enviandoDatos = true;
	
	}*/
	
	cargarDatos(){
		if(this.archivo){

			this.errores = {
				archivo: null
			}
			this.mensajeErrorSync = "";
			this.archivoSubido = false;
			this.enviandoDatos = true;

			let usuario = JSON.parse(localStorage.getItem("usuario"));			
			
			let formData:FormData = new FormData();
			formData.append('sql', this.archivo, this.archivo.name);
			
			let headers = new Headers();
			headers.delete('Content-Type');
			headers.append('Authorization',  'Bearer ' + localStorage.getItem('token'));
			headers.append('X-Clues',usuario.clues_activa.clues);
			headers.append('X-Almacen-Id',usuario.almacen_activo.id);
			let options = new RequestOptions({ headers: headers });
			//let options = new RequestOptions({ headers: headers });

			
			var responseHeaders:any;
			var contentDisposition:any;
			this.http.post(`${environment.API_URL}/opciones-avanzadas/cargar-datos-servidor-central/`, formData, options)										
				.subscribe(
					response => {
						this.archivoSubido = true;
						this.enviandoDatos = false;
						//this.mostrarModalSubirArchivoSQL = false;
						this.progreso = 100;
						this.archivo = null;
					},					
					error => {
						if(error.status == 409){
							this.mensajeErrorSync = "No se pudo subir el archivo, verifica que el archivo que tratas de subir sea correcto, que el nombre no haya sido modificado. Verifica que el archivo que intentas subir ya ha sido sincronizado previamente.";
						} else if(error.status == 401){
							this.mensajeErrorSync = "El archivo que intentas subir ya ha sido sincronizado previamente";
						} else {
							this.mensajeErrorSync = "Hubo un problema al sincronizar, prueba recargar el sitio de lo contrario llama a soporte técnico.";
						}
						this.progreso = 100;
						this.enviandoDatos = false;
					}
				);	
		}
	}

  adjuntar(){
		if(this.archivo){

			this.errores = {
			archivo: null
			}
			this.mensajeErrorSync = "";
			this.archivoSubido = false;
			this.enviandoDatos = true;

			let usuario = JSON.parse(localStorage.getItem("usuario"));			
			
			let formData:FormData = new FormData();
			formData.append('sql', this.archivo, this.archivo.name);
			
			let headers = new Headers();
			headers.delete('Content-Type');
			headers.append('Authorization',  'Bearer ' + localStorage.getItem('token'));
			headers.append('X-Clues',usuario.clues_activa.clues);
			headers.append('X-Almacen-Id',usuario.almacen_activo.id);
			let options = new RequestOptions({ headers: headers });
			//let options = new RequestOptions({ headers: headers });

			
			var responseHeaders:any;
			var contentDisposition:any;
			this.http.post(`${environment.API_URL}/opciones-avanzadas/importar-base-datos/`, formData, options)										
				.subscribe(
					response => {
						
						this.archivoSubido = true;
						this.enviandoDatos = false;
						//this.mostrarModalSubirArchivoSQL = false;
						this.progreso = 100;
						this.archivo = null;
					},					
					error => {
						
						if(error.status == 409){
							this.mensajeErrorSync = "No se pudo subir el archivo, verifica que el archivo que tratas de subir sea correcto, que el nombre no haya sido modificado. Verifica que el archivo que intentas subir ya ha sido sincronizado previamente.";
						} else if(error.status == 401){
							this.mensajeErrorSync = "El archivo que intentas subir ya ha sido sincronizado previamente";
						} else {
							this.mensajeErrorSync = "Hubo un problema al sincronizar, prueba recargar el sitio de lo contrario llama a soporte técnico.";
						}
						
						this.progreso = 100;
						this.enviandoDatos = false;
					}
					
				)
			
			
			
		}

	}

  importar(){
	/*
		if(this.archivo){

			this.errores = {
			archivo: null
			}
			this.mensajeErrorSync = "";
			this.archivoSubido = false;
			this.enviandoDatos = true;
				
			let miArchivo = new SubirArchivoSQL(this.archivo);
			

			this.uploaderService.onSuccessUpload = (item, response, status, headers) => {             
				this.archivoSubido = true;
				this.enviandoDatos = false;
				//this.mostrarModalSubirArchivoSQL = false;
			};

			this.uploaderService.onErrorUpload = (item, response, status, headers) => {
				try {
					var e = JSON.parse(response);
					console.log(e.error);
					this.mensajeErrorSync = e.error;
				} catch(e){
					this.mensajeErrorSync = "Error desconocido, verifique en la consola."
				}

				this.archivoSubido = false;
				this.enviandoDatos = false;
				
			};
			this.uploaderService.onCompleteUpload = (item, response, status, headers) => {
				// complete callback, called regardless of success or failure        
				this.enviandoDatos = false;        
			};

			this.uploaderService.onProgressUpload = (item, percentComplete) => {
				// progress callback
				console.log(percentComplete)
				this.progreso = percentComplete;
			};
			
			this.uploaderService.upload(miArchivo);
			
		}*/
	
  }
  fileChange(event){
		let fileList: FileList = event.target.files;
		if(fileList.length > 0) {
			this.archivo = fileList[0];
		}
	}

}
