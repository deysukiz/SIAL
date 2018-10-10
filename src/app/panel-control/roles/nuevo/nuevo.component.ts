import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router'

import { RolesService } from '../roles.service';
import { PermisosService } from '../../permisos/permisos.service';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css']
})
export class NuevoComponent implements OnInit {
  /**
   * Calcula el tamaño de la pantalla
   */
  tamano = document.body.clientHeight;

  enviando: boolean = false;
  cargando: boolean = false;
  cargandoPermisos: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  errores = {
    nombre: null,
    permisos: null,
  }


  permisos:any[] = [];
  todosSeleccionados: boolean = false;

  rol: any = { nombre: '', es_offline: false, permisos: [] }



  constructor(    
    private title: Title, 
    private router: Router,
    private route: ActivatedRoute,
    private apiService: RolesService,
    private permisosService: PermisosService) { }

  ngOnInit() {
    this.title.setTitle("Nuevo rol / Panel de control");
    
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();

    this.cargandoPermisos = true;
    this.permisosService.lista().subscribe( 
      permisos => {
        this.permisos = permisos;
        this.cargandoPermisos = false;
      }, error=>{
        console.log(error);
        this.cargandoPermisos = false;
      })
  }
  seleccionarTodos(){
    this.todosSeleccionados = !this.todosSeleccionados;
    for(var i in this.permisos){
      this.permisos[i].seleccionado = this.todosSeleccionados;
    }
  }
  
  guardar(){
    this.enviando = true;
    this.errores = {
      nombre: null,
      permisos: null,
    }


    this.rol.permisos = [];

    for(var i in this.permisos){
      if(this.permisos[i].seleccionado){
        this.rol.permisos.push(this.permisos[i].id);
      }
    }

    this.apiService.crear(this.rol).subscribe(
      respuesta => {
        this.enviando = false;
        this.router.navigate(['/panel-control/roles']);
      
      }, error => {
        try {
          let e = error.json();
          this.mensajeError = new Mensaje(true)
          switch(error.status){
            case 401: 
              this.mensajeError.texto =  "No tiee permiso para realizar esta acción.";
              break;
            case 409:
              this.mensajeError.texto = "Verifique la información marcada de color rojo";
              for (var input in e.error){
                // Iteramos todos los errores
                for (var i in e.error[input]){
                  this.errores[input] = e.error[input][i];
                }                      
              }
              break;
            case 500:
              this.mensajeError.texto = "500 (Error interno del servidor)";
              break;
            default: 
              this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
        } catch (e){
          this.mensajeError.texto = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
        }
        this.mensajeError.mostrar = true;
        this.enviando = false;
      }
    )
  }

}
