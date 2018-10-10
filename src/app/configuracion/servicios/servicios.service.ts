import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Servicio } from './servicio';

@Injectable()
export class ServiciosService {

  static readonly URL: string = "servicios";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(ServiciosService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(ServiciosService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  catalogo(): Observable<Servicio[]>{
    return this.jwtRequest.get(ServiciosService.URL,null,{filtro_usuario:1}).map( (response: Response) => response.json().data) as Observable<Servicio[]>;
  }

  ver(id:any): Observable<Servicio>{
    return this.jwtRequest.get(ServiciosService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var servicio = jsonData as Servicio;
        //usuario.roles = roles;
        return servicio;
      }) as Observable<Servicio>;
  }

  crear(servicio: Servicio[]): Observable<Servicio> {
    return this.jwtRequest.post(ServiciosService.URL,servicio).map( (response: Response) => response.json().data) as Observable<Servicio>;
  }

  editar(id:any, servicio: Servicio): Observable<Servicio> {
    return this.jwtRequest.put(ServiciosService.URL,id, servicio).map( (response: Response) => response.json().data) as Observable<Servicio>;
  }

  eliminar(id:any): Observable<Servicio> {
    return this.jwtRequest.delete(ServiciosService.URL,id).map( (response: Response) => response.json().data) as Observable<Servicio>;
  }
}