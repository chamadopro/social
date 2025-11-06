-- Atualizar fotos de perfil dos usuários
UPDATE usuarios SET foto_perfil = 'http://localhost:3001/uploads/avatar_joao.png' WHERE id = 'cliente-001';
UPDATE usuarios SET foto_perfil = 'http://localhost:3001/uploads/avatar_maria.png' WHERE id = 'prestador-001';

-- Atualizar fotos dos posts
UPDATE posts SET fotos = ARRAY['http://localhost:3001/uploads/post_vazamento.png'] WHERE id = 'post-001';
UPDATE posts SET fotos = ARRAY['http://localhost:3001/uploads/post_encanamento.png'] WHERE id = 'post-002';

-- Marcar post do prestador como apresentação
UPDATE posts SET is_apresentacao = true WHERE id = 'post-002';

