import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../../jwt-request.service';

import { Pedido } from '../../pedidos/pedido';

@Injectable()
export class RecepcionService {
    static readonly URL: string = "recepcion-pedido";

    constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

    verRecepcionPedido(id:any): Observable<any>{
        return this.jwtRequest.get(RecepcionService.URL,id,{}).map( (response: Response) => {
        
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

    guardarRecepcionPedido(id:any, recepcion: any): Observable<any> {
        return this.jwtRequest.put(RecepcionService.URL, id, recepcion).map( (response: Response) => response.json().data) as Observable<any>;
    }
}
