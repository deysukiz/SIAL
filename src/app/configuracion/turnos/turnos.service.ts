import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Turno } from './turnos';

@Injectable()
export class TurnosService {

  static readonly URL: string = "turnos";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(TurnosService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(TurnosService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  catalogo(): Observable<Turno[]>{
    return this.jwtRequest.get(TurnosService.URL,null,{filtro_usuario:1}).map( (response: Response) => response.json().data) as Observable<Turno[]>;
  }

  ver(id:any): Observable<Turno>{
    return this.jwtRequest.get(TurnosService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var turno = jsonData as Turno;
        //usuario.roles = roles;
        return turno;
      }) as Observable<Turno>;
  }

  crear(turno: Turno[]): Observable<Turno> {
    return this.jwtRequest.post(TurnosService.URL,turno).map( (response: Response) => response.json().data) as Observable<Turno>;
  }

  editar(id:any, turno: Turno): Observable<Turno> {
    return this.jwtRequest.put(TurnosService.URL,id, turno).map( (response: Response) => response.json().data) as Observable<Turno>;
  }

  eliminar(id:any): Observable<Turno> {
    return this.jwtRequest.delete(TurnosService.URL,id).map( (response: Response) => response.json().data) as Observable<Turno>;
  }
}