import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Location}           from '@angular/common';
import { ActivatedRoute, Params , Router}   from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { Mensaje } from '../../../mensaje';

import { PacienteEgresoService } from '../paciente-egreso.service';

import { PacienteEgreso } from '../paciente-egreso';


@Component({
  selector: 'app-verificacion',
  templateUrl: './verificacion.component.html',
  styleUrls: ['./verificacion.component.css']
})
export class VerificacionComponent implements OnInit {

	cargando: boolean = false;
	showDialog:boolean =false;
	verForm:boolean =false;
	verFormResponsable:boolean =false;
	verFormArea:boolean =true;

	paciente: FormGroup;

	// # SECCION: Esta sección es para mostrar mensajes
    mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();
	ultimaPeticion:any;


	cargandoMunicipios: boolean = false;
	cargandoLocalidades: boolean = false;
	
	  //roles: Rol[] = [];
	Municipios: any[] = [];
	Localidades: any[] = [];
	// # FIN SECCION

	// # SECCION: Lista de pacinetes
	pacientes: PacienteEgreso[] = [];
	private paginaActual = 1;
	resultadosPorPagina = 25;
	total = 0;
	private paginasTotales = 0;
	private indicePaginas:number[] = []
	// # FIN SECCION
	
	// # SECCION: Resultados de búsqueda
	private ultimoTerminoBuscado = "";
	private terminosBusqueda = new Subject<string>();
	private resultadosBusqueda: PacienteEgreso[] = [];
	busquedaActivada:boolean = false;
	private paginaActualBusqueda = 1;
	resultadosPorPaginaBusqueda = 25;
	totalBusqueda = 0;
	private paginasTotalesBusqueda = 0;
	private indicePaginasBusqueda:number[] = [];
	  // # FIN SECCION


	constructor(
		private title: Title, 
    	private PacienteEgresoService: PacienteEgresoService,
    	private route: ActivatedRoute,
    	private router: Router,
    	private location: Location,
    	private fb: FormBuilder
	) { }

	ngOnInit() {

	this.paciente = this.fb.group({
       conocido: ['1', [Validators.required]],
       responsableconocido: ['1', [Validators.required]],
       nombre: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      hora_nacimiento: ['', []],
      domicilio: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      no_expediente: ['', [Validators.required]],
      no_afiliacion: ['', [Validators.required]],
      municipio_id: ['', [Validators.required]],
      localidad_id: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
       nombre_responsable: ['', [Validators.required]],
       parentesco: ['', [Validators.required]],
       domicilio_responsable: ['', [Validators.required]],
       telefono_responsable: ['', [Validators.required]],
       area: ['', [Validators.required]],
       trabajo_social: ['', []],
       juridico: ['', []],
       ministerio: ['', []],
    });

		

		this.title.setTitle("Verificación / Admisión");
	    this.listar(1);
	    this.mensajeError = new Mensaje();
	    this.mensajeExito = new Mensaje();

	    var self = this;

	    var busquedaSubject = this.terminosBusqueda
	    .debounceTime(300) // Esperamos 300 ms pausando eventos
	    .distinctUntilChanged() // Ignorar si la busqueda es la misma que la ultima
	    .switchMap((term:string)  =>  { 
	      console.log("Cargando búsqueda."+term);
	      this.busquedaActivada = term != "" ? true: false;

	      this.ultimoTerminoBuscado = term;
	      this.paginaActualBusqueda = 1;
	      this.cargando = true;
	      return term  ? this.PacienteEgresoService.buscarCompleta(term, this.paginaActualBusqueda, this.resultadosPorPaginaBusqueda) : Observable.of<any>({data:[]}) 
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
	        this.resultadosBusqueda = resultado.data as PacienteEgreso[];
	        this.totalBusqueda = resultado.total | 0;
	        this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

	        this.indicePaginasBusqueda = [];
	        for(let i=0; i< this.paginasTotalesBusqueda; i++){
	          this.indicePaginasBusqueda.push(i+1);
	        }
	        
	        console.log("Búsqueda cargada.");
	      }

	    );

	    this.cargarMunicipios(); 
	}


	cargarMunicipios(){
    this.cargandoMunicipios = true;
    this.PacienteEgresoService.listaMunicipios().subscribe(
      municipio => {
        this.Municipios = municipio;
        this.cargandoMunicipios = false;
        console.log("Municipios cargados")
      }, error => {
        this.cargandoMunicipios = false;
      }

    );
  }

  cargarLocalidades(value){
    this.cargandoLocalidades = true;
    this.PacienteEgresoService.listaLocalidades(value).subscribe(
      localidad => {
        this.Localidades = localidad;
        this.cargandoLocalidades = false;
        console.log("Localidades cargados")
      }, error => {
        this.cargandoLocalidades = false;
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
	    this.PacienteEgresoService.buscarCompleta(term, pagina, this.resultadosPorPaginaBusqueda).subscribe(
	        resultado => {
	          this.cargando = false;

	          this.resultadosBusqueda = resultado.data as PacienteEgreso[];

	          this.totalBusqueda = resultado.total | 0;
	          this.paginasTotalesBusqueda = Math.ceil(this.totalBusqueda / this.resultadosPorPaginaBusqueda);

	          this.indicePaginasBusqueda = [];
	          for(let i=0; i< this.paginasTotalesBusqueda; i++){
	            this.indicePaginasBusqueda.push(i+1);
	          }
	          
	          console.log("------");
	          console.log(resultado);
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
    
    this.cargando = true;
    this.PacienteEgresoService.listaCompleta(pagina,this.resultadosPorPagina).subscribe(
        resultado => {

          this.cargando = false;
          this.pacientes = resultado.data as PacienteEgreso[];

          this.total = resultado.total | 0;
          this.paginasTotales = Math.ceil(this.total / this.resultadosPorPagina);

          this.indicePaginas = [];
          for(let i=0; i< this.paginasTotales; i++){
            this.indicePaginas.push(i+1);
          }

          
          console.log("pacientes cargados.");
          console.log(this.pacientes);
          
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

    paciente_conocido()
    {
    	this.verForm = !this.verForm;
    	if(this.verForm)
    	{

	    	this.paciente.patchValue({
    									nombre: 1, 
    									fecha_nacimiento:"1987-01-01", 
    									domicilio:"conocido", 
    									colonia:"conocido", 
    									telefono:"conocido",
    									no_expediente:"conocido",
    									no_afiliacion:"conocido",
    									municipio_id:1,
    									localidad_id:1,
    									sexo:1
    		});	
    	}else
    	{
    		this.paciente.patchValue({
    									nombre: "", 
    									fecha_nacimiento:"", 
    									domicilio:"", 
    									colonia:"", 
    									telefono:"",
    									no_expediente:"",
    									no_afiliacion:"",
    									municipio_id:0,
    									localidad_id:0,
    									sexo:1
    		});
    	}

    	if(this.verFormResponsable && this.verForm)
    	{
    		this.verFormArea = false;
    		this.paciente.patchValue({area:""});
    	}
    	else
    	{
    		this.verFormArea = true;

    		this.paciente.patchValue({area:1});
    	}
    	
    } 

    responsable()
    {
    	this.verFormResponsable = !this.verFormResponsable;
    	if(this.verFormResponsable)
    	{
	    	this.paciente.patchValue({
    									nombre_responsable: 1, 
    									parentesco:"1987-01-01", 
    									domicilio_responsable:"conocido", 
    									telefono_responsable:"conocido",    									
    		});	
    	}else
    	{
    		this.paciente.patchValue({
    									nombre_responsable: "", 
    									parentesco:"", 
    									domicilio_responsable:"", 
    									telefono_responsable:"",  
    		});
    	}

    	if(this.verFormResponsable && this.verForm)
    	{
    		this.verFormArea = false;
    		this.paciente.patchValue({area:""});
    	}
    	else
    	{
    		this.verFormArea = true; 
    		this.paciente.patchValue({area:1});   	
    	}
    }

     verifica_area()
     {
     	let trabajo_social:boolean;
     	let juridico:boolean;
     	let ministerio:boolean;

     	trabajo_social 	= this.paciente.controls.trabajo_social.value;
     	juridico 		= this.paciente.controls.juridico.value;
     	ministerio 		= this.paciente.controls.ministerio.value;

     	if(trabajo_social || juridico || ministerio)
     	{
     		
     		 this.paciente.patchValue({area:1});
     	}
     	else
     	{
     		this.paciente.patchValue({area:""});
     		console.log("no entro area");
     	}

     	
     }

     enviar() 
     {
     	let bandera:number;
     	bandera = 0;
     	if(this.paciente.controls.conocido.value !=1 && this.paciente.controls.responsableconocido.value != 1)
     	{
     		let trabajo_social:boolean;
	     	let juridico:boolean;
	     	let ministerio:boolean;

	     	trabajo_social 	= this.paciente.controls.trabajo_social.value;
	     	juridico 		= this.paciente.controls.juridico.value;
	     	ministerio 		= this.paciente.controls.ministerio.value;

	     	if(trabajo_social || juridico || ministerio)
	     	{
	     		bandera = 1;
	     	}
	     	
     	}else
     	{
     		bandera = 1;
     	}

     	if(bandera == 1)
     	{
     		this.PacienteEgresoService.crear(this.paciente.value).subscribe(
		        paciente => {
		          this.cargando = false;

		          //this.location.go('/pacientes/modulo/alta/'+paciente.id);
		          this.router.navigate(['/pacientes/modulo/ingreso/'+paciente.id]);
		          /*console.log("Paciente editado.");

		          this.mensajeExito = new Mensaje(true);
		          this.mensajeExito.texto = "Se han guardado los cambios.";
		          this.mensajeExito.mostrar = true;*/
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

}
