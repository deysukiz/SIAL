import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Router } from '@angular/router';
import { Location}           from '@angular/common';

import { ActivatedRoute, Params }   from '@angular/router';

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

import { Mensaje } from '../../../mensaje';

import { PacienteService } from '../paciente.service';

import { Paciente } from '../paciente';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
	cargando: boolean = false;
  busquedaActivada: boolean = false;

	mensajeError: Mensaje = new Mensaje();
	mensajeExito: Mensaje = new Mensaje();

	id:string;

	// # FIN SECCION

	// # SECCION: Lista de pacinetes
	pacientes: Paciente[] = [];
	paginaActual = 1;
	resultadosPorPagina = 25;
	total = 0;
	paginasTotales = 0;
	indicePaginas:number[] = []
	// # FIN SECCION

	  id_paciente:number;
	  nombre_paciente:string;
	  localidad_paciente:string;
	
	
  constructor(
  	private title: Title, 
    private pacienteService: PacienteService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
  ) { }

  ngOnInit() {
  	this.title.setTitle("Historial Paciente / Admisión");
    
    

    this.mensajeError = new Mensaje();
	this.mensajeExito = new Mensaje();
    
    var self = this;

    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      //this.cargarDatos();
    });

    this.listar(1);

  }

  listar(pagina:number): void {
    this.paginaActual = pagina;
    
    this.cargando = true;
    this.pacienteService.historial(this.id ,null).subscribe(
        resultado => {

          this.cargando = false;
          this.pacientes = resultado['ingreso'] as Paciente[];
          
         console.log(resultado['id']);
           
        this.id_paciente = resultado['id'];
	  		this.nombre_paciente = resultado['nombre'];
	  		this.localidad_paciente = resultado['localidad']['nombre']+" ( "+resultado['localidad']['municipio']['nombre']+" )";
        },
        error => {
          this.cargando = false;
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

    regresar()
    {
    	 this.location.back();
    }

}
