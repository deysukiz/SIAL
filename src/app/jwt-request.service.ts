import { Injectable } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelper } from 'angular2-jwt';

import { AuthService } from  './auth.service';
import { BloquearPantallaService }     from './bloquear-pantalla/bloquear-pantalla.service';

import { environment } from '../environments/environment';



@Injectable()

export class JwtRequestService {

  constructor(private http: Http, private authService: AuthService, private bloquearPantallaService:BloquearPantallaService, private router:Router, private jwtHelper: JwtHelper ) { }

  get(url:string, id:any = null, params: any = null ):Observable<any>{
    
    var data = this.request('get', url, id, params);
    if( id != null ){
      return data as Observable<any>;
    } else {
      return data as Observable<any[]>;
    }
    
  }

  post(url:string, params: any = null):Observable<any>{

    var data = this.request('post', url, null, params);
    return data as Observable<any>;
    
  }

  put(url:string,id:any = null, params: any = null):Observable<any>{

    var data = this.request('put', url, id, params);
    return data as Observable<any>;
    
  }

  delete(url:string,id:any = null, params: any = null):Observable<any>{

    var data = this.request('delete', url, id);
    return data as Observable<any>;
    
  }

  private request(method: string, url: string,  id:any = null, params: any = {} ):Observable<any>{

   

    if (localStorage.getItem('token') == null) {
      return null;
    }

    

    var serverInfo = JSON.parse(localStorage.getItem("server_info"));
    var token = this.jwtHelper.decodeToken(localStorage.getItem('token'));
    var usuario = JSON.parse(localStorage.getItem("usuario"));
    
    var headersJson = {};
    if (url.indexOf("http") > -1) {
      // headersJson['X-Clues']='application/x-www-form-urlencoded;charset=UTF-8';
      headersJson = {
        'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8', 'Authorization': 'Bearer ' + localStorage.getItem('token') 
     };
    } else {
      headersJson = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
     };
    }
    if (usuario.clues_activa ) {      
      headersJson['X-Clues'] = usuario.clues_activa.clues; 
    }
    if (usuario.almacen_activo ) {      
      headersJson['X-Almacen-Id'] = usuario.almacen_activo.id; 
    }
    if (usuario.proveedor_activo ) {      
      headersJson['X-Proveedor-Id'] = usuario.proveedor_activo.id; 
    }
    var headers = new Headers(headersJson);
   
 
    
    var data = new Observable(observer => {

    
      if (this.jwtHelper.isTokenExpired(localStorage.getItem('token'))){
         console.log("El token ha expirado. Comprobando caducidad para renovar.");
          
        
          var ttl:number = Number(serverInfo.token_refresh_ttl) ;          
          ttl = Number.isNaN(ttl)? 0 : ttl;

          var expiracionToken = this.jwtHelper.getTokenExpirationDate(localStorage.getItem('token'))
          var expiracionRefreshToken = new Date(expiracionToken.getTime() + ( ttl * 60000));
          var clienteDate = new Date();
         
          if ( expiracionRefreshToken.getTime() - clienteDate.getTime() <= 0 ) {
              console.log("El token ha caducado completamente y no será posible renovarlo.");
              console.log("Bloqueando aplicación.");      
              this.bloquearPantallaService.bloquearPantalla();//this.authService.logout(this.router.url);
          } else {
            // Refrescamos token
            this.authService.refreshToken().subscribe(
                  () => {
                    console.log("Enviando petición con token renovado.");

                    var headersJson = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') };
    
                    if (usuario.clues_activa ) {      
                      headersJson['X-Clues'] = usuario.clues_activa.clues; 
                    }
                    if (usuario.almacen_activo ) {      
                      headersJson['X-Almacen-Id'] = usuario.almacen_activo.id; 
                    }
                    if (usuario.proveedor_activo ) {      
                      headersJson['X-Proveedor-Id'] = usuario.proveedor_activo.id; 
                    }
    
                    headers = new Headers(headersJson);
                    
                    if (method == 'get'){
                      let urlSearchParams = new URLSearchParams()
                      if(params  != null){
                        for (var key in params) {
                          if (params.hasOwnProperty(key)){
                            urlSearchParams.set(key, params[key]);
                          }
                          
                        }
                      }
                      if (id == null){                 
                        this.http.get(`${environment.API_URL}/${url}`,{ headers: headers, search: urlSearchParams })
                        .subscribe( 
                          data => {
                            observer.next(data)
                          },
                          error => {observer.error(error)}
                        );
                      } else {          
                        this.http.get(`${environment.API_URL}/${url}/${id}`,{ headers: headers, search: urlSearchParams  })
                          .subscribe( 
                            data => {
                              observer.next(data)
                            },
                            error => {observer.error(error)}
                          );
                        }
                    }

                    if (method == 'post' ){
                      this.http.post(`${environment.API_URL}/${url}`,params,{ headers: headers })
                        .subscribe( 
                          data => {
                            observer.next(data)
                          },
                          error => {observer.error(error)}
                        );
                    }

                    if (method == 'put' && id != null){
                      this.http.put(`${environment.API_URL}/${url}/${id}`,params,{ headers: headers })
                        .subscribe( 
                          data => {
                            observer.next(data)
                          },
                          error => {observer.error(error)}
                        );
                    }

                    if (method == 'delete' && id != null){
                      this.http.delete(`${environment.API_URL}/${url}/${id}`,{ headers: headers })
                        .subscribe( 
                          data => {
                            observer.next(data)
                          },
                          error => {observer.error(error)}
                        );
                    }
                    
                }, error => {
                  console.log("Token caducado. Se intento renovar pero el servidor no lo permitió, debido a que se superó el tiempo límite.");
                  console.log("Bloqueando aplicación.");      
                  
                  this.bloquearPantallaService.bloquearPantalla();//this.authService.logout(this.router.url);
                }
              );
          }

      } else {
        if (method == 'get'){
          let urlSearchParams = new URLSearchParams()
          if(params  != null){
            for (var key in params) {
              if (params.hasOwnProperty(key)){
                urlSearchParams.set(key, params[key]);
              }
              
            }
          }
          if (id == null){                 
            this.http.get(`${environment.API_URL}/${url}`,{ headers: headers, search: urlSearchParams })
            .subscribe( 
              data => {
                observer.next(data)
              },
              error => {observer.error(error)}
            );
          } else {          
            this.http.get(`${environment.API_URL}/${url}/${id}`,{ headers: headers, search: urlSearchParams  })
              .subscribe( 
                data => {
                  observer.next(data)
                },
                error => {observer.error(error)}
              );
            }
        }
        

        if (method == 'post' ){
          this.http.post(`${environment.API_URL}/${url}`,params,{ headers: headers })
            .subscribe( 
              data => {
                observer.next(data)
              },
              error => {observer.error(error)}
            );
        }

        if (method == 'put' && id != null){
          this.http.put(`${environment.API_URL}/${url}/${id}`,params,{ headers: headers })
            .subscribe( 
              data => {
                observer.next(data)
              },
              error => {observer.error(error)}
            );
        }

        if (method == 'delete' && id != null){
          this.http.delete(`${environment.API_URL}/${url}/${id}`,{ headers: headers })
            .subscribe( 
              data => {
                observer.next(data)
              },
              error => {observer.error(error)}
            );
        } 
      }


  
    });
    return data ;
  }


}