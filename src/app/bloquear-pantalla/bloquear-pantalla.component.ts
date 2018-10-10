import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription }   from 'rxjs/Subscription';

import { AuthService } from 'app/auth.service';
import { BloquearPantallaService }     from './bloquear-pantalla.service';

@Component({
  selector: 'app-bloquear-pantalla',
  templateUrl: './bloquear-pantalla.component.html',
  styleUrls: ['./bloquear-pantalla.component.css']
})
export class BloquearPantallaComponent implements OnInit {

  usuario: any = {};

  saludIdDisponible: boolean;
  credenciales: any = {};
  loading: boolean = false;
  mensaje: string = "";
  mostrarMensaje: boolean = false;

  mostrar:Boolean;
  
  bloquearPantallaSuscription: Subscription;
  

  constructor(
    private router: Router,
    private authService:AuthService,
    private bloquearPantallaService: BloquearPantallaService
  ) {
    this.bloquearPantallaSuscription = bloquearPantallaService.pantallaBloqueada$.subscribe(bloquear => {
      // Borramos el token porque de todos modos se va a sustituir
      // y así impedimos que intenten borrar elementos en el navegador para acceder
      if(bloquear){
        localStorage.removeItem('token');
        this.cargarCredenciales();
        this.mostrar = true 
      }
      
    });
  }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() { 
    let bloquear = localStorage.getItem("bloquear_pantalla"); 
    if(bloquear != null){
      this.cargarCredenciales();
      this.mostrar = true 
    }   
  
  }
 
  
  cargarCredenciales(){
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
    if(this.usuario != null && this.usuario.id != null){
      this.credenciales.id = this.usuario.id;
    } 
  }

  login() {
    this.loading = true;
    this.mostrarMensaje = false;
    

    this.authService.login(this.credenciales.id, this.credenciales.password)
      .subscribe(
        data => {
          this.loading = false;
          this.mostrar = false;
          this.credenciales.password = "";
          this.bloquearPantallaService.desbloquearPantalla(); 
        },
        error => {
          this.loading = false;
          this.mostrarMensaje = true;
          this.mensaje = "No se puede interpretar el error. Por favor contacte con soporte técnico si esto vuelve a ocurrir.";
          try {
            let e = error.json(); 
            if (error.status == 401){
              this.mensaje = "Lo sentimos el usuario y/o contraseña no son válidos."
            }

            if (error.status == 0){
              this.mensaje = "Conexión rechazada."
            }

            if (error.status == 500 ){
              this.mensaje = "500 (Error interno del servidor)";
            } 
          } catch(e){
            if (error.status == 500 ){
              this.mensaje = "500 (Error interno del servidor)";
            } 
          }
          
        }
      );
  }

  logout() {
    this.mostrar = false 
    localStorage.removeItem('bloquear_pantalla');
    this.authService.logout();
  }

}
