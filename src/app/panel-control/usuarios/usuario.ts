import { Rol }       from '../roles/rol';

export class Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    password: string;
    servidor_id: string;
    avatar:string;
    roles: string[];
    unidades_medicas: string[];
    unidades_medicas_objs: any[];
    almacenes: string[];
    su: boolean;
    cargando:boolean = false;
    medico_id: string;
    proveedor_id: number;
}

export interface Usuario {
    id: number;
    nombre: string;
    apellidos: string;
    password: string;
    confirmarPassword: string;
    avatar:string;
    roles: string[];
    unidades_medicas: string[];
    unidades_medicas_objs: any[];
    almacenes: string[];
    medico_id: string;
    proveedor_id: number;
}
