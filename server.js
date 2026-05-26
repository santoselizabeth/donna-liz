import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import produto from './produto.js';
import usuario from './usuario.js';
import pedido from './pedido.js';

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());
const connectDB = async () => {
   try {
    const urlConexao = process.env.MONGO_URI;
    
    console.log("Tentando conectar ao MongoDB Atlas...");

    await mongoose.connect(urlConexao);
    console.log("====================================");
    console.log("🔥 Conectado ao MongoDB da Donna Liz");
    console.log("====================================");
   } catch (error) {   
    console.log("❌ Erro ao conectar ao MongoDB:", error);
   }
};

connectDB();

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await produto.find(); // Usando 'produto' igual ao import
        res.json(produtos);
    } catch (error) {
        res.status(500).json({erro: "Erro ao buscar produtos"});
    }
});

app.post("/produtos", async (req, res) => {
    try {
        const novoProduto = await produto.create(req.body);
        res.json(novoProduto);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao cadastrar produto" });
    }
});

app.post("/usuarios/cadastro", async (req, res) => {
    try {
        const novoUsuario = await usuario.create(req.body);
        res.json({ mensagem: "Cadastro realizado com sucesso!", usuario: novoUsuario });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar conta. Email já cadastrado?" });
    }
});

app.post("/usuarios/login", async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuarioEncontrado = await usuario.findOne({ email, senha });
        
        if (usuarioEncontrado) {
            res.json({ 
                autenticado: true, 
                nome: usuarioEncontrado.nome,
                id: usuarioEncontrado._id,
                _id: usuarioEncontrado._id
            });
        } else {
            res.status(401).json({ autenticado: false, erro: "E-mail ou senha incorretos" });
        }
    } catch (error) {
        res.status(500).json({ erro: "Erro ao processar login" });
    }
});

app.post("/pedidos", async (req, res) => {
    try {
        const novoPedido = await pedido.create(req.body);
        res.status(201).json({ mensagem: "Pedido realizado com sucesso!", pedido: novoPedido });
    } catch (error) {
        console.error("Erro ao salvar pedido:", error);
        res.status(500).json({ erro: "Erro ao processar o pedido no banco de dados." });
    }
});

app.get("/pedidos/:usuarioId", async (req, res) => {
    try {
        const historico = await pedido.find({ usuarioId: req.params.usuarioId }).sort({ data: -1 });
        res.json(historico);
    } catch (error) {
        console.error("Erro ao buscar histórico de pedidos:", error);
        res.status(500).json({ erro: "Erro ao buscar histórico no banco de dados." });
    }
});


app.patch("/pedidos/:id/status", async (req, res) => {
    try {
        const { status } = req.body; 
        
        const pedidoAtualizado = await pedido.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );

        res.json({ mensagem: "Status updated!", pedido: pedidoAtualizado });
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        res.status(500).json({ erro: "Erro ao atualizar status no banco." });
    }
});


app.get("/usuarios/:id", async (req, res) => {
    try {
        const usuarioEncontrado = await usuario.findById(req.params.id);
        if (usuarioEncontrado) {
            res.json({ nome: usuarioEncontrado.nome, email: usuarioEncontrado.email });
        } else {
            res.status(404).json({ erro: "Usuário não encontrado." });
        }
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar dados do usuário." });
    }
});


app.put("/usuarios/:id", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const dadosAtualizacao = { nome, email };
        
    
        if (senha) dadosAtualizacao.senha = senha;

        const usuarioAtualizado = await usuario.findByIdAndUpdate(
            req.params.id,
            dadosAtualizacao,
            { new: true }
        );

        res.json({ mensagem: "Perfil atualizado com sucesso!", usuario: usuarioAtualizado });
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ erro: "Erro ao atualizar dados no banco de dados." });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor da Donna Liz rodando em http://localhost:${PORT}`);
});