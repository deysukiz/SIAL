import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router'

import { PermisosService } from '../permisos.service';
import { Mensaje } from '../../../mensaje';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css']
})
export class NuevoComponent implements OnInit {

  
  
  enviando: boolean = false;
  cargando: boolean = false;

  // # SECCION: Esta sección es para mostrar mensajes
  mensajeError: Mensaje = new Mensaje();
  mensajeExito: Mensaje = new Mensaje();
  ultimaPeticion:any;
  // # FIN SECCION

  errores = {
    id: null,
    nombre: null,
    secret_key: null,
    tiene_internet : null,
    version : null,
    periodo_sincronizacion : null,
    ip:null,
    clues:null 
  }

  

  permiso: any = { id:'',nombre: '', secret_key: '', tiene_internet: false, version: '', ip:null, periodo_sincronizacion: null, clues:null , principal: false }



  constructor(    
    private title: Title, 
    private router: Router,
    private route: ActivatedRoute,
    private apiService: PermisosService) { }

  ngOnInit() {
    this.title.setTitle("Nuevo permiso / Panel de control");
    
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();

    
  }
  
  guardar(){
    this.enviando = true;
    this.errores = {
		id: null,
		nombre: null,
		secret_key: null,
		tiene_internet : null,
		version : null,
		periodo_sincronizacion : null,
    ip:null,
    clues:null 
    }



    this.apiService.crear(this.permiso).subscribe(
      respuesta => {
        this.enviando = false;
        this.router.navigate(['/panel-control/permisos']);
      
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
