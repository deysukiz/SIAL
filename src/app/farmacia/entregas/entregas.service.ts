import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Pedido } from '../pedidos/pedido';

@Injectable()
export class EntregasService {

  static readonly URL: string = "entregas";
  static readonly URL_STATS: string = "entregas-stats";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }
  
  stats(): Observable<any>{
    return this.jwtRequest.get(EntregasService.URL_STATS,null,null).map( (response: Response) => response.json());
  }

  buscar(status: string, term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(EntregasService.URL,null,{status: status, q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(status: string,pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(EntregasService.URL,null,{status: status, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(EntregasService.URL,id,{}).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  surtir(lotes: any): Observable<Pedido> {
    return this.jwtRequest.post(EntregasService.URL,lotes).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

}
