import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de exemplo
  const hashedPassword = await bcrypt.hash('123456789', 12);

  // Admin
  await prisma.usuario.upsert({
    where: { id: 'admin-001' },
    update: {},
    create: {
      id: 'admin-001',
      tipo: 'ADMIN',
      nome: 'Administrador ChamadoPro',
      email: 'admin@chamadopro.com',
      senha: hashedPassword,
      telefone: '(11) 99999-9999',
      cpf_cnpj: '12345678901',
      data_nascimento: new Date('1990-01-01'),
      endereco: {
        cep: '01234-567',
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        latitude: -23.5505,
        longitude: -46.6333,
      },
      ativo: true,
      verificado: true,
      reputacao: 5.0,
      pontos_penalidade: 0,
    },
  });

  // Moderador
  await prisma.usuario.upsert({
    where: { id: 'moderador-001' },
    update: {},
    create: {
      id: 'moderador-001',
      tipo: 'MODERADOR',
      nome: 'Moderador ChamadoPro',
      email: 'moderador@chamadopro.com',
      senha: hashedPassword,
      telefone: '(11) 88888-8888',
      cpf_cnpj: '98765432100',
      data_nascimento: new Date('1985-05-15'),
      endereco: {
        cep: '04567-890',
        rua: 'Avenida Paulista',
        numero: '456',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        latitude: -23.5613,
        longitude: -46.6565,
      },
      ativo: true,
      verificado: true,
      reputacao: 5.0,
      pontos_penalidade: 0,
    },
  });

  // Cliente de exemplo
  const cliente = await prisma.usuario.upsert({
    where: { id: 'cliente-001' },
    update: {},
    create: {
      id: 'cliente-001',
      tipo: 'CLIENTE',
      nome: 'João Silva',
      email: 'cliente@exemplo.com',
      senha: hashedPassword,
      telefone: '(11) 77777-7777',
      cpf_cnpj: '11122233344',
      data_nascimento: new Date('1992-03-20'),
      foto_perfil: 'http://localhost:3001/uploads/avatar_joao.png',
      endereco: {
        cep: '01234-567',
        rua: 'Rua das Palmeiras',
        numero: '789',
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        estado: 'SP',
        latitude: -23.5489,
        longitude: -46.6388,
      },
      ativo: true,
      verificado: true,
      reputacao: 4.5,
      pontos_penalidade: 0,
    },
  });

  // Prestador de exemplo
  const prestador = await prisma.usuario.upsert({
    where: { id: 'prestador-001' },
    update: {},
    create: {
      id: 'prestador-001',
      tipo: 'PRESTADOR',
      nome: 'Maria Santos',
      email: 'prestador@exemplo.com',
      senha: hashedPassword,
      telefone: '(11) 66666-6666',
      cpf_cnpj: '12345678000195',
      data_nascimento: new Date('1988-07-10'),
      foto_perfil: 'http://localhost:3001/uploads/avatar_maria.png',
      endereco: {
        cep: '04567-890',
        rua: 'Rua dos Jardins',
        numero: '321',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        estado: 'SP',
        latitude: -23.5674,
        longitude: -46.6521,
      },
      ativo: true,
      verificado: true,
      reputacao: 4.8,
      pontos_penalidade: 0,
    },
  });

  // Criar posts de exemplo
  const post1 = await prisma.post.upsert({
    where: { id: 'post-001' },
    update: { is_apresentacao: true },
    create: {
      id: 'post-001',
      usuario_id: cliente.id,
      tipo: 'SOLICITACAO',
      titulo: 'Preciso de um encanador para vazamento',
      categoria: 'Encanamento',
      descricao: 'Tenho um vazamento na torneira da cozinha que está pingando constantemente. Preciso de um profissional para resolver o problema.',
      localizacao: {
        endereco: 'Rua das Palmeiras, 789 - Vila Madalena, São Paulo - SP',
        latitude: -23.5489,
        longitude: -46.6388,
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      // preco_estimado não informado - valor opcional
      prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      fotos: ['http://localhost:3001/uploads/post_vazamento.png'],
      urgencia: 'MEDIA',
      is_apresentacao: true,
      status: 'ATIVO',
    },
  });

  await prisma.post.upsert({
    where: { id: 'post-002' },
    update: {},
    create: {
      id: 'post-002',
      usuario_id: prestador.id,
      tipo: 'OFERTA',
      titulo: 'Serviços de Encanamento Profissional',
      categoria: 'Encanamento',
      descricao: 'Ofereço serviços completos de encanamento: reparos, instalações, manutenção preventiva. Atendo toda a região de São Paulo.',
      localizacao: {
        endereco: 'Rua dos Jardins, 321 - Jardins, São Paulo - SP',
        latitude: -23.5674,
        longitude: -46.6521,
        bairro: 'Jardins',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      // valor_por_hora não informado - valor opcional
      prazo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
      fotos: ['http://localhost:3001/uploads/post_encanamento.png'],
      urgencia: 'BAIXA',
      disponibilidade: 'COMERCIAL_8_5',
      is_apresentacao: true,
      status: 'ATIVO',
    },
  });

  // Criar mais posts de exemplo para a página pública
  await prisma.post.upsert({
    where: { id: 'post-003' },
    update: {},
    create: {
      id: 'post-003',
      usuario_id: cliente.id,
      tipo: 'VITRINE_CLIENTE',
      titulo: 'Cliente buscando serviços de qualidade',
      categoria: 'Geral',
      descricao: 'Aqui está minha vitrine como cliente. Sempre em busca de profissionais qualificados e confiáveis para diversos serviços.',
      localizacao: {
        endereco: 'Rua das Palmeiras, 789 - Vila Madalena, São Paulo - SP',
        latitude: -23.5489,
        longitude: -46.6388,
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      fotos: [],
      is_apresentacao: true,
      status: 'ATIVO',
    },
  });

  await prisma.post.upsert({
    where: { id: 'post-004' },
    update: {},
    create: {
      id: 'post-004',
      usuario_id: prestador.id,
      tipo: 'VITRINE_PRESTADOR',
      titulo: 'Profissional especializado em serviços residenciais',
      categoria: 'Geral',
      descricao: 'Minha vitrine como prestador de serviços. Ofereço soluções completas e de qualidade para suas necessidades.',
      localizacao: {
        endereco: 'Rua dos Jardins, 321 - Jardins, São Paulo - SP',
        latitude: -23.5674,
        longitude: -46.6521,
        bairro: 'Jardins',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      fotos: [],
      is_apresentacao: true,
      status: 'ATIVO',
    },
  });

  // Criar orçamento de exemplo
  const orcamento = await prisma.orcamento.upsert({
    where: { id: 'orcamento-001' },
    update: {},
    create: {
      id: 'orcamento-001',
      post_id: post1.id,
      prestador_id: prestador.id,
      cliente_id: cliente.id,
      valor: 120.00,
      descricao: 'Vou resolver o vazamento da torneira da cozinha. Inclui diagnóstico, reparo e teste de funcionamento.',
      prazo_execucao: 2, // 2 dias
      condicoes_pagamento: 'Pagamento via PIX após conclusão do serviço',
      fotos: [],
      garantia: '30 dias de garantia no serviço executado',
      desconto: 10, // 10% de desconto
      status: 'PENDENTE',
    },
  });

  // Criar contrato de exemplo
  const contrato = await prisma.contrato.upsert({
    where: { id: 'contrato-001' },
    update: {},
    create: {
      id: 'contrato-001',
      orcamento_id: orcamento.id,
      cliente_id: cliente.id,
      prestador_id: prestador.id,
      valor: 120.00,
      prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
      condicoes: 'Serviço de reparo de vazamento na torneira da cozinha',
      garantias: '30 dias de garantia no serviço executado',
      status: 'ATIVO',
    },
  });

  // Criar pagamento de exemplo
  await prisma.pagamento.upsert({
    where: { id: 'pagamento-001' },
    update: {},
    create: {
      id: 'pagamento-001',
      contrato_id: contrato.id,
      valor: 120.00,
      metodo: 'PIX',
      status: 'PENDENTE',
      taxa_plataforma: 6.00, // 5% de taxa
    },
  });

  // Criar notificações de exemplo
  await prisma.notificacao.createMany({
    data: [
      {
        id: 'notif-001',
        usuario_id: cliente.id,
        tipo: 'NOVO_ORCAMENTO',
        titulo: 'Novo orçamento recebido',
        mensagem: 'Você recebeu um novo orçamento de R$ 120,00 para seu serviço de encanamento.',
        lida: false,
      },
      {
        id: 'notif-002',
        usuario_id: prestador.id,
        tipo: 'ORCAMENTO_ACEITO',
        titulo: 'Orçamento aceito',
        mensagem: 'Seu orçamento foi aceito! O contrato foi criado e o pagamento está em processo.',
        lida: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('👤 Admin criado: admin@chamadopro.com');
  console.log('👤 Moderador criado: moderador@chamadopro.com');
  console.log('👤 Cliente criado: cliente@exemplo.com');
  console.log('👤 Prestador criado: prestador@exemplo.com');
  console.log('🔑 Senha padrão para todos: 123456789');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

