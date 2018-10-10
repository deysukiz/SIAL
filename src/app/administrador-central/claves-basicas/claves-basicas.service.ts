import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class ClavesBasicasService {

    static readonly URL: string = "administrador-central/claves-basicas";
    constructor(private jwtRequest: JwtRequestService) { }

    lista(): Observable<any[]> {
        return this.jwtRequest.get(ClavesBasicasService.URL).map((response: Response) => response.json().data) as Observable<any[]>;
    }

    buscar(term: string, pagina: number = 1, resultados_por_pagina: number = 20): Observable<any> {
        return this.jwtRequest.get(ClavesBasicasService.URL, null, { q: term, page: pagina, per_page: resultados_por_pagina }).map((response: Response) => response.json().data);
    }

    listaPaginada(pagina: number = 1, resultados_por_pagina: number = 20): Observable<any> {
        return this.jwtRequest.get(ClavesBasicasService.URL, null, { page: pagina, per_page: resultados_por_pagina }).map((response: Response) => response.json().data);
    }

    ver(id: any): Observable<any> {
        return this.jwtRequest.get(ClavesBasicasService.URL, id, {}).map((response: Response) => {

            let jsonData = response.json().data;
            return jsonData;
        }) as Observable<any>;
    }

    crear(item: any): Observable<any> {
        return this.jwtRequest.post(ClavesBasicasService.URL, item).map((response: Response) => response.json().data) as Observable<any>;
    }

    editar(id: any, item: any): Observable<any> {
        return this.jwtRequest.put(ClavesBasicasService.URL, id, item).map((response: Response) => response.json().data) as Observable<any>;
    }

    eliminar(id: any): Observable<any> {
        return this.jwtRequest.delete(ClavesBasicasService.URL, id).map((response: Response) => response.json().data) as Observable<any>;
    }

    listaClues(id: any, payload): Observable<any> {
        return this.jwtRequest.get("administrador-central/claves-basicas-clues", id, payload).map((response: Response) => response.json().data);
    }

    agregarClues(payload: any): Observable<any> {
        return this.jwtRequest.post("administrador-central/claves-basicas-clues", payload).map((response: Response) => response.json().data);
    }

    eliminarClues(id: any): Observable<any> {
        return this.jwtRequest.delete("administrador-central/claves-basicas-clues", id).map((response: Response) => response.json().data);
    }
}
