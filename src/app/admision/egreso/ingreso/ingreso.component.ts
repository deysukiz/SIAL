import { Component, OnInit } from '@angular/core';
import { Location}           from '@angular/common';
import { ActivatedRoute, Params }   from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth.service';

import { Mensaje } from '../../../mensaje';

import { PacienteEgresoService } from '../paciente-egreso.service';

import { PacienteEgreso } from '../paciente-egreso';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit {

  pacienteIngreso: FormGroup;

   id:string;
  cargando: boolean = false;
  
  cargandoUnidadesMedicas: boolean = false;
  cargandotriage: boolean = false;
  cargandoGradoLesion: boolean = false;
  permiso_guardar: boolean = true;
  datosCargados: boolean;

   id_paciente:string;
   nombre_paciente:string;
   localidad_paciente:string;

   verForm:boolean = false;
  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje()
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();

  nombre_conocido:boolean;

  UnidadesMedicas: any[] = [];
  Triage: any[] = [];
  GradoLesion: any[] = [];


  constructor(
  	private router: Router,
    private title: Title, 
    private authService:AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private pacienteEgresoService: PacienteEgresoService,
    private fb: FormBuilder	
  ) { }

  ngOnInit() {
  	this.title.setTitle("Ingreso Paciente / Admisión");

  	this.pacienteIngreso = this.fb.group({
      referido: ['2', [Validators.required]],
      unidad_referido: ['', [Validators.required]],
      urgencia_calificada: ['1', [Validators.required]],
      registro_triage: ['1', [Validators.required]],
      estado_triage_id: ['1', [Validators.required]],
      grado_lesion_id: ['1', [Validators.required]],
      fecha_ingreso: ['', [Validators.required]],
      hora_ingreso: ['', [Validators.required]],
    });	

    
    this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
    });

    this.cargarDatos();


  }

  bloquea_formulario()
  {
      this.verForm = !this.verForm;
      if(this.verForm)
      {
        this.pacienteIngreso.patchValue({registro_triage:2, estado_triage_id:1,grado_lesion_id:0});
      }else
      {
        this.pacienteIngreso.patchValue({registro_triage:2, estado_triage_id:1,grado_lesion_id:1});
      }
  }

  valida_referido(valor)
  {
    if(valor==1)
    {
      this.nombre_conocido = true;
      this.pacienteIngreso.patchValue({unidad_referido:""});
    }
    else
    {
      this.pacienteIngreso.patchValue({unidad_referido:"CSSS"});
      this.nombre_conocido = false;
    }
  }

  CargarUnidadesMedicas(lista_completa, id){
    this.cargandoUnidadesMedicas = true;
    console.log(lista_completa+" - "+id);
    this.pacienteEgresoService.listaUnidades(lista_completa, id).subscribe(
      UnidadesMedicas => {
        this.UnidadesMedicas = UnidadesMedicas;
        this.cargandoUnidadesMedicas = false;
        
      }, error => {
        this.cargandoUnidadesMedicas = false;
      }
    ); 
  }

  CargarGradoLesion(id){
    this.cargandoGradoLesion = true;
    this.pacienteEgresoService.listaGradoLesion(id).subscribe(
      GradoLesion => {
        
        this.pacienteIngreso.patchValue({grado_lesion_id: GradoLesion[0].id});
        this.GradoLesion = GradoLesion;
        this.cargandoGradoLesion = false;
        
      }, error => {
        this.cargandoGradoLesion = false;
      }
    ); 
  }

  CargarLugarTriage(id){
    this.cargandotriage = true;
    this.pacienteEgresoService.listaTriage(id).subscribe(
      Triage => {
        this.Triage = Triage;
        this.pacienteIngreso.patchValue({estado_triage_id: Triage[0].id});
        
        this.cargandotriage = false;
        
      }, error => {
        this.cargandotriage = false;
      }
    ); 
  }

  cargarDatos() {
    this.cargando = true;  
    this.pacienteEgresoService.ver(this.id).subscribe(
        pacienteIngreso => {
          this.cargando = false;
          this.datosCargados = true;
          
          let unidad:string;
          let triage:number;
          let lesion:number;

          let identificador:string;
          let nombre_paciente:string;
          let localidad_paciente:string;

          let date:any;
          let hora:string;
          let minutos:string;
          

          if(pacienteIngreso['ingresoactivos'].length > 0)
          {
             pacienteIngreso['referido'] = pacienteIngreso['ingresoactivos'][0].referido;
             pacienteIngreso['urgencia_calificada'] = pacienteIngreso['ingresoactivos'][0].urgencia_calificada;
             pacienteIngreso['registro_triage'] = pacienteIngreso['ingresoactivos'][0].registro_triage;
             pacienteIngreso['fecha_ingreso'] = pacienteIngreso['ingresoactivos'][0].fecha_hora_ingreso.substr(0, 10);
             pacienteIngreso['hora_ingreso'] = pacienteIngreso['ingresoactivos'][0].fecha_hora_ingreso.substr(10, 6);
             
             if(pacienteIngreso['ingresoactivos'][0].referido == 1)
             {
               pacienteIngreso['unidad_referido'] = pacienteIngreso['ingresoactivos'][0].unidad_referido;
               this.nombre_conocido = true;
             }
             else
               pacienteIngreso['unidad_referido'] = "css";

             unidad = pacienteIngreso['ingresoactivos'][0].clues;
             triage = pacienteIngreso['ingresoactivos'][0].estado_triage_id;
             lesion = pacienteIngreso['ingresoactivos'][0].grado_lesion_id;

             this.pacienteIngreso.patchValue(pacienteIngreso);

             identificador = pacienteIngreso['id'];
             nombre_paciente = pacienteIngreso['nombre'];
             if(pacienteIngreso['localidad'])
                 localidad_paciente = pacienteIngreso['localidad']['nombre']+" ("+pacienteIngreso['localidad']['municipio']['nombre']+")";
               else
                 localidad_paciente = "DESCONOCIDO";
             this.permiso_guardar = false;
                     
          }else
          {
              date = new Date();
              hora = date.getHours();
              minutos = date.getMinutes();
              identificador = pacienteIngreso['id'];
              nombre_paciente = pacienteIngreso['nombre'];
              if(pacienteIngreso['localidad'])
                 localidad_paciente = pacienteIngreso['localidad']['nombre']+" ("+pacienteIngreso['localidad']['municipio']['nombre']+")";
               else
                 localidad_paciente = "DESCONOCIDO";
             
              this.pacienteIngreso.patchValue({fecha_ingreso : date.toJSON().slice(0,10), hora_ingreso: hora+":"+minutos});
              this.pacienteIngreso.patchValue({unidad_referido:"CSSS"});
          }

            this.CargarUnidadesMedicas(1, unidad);
            this.CargarLugarTriage(triage);
            this.CargarGradoLesion(lesion);

            this.id_paciente = identificador;
            this.nombre_paciente = nombre_paciente;
            this.localidad_paciente = localidad_paciente;
          
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

  enviar() {
    
    this.cargando = true;    
    this.pacienteEgresoService.ingreso(this.id,this.pacienteIngreso.value).subscribe(
        paciente => {
          this.cargando = false;
          console.log("Paciente editado.");

          this.mensajeExito = new Mensaje(true);
          this.mensajeExito.texto = "Se han guardado los cambios.";
          this.mensajeExito.mostrar = true;

          this.location.back();
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

   regresar(){
    this.location.back();
  }

}
