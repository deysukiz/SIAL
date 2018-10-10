import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';

import { Mensaje } from '../../../mensaje';
import { NotificationsService } from 'angular2-notifications';

import { CrudService } from '../../../crud/crud.service';

/**
 * Componente que muestra el formulario para configurar firmas de documentos.
 */
@Component({
  selector: 'app-documentos-formulario',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {

  /**
   * Formulario reactivo que contiene los datos que se enviarán a la API,
   * y son los mismos datos que podemos ver al consultar los documentos.
   * @type {FormGroup} */
  dato: FormGroup;
  /**
   * Contiene los datos del modelo que se enviarán a la API.
   */
  modelo;
  /**
   * Calcula el tamaño de la pantalla
   */
  tamano = document.body.clientHeight;
  /**
   * Contiene un valor __true__ cuando estamos llenando el formulario.
   * @type {boolean} */
  llenando_formulario = true;

  /**
   * Objeto que contiene la configuracion default para mostrar los mensajes,
   * posicion abajo izquierda, tiempo 5 segundos.
   * @type {Object}
   */
  public options = {
    position: ['bottom', 'left'],
    timeOut: 5000,
    lastOnBottom: true
  };
  /**
   * Variable que muestra las notificaciones al usuario.
   * @type {Mensaje}
   */
  mensajeResponse: Mensaje = new Mensaje();


  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del módulo
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private notificacion: NotificationsService,
    private crudService: CrudService,
    private cdr: ChangeDetectorRef  ) { }

  ngOnInit() {

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    this.dato = this.fb.group({
      documentos: this.fb.array([
        this.fb.group({
          id: [null],
          nombre: [''],
          tipo_almacen: [''],
          documento_cargos: this.fb.array([
            this.fb.group({
              id: [null],
              leyenda: [''],
              cargo: this.fb.group({
                id: [null],
                clave: [''],
                nombre: ['']
              }),
              firmante: this.fb.group({
                nombre: ['']
              })
            })
          ])
        })
      ])
    });
    this.modelo = {
      documentos: [
        {
          id: null,
          nombre: '',
          tipo_almacen: '',
          documento_cargos: [
            {
              id: null,
              leyenda: '',
              cargo: {
                id: null,
                clave: '',
                nombre: ''
              },
              firmante: {
                id: null,
                nombre: [''],
                incremento: null,
                servidor_id: null,
                almacen_id: null,
                documento_sistema_cargo_id: null,
                usuario_id: null,
                created_at: null,
                updated_at: null,
                deleted_at: null
              }
            }
          ]
        }
      ]
    };
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    document.getElementById('actualizar').click();
  }

  /**
   * Método que crea el objeto firmante en caso que no exista en el JSON
   */
  crearFirmante() {
    return {
      id: null,
      nombre: '',
      incremento: null,
      servidor_id: null,
      almacen_id: null,
      documento_sistema_cargo_id: null,
      usuario_id: null,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };
  }

    /**
     * Este método carga los datos de un elemento de la api con el id que se pase por la url
     * en la api, abre una ventana modal para confirmar la acción
     * @return void
     */
    cargarDatos() {
      if (this.reset_form()) {
          try {
              this.llenando_formulario = true;

              this.crudService.verIniciar('documentos-firmantes').subscribe(
                  resultado => {
                    this.modelo = resultado;
                    for (let i_documento = 0; i_documento < this.modelo.documentos.length; i_documento++) {
                      if (this.modelo.documentos[i_documento].documento_cargos !== [] &&
                          this.modelo.documentos[i_documento].documento_cargos.length > 0) {
                        for (let i_cargos = 0; i_cargos < this.modelo.documentos[i_documento].documento_cargos.length; i_cargos++) {
                          if (this.modelo.documentos[i_documento].documento_cargos[i_cargos].firmante == null ||
                              this.modelo.documentos[i_documento].documento_cargos[i_cargos].firmante === '') {
                                this.modelo.documentos[i_documento].documento_cargos[i_cargos].firmante = this.crearFirmante();
                          } else {
                            this.modelo.documentos[i_documento].documento_cargos[i_cargos].firmante = this.modelo.documentos[i_documento].documento_cargos[i_cargos].firmante;
                          }
                        }
                      }
                    }
                    this.llenando_formulario = false;


                    this.mensajeResponse.titulo = 'Modificar';
                    this.mensajeResponse.texto = 'Los datos se cargaron';
                    this.mensajeResponse.clase = 'success';
                    this.mensaje(2);
                  },
                  error => {
                      this.llenando_formulario = false;

                      this.mensajeResponse = new Mensaje(true);
                      this.mensajeResponse = new Mensaje(true);
                      this.mensajeResponse.mostrar;

                      try {
                          let e = error.json();
                          if (error.status === 401) {
                              this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                              this.mensajeResponse.clase = 'success';
                              this.mensaje(2);
                          }

                      } catch (e) {

                          if (error.status === 500) {
                              this.mensajeResponse.texto = '500 (Error interno del servidor)';
                          } else {
                              this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte'
                              + ' con soporte técnico si esto vuelve a ocurrir.';
                          }
                          this.mensajeResponse.clase = 'error';
                          this.mensaje(2);
                      }

                  }
              );
          } catch (e) {
              console.log(0, e);
          }
        }
  }

  /**
   * Método para recargar el formulario.
   */
  reset_form() {
    this.modelo = {
      documentos: [
        {
          id: null,
          nombre: '',
          tipo_almacen: '',
          documento_cargos: [
            {
              id: null,
              leyenda: '',
              cargo: {
                id: null,
                clave: '',
                nombre: ''
              },
              firmante: {
                id: null,
                nombre: [''],
                incremento: null,
                servidor_id: null,
                almacen_id: null,
                documento_sistema_cargo_id: null,
                usuario_id: null,
                created_at: null,
                updated_at: null,
                deleted_at: null
              }
            }
          ]
        }
      ]
    };
    return true;
  }

  /**
   * Este método envia los datos para actualizar los nombres de las firmas en los documentos.
   * @return void
   */
  actualizarDatos() {
    let id = '';
    let editar = '/inventario/iniciar-inventario';
    this.llenando_formulario = true;

    this.crudService.crear(this.modelo, 'documentos-firmantes').subscribe(
          resultado => {
            this.reset_form();
            this.llenando_formulario = false;
            if (!this.llenando_formulario) {
              this.router.navigate(['/configuracion/documentos']);
              this.cargarDatos();
          }

            this.mensajeResponse.texto = 'Se han guardado los cambios.';
            this.mensajeResponse.mostrar = true;
            this.mensajeResponse.clase = 'success';
            this.mensaje(2);
        },
        error => {
            this.llenando_formulario = false;

            this.mensajeResponse.texto = 'No especificado.';
            this.mensajeResponse.mostrar = true;
            this.mensajeResponse.clase = 'alert';
            this.mensaje(2);
            try {
                let e = error.json();
                if (error.status == 401) {
                    this.mensajeResponse.texto = 'No tiene permiso para hacer esta operación.';
                    this.mensajeResponse.clase = 'error';
                    this.mensaje(2);
                }
                // Problema de validación
                if (error.status == 409) {
                    this.mensajeResponse.texto = 'Por favor verfique los campos marcados en rojo.';
                    this.mensajeResponse.clase = 'error';
                    this.mensaje(8);
                    for (let input in e.error) {
                        // Iteramos todos los errores
                        for (let i in e.error[input]) {
                            this.mensajeResponse.titulo = input;
                            this.mensajeResponse.texto = e.error[input][i];
                            this.mensajeResponse.clase = 'error';
                            this.mensaje(3);
                        }
                    }
                }
            } catch (e) {
                if (error.status === 500) {
                    this.mensajeResponse.texto = '500 (Error interno del servidor)';
                } else {
                    this.mensajeResponse.texto = 'No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.';
                }
                this.mensajeResponse.clase = 'error';
                this.mensaje(2);
            }

        }
    );
  }

  /**************************************NOTIFICATIONS******************************* */
  /**
     * Este método muestra los mensajes resultantes de los llamados de la api
     * @param cuentaAtras numero de segundo a esperar para que el mensaje desaparezca solo
     * @param posicion  array de posicion [vertical, horizontal]
     * @return void
     */
    mensaje(cuentaAtras: number = 6, posicion: any[] = ['bottom', 'left']): void {
      let objeto = {
          showProgressBar: true,
          pauseOnHover: false,
          clickToClose: true,
          maxLength: this.mensajeResponse.texto.length
      };
  
      this.options = {
          position: posicion,
          // timeOut: cuentaAtras * 1000,
          timeOut: 0,
          lastOnBottom: true
      };
      if (this.mensajeResponse.titulo === '') {
          this.mensajeResponse.titulo = 'Inicialización de inventario';
        }
      if (this.mensajeResponse.clase === 'alert') {
          this.notificacion.alert(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'success') {
          this.notificacion.success(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'info') {
          this.notificacion.info(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'warning' || this.mensajeResponse.clase === 'warn') {
          this.notificacion.warn(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
      if (this.mensajeResponse.clase === 'error' || this.mensajeResponse.clase === 'danger') {
          this.notificacion.error(this.mensajeResponse.titulo, this.mensajeResponse.texto, objeto);
        }
    }

}
