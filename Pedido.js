import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
    usuarioId: { type: String, required: true },
    usuarioNome: { type: String, required: true },
    itens: [
        {
            nome: { type: String, required: true },
            preco: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pendente', 'Preparando', 'A caminho', 'Entregue'], 
        default: 'Pendente' 
    },
    data: { type: Date, default: Date.now }
});

export default mongoose.model('pedido', pedidoSchema);