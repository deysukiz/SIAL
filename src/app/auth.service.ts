import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../environments/environment';


@Injectable()
export class AuthService {
  headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http,  private router:Router) { }

  obtenerInfoServidor(){
    const url: string = 'informacion-servidor';
    return this.http.get(`${environment.API_URL}/${url}`,null).map( (response: Response) => response.json() );
  }

  login(id: string, password: string) {
    const url: string = 'obtener-token';
    if (url.indexOf("http") > -1) {
      console.log(url.indexOf("http"))
      // headersJson['X-Clues']='application/x-www-form-urlencoded;charset=UTF-8';
      this.headers['Content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    } else {
      this.headers['Content-type'] = 'application/json';
    }
    return this.http.post(`${environment.API_URL}/${url}`,JSON.stringify({id: id, password: password}),{ headers: this.headers }).map( (response: Response) => {
   
      let json = response.json();
      if (json.token) {
        console.log("Token obtenido.")

        // Obtenemos el perfil del usuario antes iniciar sesión, para saber que configuración tenía en caso de que sea el mismo usuario

        var usuarioAnterior = JSON.parse(localStorage.getItem("usuario"));
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('server_info');
        localStorage.removeItem('configuracion_general');

        // Tratamos de obtener la unidad medica seleccionada por default
        // y si habia bloqueado pantalla obtenemos la que tenia seleccionada

        json.usuario.clues_activa = null;
        json.usuario.almacen_activo = null;
        json.usuario.proveedor_activo = null; //Harima: Se agrego proveedor activo, para acceder a los modulos de proveedores

        if(json.usuario.proveedores){
          if(usuarioAnterior && usuarioAnterior.id == json.usuario.id ){
            var bandera = false;
            
            if(usuarioAnterior.proveedor_activo){
              for(var i in json.usuario.proveedores){
                if(usuarioAnterior.proveedor_activo.id == json.usuario.proveedores[i].id){
                  json.usuario.proveedor_activo = json.usuario.proveedores[i];
                  bandera = true;
                  break;
                }
              }
            }
            
            if(!bandera){
              json.usuario.proveedor_activo = json.usuario.proveedores[0];
            }
          } else {
            json.usuario.proveedor_activo = json.usuario.proveedores[0];
          }
        }

        if(json.usuario.unidades_medicas.length > 0 ){
           
          if(usuarioAnterior && usuarioAnterior.id == json.usuario.id ){
            var bandera = false;
            
            if(usuarioAnterior.clues_activa){
              for(var i in json.usuario.unidades_medicas){
              if(usuarioAnterior.clues_activa.clues == json.usuario.unidades_medicas[i].clues){
                  json.usuario.clues_activa = json.usuario.unidades_medicas[i];
                  bandera = true;
                }
              }
            }
            
            if(!bandera){
              json.usuario.clues_activa = json.usuario.unidades_medicas[0];
            }
          } else {
            json.usuario.clues_activa = json.usuario.unidades_medicas[0];
          }

          if(json.usuario.clues_activa.almacenes.length > 0 ){
            if(usuarioAnterior &&  usuarioAnterior.id == json.usuario.id ){
              var bandera = false;
              if(usuarioAnterior.almacen_activo){
                for(var i in json.usuario.clues_activa.almacenes){
                  if(usuarioAnterior.almacen_activo.id == json.usuario.clues_activa.almacenes[i].id){
                    json.usuario.almacen_activo = json.usuario.clues_activa.almacenes[i];
                    bandera = true;
                  }
                }
              }
              
              if(!bandera){
                json.usuario.almacen_activo = json.usuario.clues_activa.almacenes[0];
              }
            } else{
              json.usuario.almacen_activo = json.usuario.clues_activa.almacenes[0];
            }
            
          } else if(json.usuario.clues_activa.almacenes_externos.length > 0 ){
            if(usuarioAnterior &&  usuarioAnterior.id == json.usuario.id ){
              var bandera = false;
              if(usuarioAnterior.almacen_activo){
                for(var i in json.usuario.clues_activa.almacenes_externos){
                  if(usuarioAnterior.almacen_activo.id == json.usuario.clues_activa.almacenes_externos[i].id){
                    json.usuario.almacen_activo = json.usuario.clues_activa.almacenes_externos[i];
                    bandera = true;
                  }
                }
              }
              
              if(!bandera){
                json.usuario.almacen_activo = json.usuario.clues_activa.almacenes_externos[0];
              }
            } else{
              json.usuario.almacen_activo = json.usuario.clues_activa.almacenes_externos[0];
            }
          }else {
            json.usuario.almacen_activo = null;
          }
        } else {
          json.usuario.clues_activa = null;
          json.usuario.almacen_activo = null;
        }

        json.usuario.solo_lectura = false;
        if(json.server_info.data.id != json.usuario.servidor.id){
          console.log('Usuario de diferente servidor...');
          json.usuario.solo_lectura = true;
        }else if(json.server_info.data.principal && json.usuario.clues_activa && json.usuario.clues_activa.es_offline){
          console.log('Usuario mismo servidor, con clues offline...');
          json.usuario.solo_lectura = true;
        }
        
        localStorage.setItem('token', json.token)
        localStorage.setItem('usuario', JSON.stringify(json.usuario));
        localStorage.setItem('server_info', JSON.stringify(json.server_info));
        localStorage.setItem('configuracion_general', JSON.stringify(json.configuracion_general));
      }
    });
  }

  refreshToken() {
    const url: string = 'refresh-token?token=' + localStorage.getItem('token');
    return this.http.post(`${environment.API_URL}/${url}`,{},{ headers: this.headers }).map( (response: Response) => {
   
      let json = response.json();
      if (json.token) {
        console.log("Token renovado.")
        localStorage.removeItem('token');
        localStorage.removeItem('server_info');
        localStorage.setItem('token', json.token)
        localStorage.setItem('server_info', JSON.stringify(json.server_info));
      }
    });
  }

  logout(url:string = null) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('server_info');
    localStorage.removeItem('configuracion_general');

    if(url != null){
      this.router.navigate(['login'], { queryParams: { returnUrl: decodeURIComponent(url.replace(/\+/g,  " ")) } });
    } else {
      this.router.navigate(['login']);
    }
  }

}