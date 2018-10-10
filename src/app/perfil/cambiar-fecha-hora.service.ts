import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';


import { JwtRequestService } from '../jwt-request.service';

@Injectable()
export class CambiarFechaHoraService {

  static readonly URL: string = "opciones-avanzadas";

  constructor(private http: Http,  private jwtRequest:JwtRequestService) { }

  ver(): Observable<any> {
    return this.jwtRequest.get(CambiarFechaHoraService.URL+"/fecha-hora-servidor",null, null).map( (response: Response) => response.json().data) as Observable<any>;
  }

  editar(data: any): Observable<any> {
    return this.jwtRequest.post(CambiarFechaHoraService.URL+"/fecha-hora-servidor/actualizar",data).map( (response: Response) => response.json().data) as Observable<any>;
  }

}
