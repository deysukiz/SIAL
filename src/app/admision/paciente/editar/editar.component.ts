import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params }   from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth.service';

import { Mensaje } from '../../../mensaje';

import { PacienteService } from '../paciente.service';
import { Paciente }       from '../paciente';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit {
  
  paciente: FormGroup;

  id:string;
  cargando: boolean = false;
  
  cargandoMunicipios: boolean = false;
  cargandoLocalidades: boolean = false;
  verFormResponsable:boolean =false;
  datosCargados: boolean;
  
  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje()
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();

  Municipios: any[] = [];
  Localidades: any[] = [];

  constructor(
  	private router: Router,
    private title: Title, 
    private authService:AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private pacienteService: PacienteService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

 	this.title.setTitle("Editar Paciente / Admisión");
    this.paciente = this.fb.group({
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
       responsableconocido: ['1', [Validators.required]],
      nombre_responsable: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      domicilio_responsable: ['', [Validators.required]],
      telefono_responsable: ['', [Validators.required]],
      
    });

    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
      //this.cargarDatos();
    });

   	console.log(this.id);
    
    this.cargarDatos(); 
  }

  cargarMunicipios(){
    this.cargandoMunicipios = true;
    this.pacienteService.listaMunicipios().subscribe(
      municipio => {
        this.Municipios = municipio;
        this.cargandoMunicipios = false;
        console.log("Municipios cargados");

      }, error => {
        this.cargandoMunicipios = false;
      }

    );
  }

  cargarLocalidades(value){
    this.cargandoLocalidades = true;
    this.pacienteService.listaLocalidades(value).subscribe(
      localidad => {
        this.Localidades = localidad;
        this.cargandoLocalidades = false;
        console.log("Localidades cargados");
        
      }, error => {
        this.cargandoLocalidades = false;
      }

    );
    
  }

    cargarDatos() {
    this.cargando = true;  
    console.log("Cargando usuario.");
    this.pacienteService.ver(this.id).subscribe(
        paciente => {
          this.cargando = false;
          this.datosCargados = true;

          if(paciente['responsable'])
          {
            this.paciente.patchValue({nombre_responsable:paciente['responsable'].nombre, 
                                      parentesco:paciente['responsable'].parentesco, 
                                      domicilio_responsable:paciente['responsable'].domicilio, 
                                      telefono_responsable:paciente['responsable'].telefono});
          }else
          {
            this.verFormResponsable =true;
            this.paciente.patchValue({responsableconocido:2,
                                      nombre_responsable: 1, 
                                      parentesco:"desconocido", 
                                      domicilio_responsable:"conocido", 
                                      telefono_responsable:"conocido"
                                    });
          }
          
          this.paciente.patchValue(paciente);
          
          this.cargarMunicipios();
          this.cargarLocalidades(paciente['municipio_id']);
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
  }
  
  regresar(){
    this.location.back();
  }

  responsable()
  {
    this.verFormResponsable = !this.verFormResponsable;
    if(this.verFormResponsable)
    {
      this.paciente.patchValue({
                    nombre_responsable: 1, 
                    parentesco:"desconocido", 
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
  }

  enviar() {
    
    this.cargando = true;    
    this.pacienteService.editar(this.id,this.paciente.value).subscribe(
        paciente => {
          this.cargando = false;
          console.log("Paciente editado.");

          this.mensajeExito = new Mensaje(true);
          this.mensajeExito.texto = "Se han guardado los cambios.";
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
