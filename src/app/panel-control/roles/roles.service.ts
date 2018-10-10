import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';


import { JwtRequestService } from '../../jwt-request.service';

//import { API_URL } from '../../config';

import { Rol } from './rol';


@Injectable()
export class RolesService {

  static readonly URL: string = "roles";
  
  constructor(private http: Http,  private jwtRequest:JwtRequestService) { }

  lista(): Observable<Rol[]>{
    return this.jwtRequest.get(RolesService.URL).map( (response: Response) => response.json().data) as Observable<Rol[]>;
  }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RolesService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  listaPaginada(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RolesService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(RolesService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var permisos:string[] = []
        jsonData.permisos.map(item => {
          roles.push(""+item.id)
        })

       

        var usuario = jsonData as Rol;
        usuario.roles = roles;
        usuario.unidades_medicas_objs = usuario.unidades_medicas;
        usuario.unidades_medicas = unidades_medicas;
        
        usuario.almacenes = almacenes;*/
        return jsonData;
      }) as Observable<any>;
  }

  crear(rol: any): Observable<any> {
    return this.jwtRequest.post(RolesService.URL,rol).map( (response: Response) => response.json().data) as Observable<any>;
  }

  editar(id:any, rol: any): Observable<any> {
    return this.jwtRequest.put(RolesService.URL,id, rol).map( (response: Response) => response.json().data) as Observable<any>;
  }

  eliminar(id:any): Observable<any> {
    return this.jwtRequest.delete(RolesService.URL,id).map( (response: Response) => response.json().data) as Observable<any>;
  }


}
