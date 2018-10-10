import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../../jwt-request.service';

//Puedo usar cuaquiera de estos elementos


@Injectable()
export class GraficasService {

  static readonly URL: string = "grafica-entregas";
  static readonly url: string = "grafica-entregas";
  static readonly URL_STATS: string = "movimiento-stats";

  constructor(
    private http: Http,   
    private jwtRequest:JwtRequestService
    ) { }


  lista(): Observable<any>{
    return this.jwtRequest.get(`${GraficasService.URL}`,null).map( (response: Response) => response.json());
  }

  //Para listar datos de manera general
  listaDatos(): Observable<any[]>{
    var proveedor_id = 3;
    var fecha_inicial = "2017-05-10";
    var fecha_final = "2017-06-30";
    return this.jwtRequest.get(`${GraficasService.url}?proveedor_id=${proveedor_id}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`).map( (response: Response) => response.json());
  }

}
