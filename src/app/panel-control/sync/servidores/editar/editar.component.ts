import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router'

import { SyncService } from '../../sync.service';
import { Mensaje } from '../../../../mensaje';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit {

  id:number = null;
  
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

  listaClues:any[] = [];

  servidor: any = { id:'',nombre: '', secret_key: '', tiene_internet: false, version: '', periodo_sincronizacion: null, ip:null, clues:null, principal: false }



  constructor(    
    private title: Title, 
    private router: Router,
    private route: ActivatedRoute,
    private apiService: SyncService) { }

  ngOnInit() {
    this.title.setTitle("Editar servidor / Panel de control");
    
    this.mensajeError = new Mensaje();
    this.mensajeExito = new Mensaje();
    this.cargarUnidadesMedicas();
	
	this.route.params.subscribe(params => {
		this.id = params['id'];
	});

	this.cargando = true;
    this.apiService.verServidor(this.id).subscribe( 
      respuesta => {
		this.servidor.tiene_internet = respuesta.tiene_internet;
		this.servidor.principal = respuesta.principal;
		this.servidor.secret_key = respuesta.secret_key;
		this.servidor.periodo_sincronizacion = respuesta.periodo_sincronizacion;
    this.servidor.nombre = respuesta.nombre;
    this.servidor.ip = respuesta.ip;
    this.servidor.clues = respuesta.clues;
		this.servidor.id = respuesta.id;
        this.cargando = false;
      }, error=>{
        console.log(error);
        this.cargando = false;
    });
    
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



    this.apiService.editarServidor(this.id, this.servidor).subscribe(
      respuesta => {
        this.enviando = false;
        this.router.navigate(['/panel-control/sync/servidores/editar/'+respuesta.id]);
      
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

  cargarUnidadesMedicas(){
    
    this.apiService.unidadesMedicas().subscribe(
      respuesta => {
        this.listaClues = respuesta;
      }, error => {
        console.log(error)
      }
    );
  }

  generarSecretKey(){
    this.servidor.secret_key = Math.random().toString().slice(2,12);
  }

}
