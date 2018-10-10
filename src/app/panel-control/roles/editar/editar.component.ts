import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router'

import { RolesService } from '../roles.service';
import { PermisosService } from '../../permisos/permisos.service';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit {
  /**
   * Calcula el tamaño de la pantalla
   */
  tamano = document.body.clientHeight;

  id:number = null;

  cargando: boolean = false;
  enviando: boolean = false;
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

  private rol: any = { nombre: '', es_offline: false, permisos: [] }



  constructor(    
    private title: Title, 
    private router: Router,
    private route: ActivatedRoute,
    private apiService: RolesService,
    private permisosService: PermisosService) { }

  ngOnInit() {
    this.title.setTitle("Editar / Panel de control");

    this.route.params.subscribe(params => {
      this.id = +params['id'];
    });
    
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();

    

    this.cargando = true;
    this.apiService.ver(this.id).subscribe( 
      respuesta => {
        this.rol.nombre = respuesta.nombre
        this.rol.es_offline = respuesta.es_offline
        this.cargarPermisos(respuesta.permisos);
        this.cargando = false;
      }, error=>{
        console.log(error);
        this.cargando = false;
    });


  }

  cargarPermisos (permisosActivos: any[] = []){
    this.cargandoPermisos = true;
    this.permisosService.lista().subscribe( 
      permisos => {
        this.permisos = permisos;
        
        for(var i in this.permisos){
            
          siguientePermiso:          
          for(var j in permisosActivos){           
            if(permisosActivos[j].id == this.permisos[i].id){              
              this.permisos[i].seleccionado = true;
              break siguientePermiso;
            }
          }
        }

        this.cargandoPermisos = false;
      }, error=>{
        console.log(error);
        this.cargandoPermisos = false;
    });
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

    this.apiService.editar(this.id,this.rol).subscribe(
      respuesta => {
        this.enviando = false;
        this.mensajeExito = new Mensaje(true) 
        this.mensajeExito.texto =  "Se han guardado los cambios.";
        this.mensajeExito.mostrar = true;
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
