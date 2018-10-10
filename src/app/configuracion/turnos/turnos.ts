export class Turno {
    id: string;
    tipo_servicio: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
    cargando: boolean = false;
}

export interface Turno {
    id: string;
    tipo_servicio: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
}