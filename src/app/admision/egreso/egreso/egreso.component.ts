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
  selector: 'app-egreso',
  templateUrl: './egreso.component.html',
  styleUrls: ['./egreso.component.css']
})
export class EgresoComponent implements OnInit {

  pacienteEgreso: FormGroup;

  id:string;
  cargando: boolean = false;
  
  cargandoMunicipios: boolean = false;
  cargandoLocalidades: boolean = false;
  cargandoMotivoEgreso: boolean = false;
  cargandoUnidadesMedicas: boolean = false;
  datosCargados: boolean;

  id_paciente:string;
  nombre_paciente:string;
  localidad_paciente:string;
  fecha_ingreso:string;
  area_ingreso:string;



  localidad_disabled: boolean;
  
  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje()
  mensajeAdvertencia: Mensaje = new Mensaje()
  mensajeExito: Mensaje = new Mensaje();

  Municipios: any[] = [];
  Localidades: any[] = [];
  MotivoEgreso: any[] = [];
  UnidadesMedicas: any[] = [];

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
  	this.title.setTitle("Alta Paciente / Admisión");
  	this.pacienteEgreso = this.fb.group({
      fecha_egreso: ['', [Validators.required]],
      hora_egreso: ['', [Validators.required]],
      contrareferencia	: ['2', [Validators.required]],
      unidad_referencia: ['CSSS', [Validators.required]],
      motivo_egreso_id	: ['1', [Validators.required]],
      
    });	

  	this.route.params.subscribe(params => {
      this.id = params['id']; // Se puede agregar un simbolo + antes de la variable params para volverlo number
    });

    this.cargarDatos();
  }

  cargarMunicipios(municipio){
    this.cargandoMunicipios = true;
    this.pacienteEgresoService.listaMunicipios(municipio).subscribe(
      municipio => {
        this.Municipios = municipio;
        this.cargandoMunicipios = false;
        console.log("Municipios cargados");

      }, error => {
        this.cargandoMunicipios = false;
      }

    );
  }

  cargarLocalidades(municipio, localidad){
    this.cargandoLocalidades = true;
    this.pacienteEgresoService.listaLocalidades(municipio, localidad).subscribe(
      localidad => {
        this.Localidades = localidad;
        this.cargandoLocalidades = false;
        console.log("Localidades cargados");
        
      }, error => {
        this.cargandoLocalidades = false;
      }

    );
    
  }

  cargarMotivoEgreso(){
    this.cargandoLocalidades = true;
    this.pacienteEgresoService.listaMotivoEgreso().subscribe(
      MotivoEgreso => {
        this.MotivoEgreso = MotivoEgreso;
        this.cargandoMotivoEgreso = false;
        console.log(MotivoEgreso);
        
      }, error => {
        this.cargandoMotivoEgreso = false;
      }

    );
    
  }

  CargarUnidadesMedicas(lista_completa, id=null){
    this.cargandoLocalidades = true;
    this.pacienteEgresoService.listaUnidades(lista_completa, id).subscribe(
      UnidadesMedicas => {
        this.UnidadesMedicas = UnidadesMedicas;
        this.cargandoUnidadesMedicas = false;
        
      }, error => {
        this.cargandoMotivoEgreso = false;
      }

    );
    
  }

    cargarDatos() {
    this.cargando = true;  
    console.log("Cargando usuario.");
    this.pacienteEgresoService.ver(this.id).subscribe(
        pacienteEgreso => {
          this.cargando = false;
          this.datosCargados = true;
          
          this.pacienteEgreso.patchValue(pacienteEgreso);
          
          let date:any;
          let hora:string;
          let minutos:string;
          

          this.id_paciente = pacienteEgreso.id;
          this.nombre_paciente = pacienteEgreso.nombre;
          if(pacienteEgreso.localidad)          
            this.localidad_paciente = pacienteEgreso.localidad['nombre']+" ( "+pacienteEgreso.localidad['municipio']['nombre']+" )";
          else
            this.localidad_paciente = "DESCONOCIDO";
          this.fecha_ingreso = pacienteEgreso['ingresoactivos'][0]['fecha_hora_ingreso'];
          this.area_ingreso = pacienteEgreso['ingresoactivos'][0]['estado_triage']['descripcion'];

          date = new Date();
          hora = date.getHours();
          minutos = date.getMinutes();
          
          this.pacienteEgreso.patchValue({fecha_egreso : date.toJSON().slice(0,10), hora_egreso: hora+":"+minutos});
          

          this.cargarMotivoEgreso();
          this.CargarUnidadesMedicas(1);
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

  referido(valor)
  {
    if(valor == 1)
      this.pacienteEgreso.patchValue({unidad_referencia:""});
    else
      this.pacienteEgreso.patchValue({unidad_referencia:"CSSS"});
  }

  enviar() {
    
    this.cargando = true;    
    this.pacienteEgresoService.editar(this.id,this.pacienteEgreso.value).subscribe(
        paciente => {
          this.cargando = false;
          
          this.mensajeExito = new Mensaje(true);
          this.mensajeExito.texto = "Se han guardado los cambios.";
          this.mensajeExito.mostrar = true;

          this.router.navigate(['/pacientes/modulo/egreso']);
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
