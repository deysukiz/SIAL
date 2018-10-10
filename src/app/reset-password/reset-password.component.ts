import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';
import {  ResetPasswordService } from './reset-password.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  providers: [ ResetPasswordService ]
})
export class ResetPasswordComponent implements OnInit {

  @Input() resetPasswordViaToken: boolean;
  @Input() id: string;
  @Input() resetToken: string;
  
  @Output() onCerrar = new EventEmitter<void>();

  mostrarEnviarEmail:boolean = false;
  mostrarPreguntaSecreta:boolean = false;

  email:string = "";
  enviandoEmail:boolean = false;
  emailEnviado:boolean = false;

  verificandoToken:boolean = false;
  errorToken:boolean = false;

  passwordNuevo:string = "";
  passwordNuevoConfirmar: string = "";
  enviandoPasswordNuevo:boolean = false;
  passwordActualizado:boolean = false;

  usuario:string = "";
  obteniendoPreguntaSecreta:boolean = false;
  preguntaSecretaCargada:boolean = false;
  preguntaSecreta:string = "";
  enviandoRespuesta:boolean = false;
  respuesta:string = "";
  

  errores = {
    email: null,
    password_nuevo: null,
    usuario: null,
    pregunta: null,
    respuesta: null
  }

  mensajeError:string = '';

  constructor(private apiService:ResetPasswordService) { }

  ngOnInit() {
    if(this.resetPasswordViaToken){
      this.errorToken = false;
      this.verificandoToken =  true;
      console.log(this.resetToken);
      this.apiService.validarToken(this.id,this.resetToken).subscribe(
        respuesta => {
          this.verificandoToken =  false;
          console.log(respuesta)
        }, error => { 
          try{
            switch(error.status){
              case 401: 
                this.mensajeError =  "Token inválido.";
                break;
              default:
                this.mensajeError = "Ocurrió un error al validar el token";
            }
          } catch(e){
            this.mensajeError = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          }
          this.verificandoToken =  false;
          this.errorToken = true;

        }
      )
    }
  }
  cerrar(){
    this.onCerrar.emit();
  }
  enviarEmail(){
    this.resetErrores();
    this.enviandoEmail = true;
    this.apiService.enviarEmail(this.email)
    .subscribe(
      data => {
        console.log(data);
        this.enviandoEmail = false;
        this.emailEnviado = true;
      },
      error => {
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
        
        
        this.enviandoEmail = false;
        
      }
    );
  }

  enviarPasswordNuevo(){
    this.resetErrores();
    this.enviandoPasswordNuevo = true;
    this.apiService.enviarPasswordNuevo(this.id,this.resetToken, this.passwordNuevo)
    .subscribe(
      data => {
        console.log(data);
        this.enviandoPasswordNuevo = false;
        this.passwordActualizado = true;
      },
      error => {
        try {
          let e = error.json();
          
          switch(error.status){
            case 401: 
              this.mensajeError =  "No tiene permiso para realizar esta acción.";
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
        
        
        this.enviandoPasswordNuevo = false;
        
      }
    );
  }

  obtenerPreguntaSecreta(){
    this.resetErrores();
    this.obteniendoPreguntaSecreta = true;
    this.apiService.obtenerPreguntaSecreta(this.usuario)
    .subscribe(
      respuesta => {
        this.obteniendoPreguntaSecreta = false;
        this.preguntaSecretaCargada = true;
        this.preguntaSecreta = respuesta.data;
      },
      error => {
        try {
          let e = error.json();
          
          switch(error.status){
            case 401: 
              this.mensajeError =  "No tiene permiso para realizar esta acción.";
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
        
        
        this.obteniendoPreguntaSecreta = false;
        
      }
    );
  }

  enviarRespuesta(){
    this.resetErrores();
    this.enviandoRespuesta = true;
    this.apiService.enviarRespuesta(this.usuario, this.respuesta)
    .subscribe(
      respuesta => {
        console.log(respuesta);
        this.enviandoRespuesta = false;
        this.resetPasswordViaToken = true;
        this.resetToken = respuesta.data.reset_token;
        this.id = this.usuario;
        this.mostrarPreguntaSecreta = false;
      },
      error => {
        try {
          let e = error.json();
          
          switch(error.status){
            case 401: 
              this.mensajeError =  "No tiene permiso para realizar esta acción.";
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
        
        
        this.enviandoRespuesta = false;
        
      }
    );
  }
  resetErrores(){
    this.errores = {
      email: null,
      password_nuevo: null,
      usuario: null,
      pregunta: null,
      respuesta: null
    }
    this.mensajeError = '';
  }

}
