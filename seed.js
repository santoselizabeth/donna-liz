import 'dotenv/config';
import mongoose from 'mongoose';
import produto from './produto.js'; // Seu model de produto

const produtosParaInserir = [
    { id: 1, nome: "Margherita Liz", preco: 54.90, descricao: "Molho pomodoro, mozzarella e manjericão fresco.", categoria: "pizza", imagem: "./marg.jpg" },
    { id: 2, nome: "Calabresa Premium", preco: 59.90, descricao: "Calabresa artesanal, cebola roxa e azeitonas pretas.", categoria: "pizza", imagem: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=200" },
    { id: 3, nome: "Coca-Cola 2L", preco: 14.00, descricao: "Gelada e refrescante.", categoria: "bebida", imagem: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200" },
    { id: 4, nome: "Tiramisù Donna", preco: 28.00, descricao: "Clássica sobremesa italiana com café e cacau.", categoria: "sobremesa", imagem: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=200" },
    { id: 5, nome: "Quattro Formaggi", preco: 62.00, descricao: "Mozzarella, gorgonzola, parmesão e provolone premium.", categoria: "pizza", imagem: "./quattroformaggi.jpg" },
    { id: 6, nome: "Parma e Rúcula", preco: 68.00, descricao: "Presunto de Parma fatiado, rúcula fresca e lascas de parmesão.", categoria: "pizza", imagem: "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=200" },
    { id: 7, nome: "Diavola Liz", preco: 58.00, descricao: "Salame picante artesanal, pimenta calabresa e mel de flor de laranjeira.", categoria: "pizza", imagem: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=200" },
    { id: 8, nome: "Vinho Chianti Classico", preco: 120.00, descricao: "Vinho tinto seco italiano, perfeito para acompanhar pizzas vermelhas.", categoria: "bebida", imagem: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200" },
    { id: 9, nome: "Panna Cotta", preco: 24.00, descricao: "Creme cozido com favas de baunilha e calda de frutas vermelhas.", categoria: "sobremesa", imagem: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=200" }
];

const popularBanco = async () => {
    try {
        // Se process.env.MONGO_URI falhar, usamos a sua string direta do Atlas
        const urlConexao = process.env.MONGO_URI || "mongodb+srv://elizabeth:amy%400505@users.ych5nvr.mongodb.net/elizabeth?retryWrites=true&w=majority";
        
        await mongoose.connect(urlConexao);
        
        // CORREÇÃO 1: Mudado de 'Produto' para 'produto' (minúsculo)
        await produto.deleteMany({}); 
        
        // CORREÇÃO 2: Mudado de 'Produto' para 'produto' (minúsculo)
        await produto.insertMany(produtosParaInserir);
        
        console.log("====================================");
        console.log("🚀 Todos os produtos da Donna Liz foram cadastrados no MongoDB com sucesso!");
        console.log("====================================");
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Erro ao popular o banco:", error);
    }
};

popularBanco();