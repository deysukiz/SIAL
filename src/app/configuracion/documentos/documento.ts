export class Documento {
    id: string;
    tipo_servicio: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
    cargando: boolean = false;
}

export interface Documento {
    id: string;
    tipo_servicio: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
}