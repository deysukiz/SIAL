import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { FormBuilder, FormGroup, Validators, FormControl, NgModel  } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { AvanceService } from '../avance.service';
import { Tema } from '../tema';

import { Mensaje } from '../../mensaje';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

	cargando: boolean = false;
	cargando_info: boolean = false;
	filter: boolean = false;
	showAgregarTema: boolean = false;
	showInfo: boolean = false;
	tema_avance: FormGroup;

	informacion_tema: any = {};
	busqueda: any = {prioridad: '', estatus:'', visto:'', area:'', orden :1};


	// # SECCION: Esta sección es para mostrar mensajes
    mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();
	ultimaPeticion:any;
	id_tema:string = "0";
	areas:any[] = [];
	// # FIN SECCION

	// # SECCION: Lista de pacinetes
	paginaActual = 1;
	resultadosPorPagina = 25;
	total = 0;
	paginasTotales = 0;
	indicePaginas:number[] = [];
	

	temas: Tema[] = [];
	// # FIN SECCION
	
	// # SECCION: Resultados de búsqueda
	ultimoTerminoBuscado = "";
	terminosBusqueda = new Subject<string>();
	resultadosBusqueda: Tema[] = [];
	busquedaActivada:boolean = false;
	paginaActualBusqueda = 1;
	resultadosPorPaginaBusqueda = 25;
	totalBusqueda = 0;
	paginasTotalesBusqueda = 0;
	indicePaginasBusqueda:number[] = [];

  constructor(
  		private title: Title, 
    	private avanceService: AvanceService,
    	private fb: FormBuilder
  	) { }
	/**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {

  		this.tema_avance = this.fb.group({
       		tema: ['', [Validators.required]],
       		responsable: ['', [Validators.required]],
       		area: ['', [Validators.required]],
       		comentario: ['', [Validators.required]],
       
    	});
  		this.title.setTitle("Avances / Lista");
  		this.listar(1);
  		this.carga_area();
	    this.mensajeError = new Mensaje();
	    this.mensajeExito = new Mensaje();

	    var self = this;

	    var busquedaSubject = this.terminosBusqueda
	    .debounceTime(300) // Esperamos 300 ms pausando eventos
	    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
	    .switchMap((term:string)  =>  { 
	      //console.log("Cargando búsqueda."+term);
	      this.busquedaActivada = term != "" ? true: false;
	      console.log(this);
	      this.ultimoTerminoBuscado = term;
	      this.paginaActualBusqueda = 1;
	      this.cargando = true;

	      this.cargando = true;
     	  
     	  if(this.busqueda.prioridad != '' || this.busqueda.estatus != '' || this.busqueda.visto != '' || this.busqueda.area != '')

     		this.busquedaActivada = true;

	      return this.busquedaActivada  ? this.avanceService.buscar(term, this.busqueda, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda) : Observable.of<any>({data:[]}) 
	    }
	      
	    
	    ).catch( function handleError(error){ 
	     
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
	        this.resultadosBusqueda = resultado.data as Tema[];
	        this.totalBusqueda = resultado.total | 0;
	        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

	        this.indicePaginasBusqueda = [];
	        for(let i=0; i< this.paginasTotalesBusqueda; i++){
	          this.indicePaginasBusqueda.push(i+1);
	        }
	        
	        console.log("Búsqueda cargada.");
	      }

	    );
    }

    carga_area():void
    {
    	this.avanceService.carga_area().subscribe(
	        resultado => {
	          	this.areas = resultado.datos;    
	          	this.filter = !resultado.general;
	        },
	        error => {
	          this.mensajeError.mostrar = true;
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

    buscar(term: string): void {
	    this.terminosBusqueda.next(term);
	}

	  listarBusqueda(term:string ,pagina:number): void {
	    this.paginaActualBusqueda = pagina;
	    console.log("Cargando búsqueda.");
	   
	    this.cargando = true;
	    this.avanceService.buscar(term, this.busqueda, pagina, this.resultadosPorPaginaBusqueda).subscribe(
	        resultado => {
	          console.log(resultado);
	          this.cargando = false;

	          this.resultadosBusqueda = resultado.data as Tema[];

	          this.totalBusqueda = resultado.total | 0;
	          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

	          this.indicePaginasBusqueda = [];
	          for(let i=0; i< this.paginasTotalesBusqueda; i++){
	            this.indicePaginasBusqueda.push(i+1);
	          }
	          
	          
	          
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
    
    this.cargando = true;
    this.avanceService.lista(pagina,this.resultadosPorPagina).subscribe(
        resultado => {

          this.cargando = false;
          this.temas = resultado.data as Tema[];

          this.total = resultado.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }
          
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

    agregar_tema() 
     {
     	if(this.id_tema == "0")
     	{
	     	this.avanceService.crear(this.tema_avance.value).subscribe(
		        tema => {
		          this.cargando = false;

		          
		          this.mensajeExito = new Mensaje(true);
		          this.mensajeExito.texto = "Se han guardado los cambios.";
		          this.mensajeExito.mostrar = true;
		        
		          this.showAgregarTema = !this.showAgregarTema;
		          this.listar(1);
		          this.tema_avance.patchValue({tema:"", responsable:"",area:"", comentario:""});
		        },
		        error => {
		          this.cargando = false;
		          
		          this.mensajeError = new Mensaje(true);
		          this.mensajeError.texto = "No especificado.";
		          this.mensajeError.mostrar = true;      
		          
		          try {
		            let e = error.json();
		            if (error.status == 401 ){
		              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
		            }
		            // Problema de validación
		            if (error.status == 409){
		              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
		              
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
	     }else
	     {
	     	this.avanceService.editar(this.id_tema, this.tema_avance.value).subscribe(
		        tema => {
		          this.cargando = false;

		          
		          this.mensajeExito = new Mensaje(true);
		          this.mensajeExito.texto = "Se han editado los cambios.";
		          this.mensajeExito.mostrar = true;
		     	  this.id_tema = "0";	
		          this.showAgregarTema = !this.showAgregarTema;
		          this.listar(1);
		          this.tema_avance.patchValue({tema:"", responsable:"",area:"", comentario:""});
		        },
		        error => {
		          this.cargando = false;
		          
		          this.mensajeError = new Mensaje(true);
		          this.mensajeError.texto = "No especificado.";
		          this.mensajeError.mostrar = true;      
		          
		          try {
		            let e = error.json();
		            if (error.status == 401 ){
		              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
		            }
		            // Problema de validación
		            if (error.status == 409){
		              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
		              
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
	     }

     	
     }

     ver_tema(id:string)
     {
     	this.avanceService.ver_tema(id).subscribe(
	        tema => {
	          this.cargando = false;
	          this.showAgregarTema = !this.showAgregarTema;
	          this.tema_avance.patchValue(tema);
	          console.log(tema.id);
	          this.id_tema = tema.id.toString();
	        },
	        error => {
	          this.cargando = false;
	          
	          this.mensajeError = new Mensaje(true);
	          this.mensajeError.texto = "No especificado.";
	          this.mensajeError.mostrar = true;      
	          
	          try {
	            let e = error.json();
	            if (error.status == 401 ){
	              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
	            }
	            // Problema de validación
	            if (error.status == 409){
	              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
	              
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
     	
     
     }

     eliminar_tema(id:string)
     {
     	if(prompt("Si realmente desea eliminar este tema ingrese ELIMINAR TEMA") == 'ELIMINAR TEMA')
     	{
	     	this.avanceService.eliminar_tema(id).subscribe(
		        tema => {
		          this.cargando = false;
		          this.listar(1);
		          this.mensajeExito = new Mensaje(true);
		          this.mensajeExito.texto = "Se ha eliminado correctamente el tema";
		          this.mensajeExito.mostrar = true;      
		          
		        },
		        error => {
		          this.cargando = false;
		          
		          this.mensajeError = new Mensaje(true);
		          this.mensajeError.texto = "No especificado.";
		          this.mensajeError.mostrar = true;      
		          
		          try {
		            let e = error.json();
		            if (error.status == 401 ){
		              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
		            }
		            // Problema de validación
		            if (error.status == 409){
		              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
		              
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
	     }
     }

     informacion(id:any, percent:any):void
     {
     	this.informacion_tema = {};
     	this.showInfo = !this.showInfo;
     	this.cargando_info = true;
     	this.avanceService.ver_informacion(id).subscribe(
	        info => {
	           this.informacion_tema = info;
	           this.informacion_tema.percent = percent;
	           this.cargando_info = false;
	          
	        },
	        error => {
	          this.cargando_info = false;
	          
	          this.mensajeError = new Mensaje(true);
	          this.mensajeError.texto = "No especificado.";
	          this.mensajeError.mostrar = true;      
	          
	          try {
	            let e = error.json();
	            if (error.status == 401 ){
	              this.mensajeError.texto = "No tiene permiso para hacer esta operación.";
	            }
	            // Problema de validación
	            if (error.status == 409){
	              this.mensajeError.texto = "Por favor verfique los campos marcados en rojo.";
	              
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
     	
     }

     filtro(id:number, value:string):void
     {
     	switch (id) {
     		case 1:
     			this.busqueda.prioridad = value;
     		break;
     		case 2:
     			this.busqueda.estatus = value;
     		break;
     		case 3:
     			this.busqueda.visto = value;
     		break;
     		case 4:
     			this.busqueda.area = value;
     		case 5:
     			this.busqueda.orden = value;

     		break;
     	}

     	console.log(this.busqueda);


     	this.cargando = true;
     	//
     	
     	  
     	if(this.busqueda.prioridad.length == 0 && this.busqueda.estatus.length == 0 && this.busqueda.area.length == 0 && this.busqueda.visto.length == 0 && this.ultimoTerminoBuscado == '' && this.busqueda.orden == "1")
     	{
     		this.busquedaActivada = false;
     		this.cargando = false;
     	}
     	else
     	{
     		this.busquedaActivada = true;

	     	this.avanceService.buscar(this.ultimoTerminoBuscado, this.busqueda, 1, this.resultadosPorPaginaBusqueda).subscribe(
		        resultado => {
		          console.log(resultado);
		          this.cargando = false;

		          this.resultadosBusqueda = resultado.data as Tema[];

		          this.totalBusqueda = resultado.total | 0;
		          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

		          this.indicePaginasBusqueda = [];
		          for(let i=0; i< this.paginasTotalesBusqueda; i++){
		            this.indicePaginasBusqueda.push(i+1);
		          }
		          
		          
		          
		        },
		        error => {
		          this.cargando = false;
		          this.mensajeError.mostrar = true;
		          this.ultimaPeticion = function(){this.listarBusqueda(this.ultimoTerminoBuscado,1);};
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

     	
     }
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

	modal_agregar():void
	{
		this.showAgregarTema = true;
	}
 

}
