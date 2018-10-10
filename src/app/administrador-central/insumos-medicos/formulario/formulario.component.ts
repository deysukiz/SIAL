import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';



import { InsumosMedicosService } from '../insumos-medicos.service';
import { CambiarEntornoService } from '../../../perfil/cambiar-entorno.service';



import { Mensaje } from '../../../mensaje';


@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
  providers: [InsumosMedicosService]
})
export class FormularioComponent implements OnInit {

  cargando: boolean = false;
  cargandoPresentaciones: boolean = false;
  cargandoUnidadesMedida: boolean = false;
  cargandoViasAdministracion: boolean = false;
  guardando: boolean = false;
  esEditar: boolean = false;
  id: any;
  insumo_medico: any = {
   /* clave:null,
    tipo: null,
    es_causes: false,
    es_unidosis: false,
    tiene_fecha_caducidad: false,
    descontinuado: false,
    descripcion: null,*/
    medicamento: {
     /* presentacion_id: null,
      es_controlado: false,
      es_surfactante: false,
      concentracion: null,
      contenido: null,
      cantidad_x_envase: null,
      unidad_medica_id: null,
      indicaciones: null,
      via_administracion_id: null,
      dosis: null*/
    },
    material_curacion: {}
  };
  errores = {}

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion: any;
  // # FIN SECCION

  // # SECCION: Catalogos

  presentaciones: any[] = [];
  unidades_medida: any[] = [];
  vias_administracion: any[] = [];



  // # SECCION: Cambios de Entorno
  cambiarEntornoSuscription: Subscription;
  // # FIN SECCION

  constructor(
    private title: Title,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: InsumosMedicosService,
    private cambiarEntornoService: CambiarEntornoService

  ) { }

  ngOnInit() {


    this.route.params.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];
        this.esEditar = true;
        this.title.setTitle('Editar insumo médico');
        this.cargar();
      } else {
        this.title.setTitle('Nuevo insumo médico');
      }
    });

    this.cargarPresentaciones();
    this.cargarUnidadesMedida();
    this.cargarViasAdministracion();
  }


  cargar(){
    this.cargando = true;
    this.apiService.ver(this.id).subscribe(
      respuesta=>{
        this.insumo_medico = respuesta;
        if(this.insumo_medico.medicamento == null){
          this.insumo_medico.medicamento = {}
        }
        if(this.insumo_medico.material_curacion == null){
          this.insumo_medico.material_curacion = {}
        }
        this.cargando = false;
      }, error =>{
        console.log(error);
        this.cargando = false;
      }
    )
  }

  guardar() {
    this.guardando = true;

    var payload = this.insumo_medico;


    this.errores = {}

    if (this.esEditar) {

      this.apiService.editar(this.id, payload).subscribe(
        respuesta => {
          console.log(respuesta);
          this.id = respuesta.clave;
          if(this.insumo_medico.medicamento != null && this.insumo_medico.medicamento != {}){
            this.insumo_medico.medicamento.insumo_medico_clave = this.id;
          }

          if(this.insumo_medico.material_curacion != null && this.insumo_medico.material_curacion != {} ){
            this.insumo_medico.material_curacion.insumo_medico_clave = this.id;
          }
          this.guardando = false;
        },
        error => {
          this.guardando = false;
          try {
            let e = error.json();
            this.mensajeError = new Mensaje(true)
            switch (error.status) {
              case 401:
                this.mensajeError.texto = "No tiee permiso para realizar esta acción.";
                break;
              case 409:
                this.mensajeError.texto = "Verifique la información marcada de color rojo";
                for (var input in e.error) {
                  // Iteramos todos los errores
                  for (var i in e.error[input]) {
                    var object = input.split(".");
                  
                    if(object.length > 1){
       
                      if(this.errores[object[0]] == null){
                        this.errores[object[0]] = {};
                      }
                      

                      this.errores[object[0]][object[1]] = e.error[input][i];

                    } else {
                      this.errores[input] = e.error[input][i];
                    }
                  }
                }
                break;
              case 500:
                this.mensajeError.texto = "500 (Error interno del servidor)";
                break;
              default:
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
          } catch (e) {
            this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
          this.mensajeError.mostrar = true;
        });
    } else {
      this.apiService.crear(payload).subscribe(
        respuesta => {
          this.guardando = false;
          this.router.navigate(['/administrador-central/insumos-medicos/editar/' + respuesta.clave]);
        },
        error => {
          this.guardando = false;
          try {
            let e = error.json();
            this.mensajeError = new Mensaje(true)
            switch (error.status) {
              case 401:
                this.mensajeError.texto = "No tiee permiso para realizar esta acción.";
                break;
              case 409:
                this.mensajeError.texto = "Verifique la información marcada de color rojo";
                for (var input in e.error) {
                  // Iteramos todos los errores
                  for (var i in e.error[input]) {
                  
                    var object = input.split(".");
                  
                    if(object.length > 1){
       
                      if(this.errores[object[0]] == null){
                        this.errores[object[0]] = {};
                      }
                      

                      this.errores[object[0]][object[1]] = e.error[input][i];

                    } else {
                      this.errores[input] = e.error[input][i];
                    }
                    
                  }
                }

                console.log(this.errores);
                break;
              case 500:
                this.mensajeError.texto = "500 (Error interno del servidor)";
                break;
              default:
                this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
          } catch (e) {
            this.mensajeError.texto = "Hubo un error, al interpretar el ¿error?. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
          this.mensajeError.mostrar = true;

        });
    }
  }

  seleccionarTipo(value) {
    this.insumo_medico.tipo = value;
  }
  seleccionarPresentacion(value) {
    this.insumo_medico.medicamento.presentacion_id = value;
  }
  seleccionarUnidadMedida(value) {
    if(this.insumo_medico.tipo == "ME"){
      this.insumo_medico.medicamento.unidad_medida_id = value;
    }

    if(this.insumo_medico.tipo == "MC"){
      this.insumo_medico.material_curacion.unidad_medida_id = value;
    }
    
  }
  seleccionarViaAdministracion(value) {
    this.insumo_medico.medicamento.via_administracion_id = value;
  }

  cargarPresentaciones() {
    this.cargandoPresentaciones = true;

    this.apiService.presentaciones().subscribe(
      respuesta => {
        this.presentaciones = respuesta;
        this.cargandoPresentaciones = false;
      }, error => {
        this.presentaciones = [];
        this.cargandoPresentaciones = false;
      }
    )
  }

  cargarUnidadesMedida() {
    this.cargandoUnidadesMedida = true;

    this.apiService.unidadesMedida().subscribe(
      respuesta => {
        this.unidades_medida = respuesta;
        this.cargandoUnidadesMedida = false;
      }, error => {
        this.presentaciones = [];
        this.cargandoUnidadesMedida = false;
      }
    )
  }

  cargarViasAdministracion() {
    this.cargandoViasAdministracion = true;

    this.apiService.viasAdministracion().subscribe(
      respuesta => {
        this.vias_administracion = respuesta;
        this.cargandoViasAdministracion = false;
      }, error => {
        this.presentaciones = [];
        this.cargandoViasAdministracion = false;
      }
    )
  }

}
