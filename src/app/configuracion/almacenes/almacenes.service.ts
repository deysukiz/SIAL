import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Almacen } from './almacen';

@Injectable()
export class AlmacenesService {

  static readonly URL: string = "almacenes";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(AlmacenesService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(AlmacenesService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  catalogo(): Observable<Almacen[]>{
    return this.jwtRequest.get(AlmacenesService.URL,null,{filtro_usuario:1}).map( (response: Response) => response.json().data) as Observable<Almacen[]>;
  }

  ver(id:any): Observable<Almacen>{
    return this.jwtRequest.get(AlmacenesService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var almacen = jsonData as Almacen;
        //usuario.roles = roles;
        return almacen;
      }) as Observable<Almacen>;
  }

  crear(almacen: Almacen[]): Observable<Almacen> {
    return this.jwtRequest.post(AlmacenesService.URL,almacen).map( (response: Response) => response.json().data) as Observable<Almacen>;
  }

  editar(id:any, almacen: Almacen): Observable<Almacen> {
    return this.jwtRequest.put(AlmacenesService.URL,id, almacen).map( (response: Response) => response.json().data) as Observable<Almacen>;
  }

  eliminar(id:any): Observable<Almacen> {
    return this.jwtRequest.delete(AlmacenesService.URL,id).map( (response: Response) => response.json().data) as Observable<Almacen>;
  }
}