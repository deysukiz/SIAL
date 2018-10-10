import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';


import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class PermisosService {

  static readonly URL: string = "permisos";
  
  constructor(private http: Http,  private jwtRequest:JwtRequestService) { }

  lista(): Observable<any[]>{
    return this.jwtRequest.get(PermisosService.URL).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  listaPaginada(payload:any =  {page: 1, per_page: 20}  ): Observable<any>{
    return this.jwtRequest.get(PermisosService.URL,null,payload).map( (response: Response) => response.json().data);
  }

  buscar( payload:any = {q: "", page: 1, per_page: 20} ): Observable<any>{
    return this.jwtRequest.get(PermisosService.URL,null,payload).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(PermisosService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
        return jsonData;
      }) as Observable<any>;
  }

  crear(objeto: any): Observable<any> {
    return this.jwtRequest.post(PermisosService.URL,objeto).map( (response: Response) => response.json().data) as Observable<any>;
  }

  editar(id:any, objeto: any): Observable<any> {
    return this.jwtRequest.put(PermisosService.URL,id, objeto).map( (response: Response) => response.json().data) as Observable<any>;
  }
  eliminar(id:any): Observable<any> {
    return this.jwtRequest.delete(PermisosService.URL,id).map( (response: Response) => response.json().data) as Observable<any>;
  }
}
