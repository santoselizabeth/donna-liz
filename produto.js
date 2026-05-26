import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    descricao: { type: String, required: true },
    categoria: { type: String, required: true },
    imagem: { type: String, required: true }
});

export default mongoose.model('Produto', produtoSchema);