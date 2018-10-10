import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';


@Injectable()
export class SyncService {

  static readonly URL: string = "sync";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  servidores(payload:any =  {page: 1, per_page: 20}  ): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/servidores",null,payload).map( (response: Response) => response.json().data);
  }

  buscarServidores( payload:any = {q: "", page: 1, per_page: 20} ): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/servidores",null,payload).map( (response: Response) => response.json().data);
  }

  verServidor(id:any): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/servidores",id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
        return jsonData;
      }) as Observable<any>;
  }

  crearServidor(objeto: any): Observable<any> {
    return this.jwtRequest.post(SyncService.URL+"/servidores",objeto).map( (response: Response) => response.json().data) as Observable<any>;
  }

  editarServidor(id:any, objeto: any): Observable<any> {
    return this.jwtRequest.put(SyncService.URL+"/servidores",id, objeto).map( (response: Response) => response.json().data) as Observable<any>;
  }
  eliminarServidor(id:any): Observable<any> {
    return this.jwtRequest.delete(SyncService.URL+"/servidores",id).map( (response: Response) => response.json().data) as Observable<any>;
  }


  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/lista",null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }
  

  listaPaginada(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/lista",null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }


  buscarLog(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/log",null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }
  logPaginado(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/log",null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  

  auto(): Observable<any>{
    return this.jwtRequest.get(SyncService.URL+"/auto",null,{}).map( (response: Response) => response.json().data ) as Observable<any>;
  }

  unidadesMedicas(parametros:any = {}): Observable<any>{    
    return this.jwtRequest.get("unidades-medicas",null,parametros).map( (response: Response) => response.json().data);
  }

  
}
