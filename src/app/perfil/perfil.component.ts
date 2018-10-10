import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { AuthService } from 'app/auth.service';
import { BloquearPantallaService }     from '../bloquear-pantalla/bloquear-pantalla.service';
import { CambiarEntornoService }     from '../perfil/cambiar-entorno.service';
import { EditarPerfilService }     from '../perfil/editar-perfil.service';
import { CambiarFechaHoraService  } from '../perfil/cambiar-fecha-hora.service';

import { VERSION } from 'app/config';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  mostrar: boolean = false;
  usuario: any = {};
  server_info:any = {};
  cliente_version:string = '';
  mostrarCambiarEntorno:boolean = false;
  
  edicionPerfil:boolean = false;

  avatars = [
    { value:"avatar-circled-user-male", title:"Hombre"},
    { value:"avatar-circled-user-female", title:"Mujer"},
    { value:"avatar-circled-user-male-skin-type-6", title:"Hombre piel morena"},
    { value:"avatar-circled-user-female-skin-type-6", title:"Mujer piel morena"},
    { value:"avatar-circled-collaborator-male", title:"Colaborador hombre"},
    { value:"avatar-nurse", title:"Enfermera"},
    { value:"avatar-circled-doctor-male", title:"Doctor"},
    { value:"avatar-circled-doctor-female", title:"Doctora"},
    { value:"avatar-cat", title:"Gato"}
  ]
  errores = {
    nombre: null,
    apellidos: null,
    passwordAnterior:null,
    passwordNuevo:null
  }

  erroresFechaHora = {
    fecha: null,
    hora: null
  }
  nuevoPerfil: any = {
    id:"",
    avatar:"",
    nombre:"",
    apellidos:"",
    cambiarPassword:false,
    passwordAnterior:"",
    passwordNuevo:"",
    passwordNuevoConfirmacion:""
  }
  
  keyPermisoCambiarFechaHora:string = "2EA8UKzKrNFzxQxBBSjQ2fHggyrScu9f"; //Akira: cambiar por una llave creada por ustedes
  permisos:any = null;
  fechaServidor:Date = new Date();
  horaServidor:string = null;

  constructor(
    private router: Router,
    private authService:AuthService,
    private bloquearPantallaService: BloquearPantallaService,
    private cambiarEntornoService: CambiarEntornoService,
    private editarPerfilService: EditarPerfilService,
    private cambiarFechaHoraService: CambiarFechaHoraService
  ) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
    this.server_info = JSON.parse(localStorage.getItem("server_info"));
    this.cliente_version = VERSION;
    this.nuevoPerfil.id = this.usuario.id;
    this.nuevoPerfil.avatar = this.usuario.avatar;
    this.nuevoPerfil.nombre = this.usuario.nombre;
    this.nuevoPerfil.apellidos = this.usuario.apellidos;
    if(this.usuario.su == 1){
      this.avatars.push({value: 'avatar-circled-root', title: "Super administrador"})
    }
    this.permisos = this.usuario.permisos;
    
    
  }

  toggle() {
    if(this.enviandoDatosPerfil){
      return;
    }
    this.edicionPerfil = false;
    this.nuevoPerfil.id = this.usuario.id;
    this.nuevoPerfil.avatar = this.usuario.avatar;
    this.nuevoPerfil.nombre = this.usuario.nombre;
    this.nuevoPerfil.apellidos = this.usuario.apellidos;

    this.mostrar = !this.mostrar;
    if(this.mostrar){
      this.usuario = JSON.parse(localStorage.getItem("usuario"));
      this.cargarFechaHora();
    }

   
  }
  logout() {
    this.authService.logout();
     this.router.navigate(['/login']);
  }
  bloquear(){
   
    this.bloquearPantallaService.bloquearPantalla();
    this.mostrar = false;
  }

  seleccionarClues(value){
    this.mostrarCambiarEntorno = true;
    for(var i in this.usuario.unidades_medicas){
      
      if(value == this.usuario.unidades_medicas[i].clues){        
        this.usuario.clues_activa = this.usuario.unidades_medicas[i];
        if(this.usuario.clues_activa.almacenes.length >0){
          this.usuario.almacen_activo = this.usuario.clues_activa.almacenes[0];
        } else if(this.usuario.clues_activa.almacenes_externos.length >0){
          this.usuario.almacen_activo = this.usuario.clues_activa.almacenes_externos[0];
        }else {

          this.usuario.almacen_activo = null;
        }        
      }
    }
    
  }

  seleccionarAlmacen(value){
    this.mostrarCambiarEntorno = true;
    var bandera = false;
    for(var i in this.usuario.clues_activa.almacenes){
      if(value == this.usuario.clues_activa.almacenes[i].id){
        bandera = true;
        this.usuario.almacen_activo = this.usuario.clues_activa.almacenes[i];
      }
    }
    if(!bandera){
      for(var i in this.usuario.clues_activa.almacenes_externos){
        if(value == this.usuario.clues_activa.almacenes_externos[i].id){
          this.usuario.almacen_activo = this.usuario.clues_activa.almacenes_externos[i];
        }
      }
    }
  }

  seleccionarProveedor(value){
    this.mostrarCambiarEntorno = true;
    for(var i in this.usuario.proveedores){
      if(value == this.usuario.proveedores[i].id){
        this.usuario.proveedor_activo = this.usuario.proveedores[i];
        break;
      }
    }
  }

  cambiarEntorno(){
    this.usuario.solo_lectura = false;

    if(this.server_info.data.id != this.usuario.servidor.id){
      console.log('Usuario de diferente servidor...');
      this.usuario.solo_lectura = true;
    }else if(this.server_info.data.principal && this.usuario.clues_activa.es_offline){
      console.log('Usuario mismo servidor, con clues offline...');
      this.usuario.solo_lectura = true;
    }
    
    localStorage.setItem('usuario', JSON.stringify(this.usuario));
    this.mostrarCambiarEntorno = false;
    this.cambiarEntornoService.cambiarEntorno();
  }
  
  enviandoDatosFechaHora:boolean = false;
  mostrarMensajeExitosoFechaHora:boolean = false;
  mensajeErrorFechaHora:string = '';
  editarFechaHora(){
    var frase = prompt("La fecha y hora del servidor son muy importantes para la sincronización de datos. Realice este procedimiento solo en caso de que el servidor tenga la hora incorrecta. Para confirmar la operación escriba: ACTUALIZAR");
    if(frase == "ACTUALIZAR"){
      
      this.enviandoDatosFechaHora = true;
      this.mostrarMensajeExitosoFechaHora = false;
      this.mensajeErrorFechaHora = '';

      var data = {
        fecha : this.fechaServidor.getFullYear() + "-" + this.pad(this.fechaServidor.getMonth(),2) + "-" + this.pad(this.fechaServidor.getDate(),2),
        hora: this.horaServidor +":00"
      };
      
      this.cambiarFechaHoraService.editar(data).subscribe(
        respuesta => {
          this.enviandoDatosFechaHora = false;
          this.mostrarMensajeExitosoFechaHora = true;
          console.log(respuesta);
        }, error => {
          try {
            let e = error.json();
         
            switch(error.status){
              case 401: 
                this.mensajeErrorFechaHora =  "No tiee permiso para realizar esta acción.";
                break;
              case 409:
                this.mensajeErrorFechaHora = "Verifique la información marcada de color rojo";
                for (var input in e.error){
                  // Iteramos todos los errores
                  for (var i in e.error[input]){
                    this.erroresFechaHora[input] = e.error[input][i];
                  }                      
                }
                break;
              case 500:
                this.mensajeErrorFechaHora = "500 (Error interno del servidor)";
                break;
              default: 
                this.mensajeErrorFechaHora = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
            }
          } catch (e){
            this.mensajeErrorFechaHora = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
        
          
          this.enviandoDatosFechaHora = false;
        }
      )

    } else {
      alert("Frase de confirmación incorrecta.")
    }
  }
  pad(num, size) {
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
  }
  cargandoFechaHora:boolean = false;
  cargarFechaHora(){
    this.cargandoFechaHora = true;

    this.cambiarFechaHoraService.ver().subscribe(      
      respuesta => {
        this.cargandoFechaHora = false;
        console.log(respuesta);
        var datetime = respuesta.split(" ");
        var date = datetime[0].split("-");
        var time = datetime[1].split(":");

        this.fechaServidor = new Date(date[0],+date[1]-1,date[2]);
        this.horaServidor = time[0]+":"+time[1];
      }, error => {
        this.cargandoFechaHora = false;
        console.log(error);
      }
    )
  }

  enviandoDatosPerfil:boolean = false;
  mostrarMensajeExitoso:boolean = false;
  mensajeError:string = '';
  editarPerfil(){
    this.enviandoDatosPerfil = true;
    
    var payload = this.nuevoPerfil;
    if(!payload.cambiarPassword){
      payload.cambiarPassword = null;
    }

    this.errores = {
      nombre: null,
      apellidos: null,
      passwordAnterior:null,
      passwordNuevo:null
    }
    this.mensajeError = '';
    this.editarPerfilService.editar(this.usuario.id, payload).subscribe(
      respuesta => {
        
        this.usuario.nombre = respuesta.nombre;
        this.usuario.apellidos = respuesta.apellidos;
        this.usuario.avatar = respuesta.avatar;

        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.edicionPerfil = true;
        this.enviandoDatosPerfil = false;
        this.nuevoPerfil.cambiarPassword = false;
        this.nuevoPerfil.passwordAnterior = '';
        this.nuevoPerfil.passwordNuevo = '';
        this.nuevoPerfil.passwordNuevoConfirmacion = '';
        this.mostrarMensajeExitoso = true;

      }, error => {
        try {
          let e = error.json();
       
          switch(error.status){
            case 401: 
              this.mensajeError =  "No tiee permiso para realizar esta acción.";
              break;
            case 409:
              this.mensajeError = "Verifique la información marcada de color rojo";
              for (var input in e.error){
                // Iteramos todos los errores
                for (var i in e.error[input]){
                  this.errores[input] = e.error[input][i];
                }                      
              }
              break;
            case 500:
              this.mensajeError = "500 (Error interno del servidor)";
              break;
            default: 
              this.mensajeError = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
        } catch (e){
          this.mensajeError = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
        }
        
        this.enviandoDatosPerfil = false;
      }
    )
    
  }
}
