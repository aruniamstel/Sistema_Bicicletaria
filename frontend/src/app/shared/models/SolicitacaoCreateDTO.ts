import { Categoria } from "./categoria.model";

export class SolicitacaoCreateDTO {
    public description : String = "";
    public categoria : Categoria = new Categoria();
    public defeito : String = "";
    public idCliente : String = ""
};