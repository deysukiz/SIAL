import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';


import { JwtRequestService } from '../jwt-request.service';

@Injectable()
export class EditarPerfilService {
  
  static readonly URL: string = "editar-perfil";

  constructor(private http: Http,  private jwtRequest:JwtRequestService) { }

  editar(id:any, data: any): Observable<any> {
    return this.jwtRequest.put(EditarPerfilService.URL,id, data).map( (response: Response) => response.json().data) as Observable<any>;
  }

}
