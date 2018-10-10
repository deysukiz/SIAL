import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Clave } from './claves';

@Injectable()
export class ClavesService {

  static readonly URL: string = "claves";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(ClavesService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(ClavesService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  catalogo(): Observable<Clave[]>{
    return this.jwtRequest.get(ClavesService.URL,null,{filtro_usuario:1}).map( (response: Response) => response.json().data) as Observable<Clave[]>;
  }

  ver(id:any): Observable<Clave>{
    return this.jwtRequest.get(ClavesService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var servicio = jsonData as Clave;
        //usuario.roles = roles;
        return servicio;
      }) as Observable<Clave>;
  }

  crear(servicio: Clave[]): Observable<Clave> {
    return this.jwtRequest.post(ClavesService.URL,servicio).map( (response: Response) => response.json().data) as Observable<Clave>;
  }

  editar(id:any, servicio: Clave): Observable<Clave> {
    return this.jwtRequest.put(ClavesService.URL,id, servicio).map( (response: Response) => response.json().data) as Observable<Clave>;
  }

  eliminar(id:any): Observable<Clave> {
    return this.jwtRequest.delete(ClavesService.URL,id).map( (response: Response) => response.json().data) as Observable<Clave>;
  }
}