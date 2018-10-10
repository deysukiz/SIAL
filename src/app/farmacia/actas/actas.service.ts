import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Pedido } from '../pedidos/pedido';

@Injectable()
export class ActasService {

  static readonly URL: string = "pedidos";
  static readonly URL_STATS: string = "pedidos-stats";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  stats(): Observable<any>{
    return this.jwtRequest.get(ActasService.URL_STATS,null,null).map( (response: Response) => response.json());
  }

  buscar(status:string, term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(ActasService.URL,null,{status: status, q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(status:string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(ActasService.URL,null,{status:status, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(ActasService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var pedido = jsonData as any;
        //usuario.roles = roles;
        return pedido;
      }) as Observable<Pedido>;
  }

  crear(pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.post(ActasService.URL,pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  editar(id:any, pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.put(ActasService.URL,id, pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  eliminar(id:any): Observable<Pedido> {
    return this.jwtRequest.delete(ActasService.URL,id).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  

}
