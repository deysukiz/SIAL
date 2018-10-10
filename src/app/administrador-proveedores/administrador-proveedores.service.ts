import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../jwt-request.service';

@Injectable()
export class AdministradorProveedoresService {

  constructor(private http: Http,  private jwtRequest:JwtRequestService) { }

  jurisdicciones(): Observable<any[]>{
    return this.jwtRequest.get("jurisdicciones").map( (response: Response) => response.json().data) as Observable<any[]>;
  }
  
  abasto(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("abasto",null,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  pedidos(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("pedidos-administrador-proveedores",null,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  verPedido(id:any): Observable<any>{
    return this.jwtRequest.get('pedidos-administrador-proveedores-pedido',id,{}).map( (response: Response) => {
       let jsonData = response.json().data;
        var pedido = jsonData as any;
        //usuario.roles = roles;
        return pedido;
      }) as Observable<any>;
  }

  verArchivos(id:any): Observable<any>{
    return this.jwtRequest.get('repository',id,{}).map( (response: Response) => {
       let jsonData = response.json().data;
       var repositorio = jsonData as any;
        
        return repositorio;
      }) as Observable<any>;
  }

  eliminarArchivos(id:any): Observable<any>{
    return this.jwtRequest.delete('repository',id,{}).map( (response: Response) => {
       let jsonData = response.json().data;
       var repositorio = jsonData as any;
        
        return repositorio;
      }) as Observable<any>;
  }
  descargarArchivos(id:any): Observable<any>{
    return this.jwtRequest.get('repository-download',id,{}).map( (response: Response) => {
        return 0;
      }) as Observable<any>;
  }
  presupuesto(parametros): Observable<any>{    
    return this.jwtRequest.get("presupuesto-pedidos-administrador-proveedores",null,parametros).map( (response: Response) => response.json());
  }
}
