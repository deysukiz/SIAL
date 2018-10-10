import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';

@Injectable()
export class ResetPasswordService {

  private headers = new Headers({'Content-Type': 'application/json'});
  
  constructor(private http: Http,  private router:Router) { }  

  enviarEmail(email:string){
    const url: string = 'reset-password/email';
    return this.http.post(`${environment.API_URL}/${url}`,JSON.stringify({email: email, reset_url:environment.API_URL}),{ headers: this.headers }).map( (response: Response) => response.json(), error => {});
    
  }

  validarToken(id:string, reset_token:string){
    const url: string = 'reset-password/validar-token';
    return this.http.post(`${environment.API_URL}/${url}`,JSON.stringify({id: id, reset_token:reset_token}),{ headers: this.headers }).map( (response: Response) => response.json(), error => {});
  }

  enviarPasswordNuevo(id:string, reset_token:string, passwordNuevo: string){
    const url: string = 'reset-password/password-nuevo';
    return this.http.put(`${environment.API_URL}/${url}/${id}`,JSON.stringify({ reset_token:reset_token, password_nuevo: passwordNuevo}),{ headers: this.headers }).map( (response: Response) => response.json(), error => {});
  }

  obtenerPreguntaSecreta(id:string){
    const url: string = 'reset-password/pregunta-secreta';    
    return this.http.get(`${environment.API_URL}/${url}/${id}`,{ headers: this.headers }).map( (response: Response) => response.json(), error => {});
  }

  enviarRespuesta(id:string,respuesta:string){
    const url: string = 'reset-password/validar-respuesta';
    return this.http.post(`${environment.API_URL}/${url}`,JSON.stringify({id:id, respuesta: respuesta}),{ headers: this.headers }).map( (response: Response) => response.json(), error => {});
  }

}
