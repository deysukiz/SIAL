import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router'

import { PermisosService } from '../permisos.service';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit {

  private id:number = null;
  
  enviando: boolean = false;
  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  errores = {
    descripcion: null,
    grupo: null,
    su : null,
  }
  
  permiso: any = { id:null, descripcion: '', grupo: '', su: false }


  constructor(    
    private title: Title, 
    private router: Router,
    private route: ActivatedRoute,
    private apiService: PermisosService) { }

  ngOnInit() {
    this.title.setTitle("Editar permiso / Panel de control");
    
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();


    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
  
    this.cargando = true;
      this.apiService.ver(this.id).subscribe( 
        respuesta => {
      this.permiso.grupo = respuesta.grupo;
      this.permiso.descripcion = respuesta.descripcion;
      this.permiso.id = respuesta.id;
      this.permiso.su = respuesta.su;
          this.cargando = false;
        }, error=>{
          console.log(error);
          this.cargando = false;
      });
    
  }
  
  guardar(){
    this.enviando = true;
    this.errores = {
      descripcion: null,
      grupo: null,
      su : null,
    }



    this.apiService.editar(this.id,this.permiso).subscribe(
      respuesta => {
        this.enviando = false;
      
      }, error => {
        try {
          let e = error.json();
          this.mensajeError = new Mensaje(true)
          switch(error.status){
            case 401: 
              this.mensajeError.texto =  "No tiene permiso para realizar esta acción.";
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
