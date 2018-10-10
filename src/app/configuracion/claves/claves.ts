export class Clave {
    id: string;
    tipo_servicio: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
    cargando: boolean = false;
}

export interface Clave {
    id: string;
    tipo_servicio: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
}