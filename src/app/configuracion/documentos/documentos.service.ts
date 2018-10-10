import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Documento } from './documento';

@Injectable()
export class DocumentosService {

  static readonly URL: string = "documentos";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(DocumentosService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(DocumentosService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  catalogo(): Observable<Documento[]>{
    return this.jwtRequest.get(DocumentosService.URL,null,{filtro_usuario:1}).map( (response: Response) => response.json().data) as Observable<Documento[]>;
  }

  ver(id:any): Observable<Documento>{
    return this.jwtRequest.get(DocumentosService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var documento = jsonData as Documento;
        //usuario.roles = roles;
        return documento;
      }) as Observable<Documento>;
  }

  crear(documento: Documento[]): Observable<Documento> {
    return this.jwtRequest.post(DocumentosService.URL,documento).map( (response: Response) => response.json().data) as Observable<Documento>;
  }

  editar(id:any, documento: Documento): Observable<Documento> {
    return this.jwtRequest.put(DocumentosService.URL,id, documento).map( (response: Response) => response.json().data) as Observable<Documento>;
  }

  eliminar(id:any): Observable<Documento> {
    return this.jwtRequest.delete(DocumentosService.URL,id).map( (response: Response) => response.json().data) as Observable<Documento>;
  }
}