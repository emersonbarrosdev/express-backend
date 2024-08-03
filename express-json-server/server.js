import express from 'express';
import bodyParser from 'body-parser';
import { Low, JSONFileSync } from 'lowdb';
import { nanoid } from 'nanoid'; // Para gerar IDs únicos

const app = express();

const adapter = new JSONFileSync('data/db.json');
const db = new Low(adapter);

await db.read();

app.use(bodyParser.json());

// Rota para obter todos os usuários
app.get('/usuarios', (req, res) => {
  const usuarios = db.data.usuarios;
  res.json(usuarios);
});

// Rota para obter um usuário específico
app.get('/usuario', (req, res) => {
  const { identifier, userType } = req.query;
  const usuario = db.data.usuarios.find(u => u.identifier === identifier && u.userType === userType);
  if (usuario) {
    res.json(usuario);
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});

// Rota para obter uma posição específica
app.get('/usuarios/:identifier/positions/:positionId', (req, res) => {
  const { identifier, positionId } = req.params;
  const usuario = db.data.usuarios.find(u => u.identifier === identifier);
  if (usuario) {
    const position = usuario.positions.find(pos => pos.idPosition === positionId);
    if (position) {
      res.json(position);
    } else {
      res.status(404).send('Posição não encontrada');
    }
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});

// Rota para criar uma nova posição
app.post('/usuarios/:identifier/positions', async (req, res) => {
  const { identifier } = req.params;
  const usuario = db.data.usuarios.find(u => u.identifier === identifier);
  if (usuario) {
    const newPosition = {
      idPosition: nanoid(),
      namePosition: req.body.nuevaPosicion,
      idPaises: req.body.idPaises.map(idPais => {
        const pais = db.data.paises.find(p => p.idPais === idPais);
        return pais ? { idPais: pais.idPais, pais: pais.pais } : { idPais };
      }),
      idPerfiles: req.body.idPerfiles.map(idPerfil => {
        const perfil = db.data.perfiles.find(p => p.idPerfil === idPerfil);
        return perfil ? { idPerfil: perfil.idPerfil, perfil: perfil.perfil } : { idPerfil };
      }),
      byDefault: req.body.porDefecto,
      atributosEmpleado: req.body.atributosEmpleado,
      atributosExterno: req.body.atributosExterno
    };
    usuario.positions.push(newPosition);
    await db.write();
    res.status(201).json(newPosition);
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});

// Rota para atualizar uma posição específica
app.patch('/usuarios/:identifier/positions/:positionId', async (req, res) => {
  const { identifier, positionId } = req.params;
  const updates = req.body;
  const usuario = db.data.usuarios.find(u => u.identifier === identifier);
  if (usuario) {
    const positionIndex = usuario.positions.findIndex(pos => pos.idPosition === positionId);
    if (positionIndex !== -1) {
      const updatedPosition = { ...usuario.positions[positionIndex], ...updates };
      if (updates.idPaises) {
        updatedPosition.idPaises = updates.idPaises.map(idPais => {
          const pais = db.data.paises.find(p => p.idPais === idPais);
          return pais ? { idPais: pais.idPais, pais: pais.pais } : { idPais };
        });
      }
      if (updates.idPerfiles) {
        updatedPosition.idPerfiles = updates.idPerfiles.map(idPerfil => {
          const perfil = db.data.perfiles.find(p => p.idPerfil === idPerfil);
          return perfil ? { idPerfil: perfil.idPerfil, perfil: perfil.perfil } : { idPerfil };
        });
      }
      usuario.positions[positionIndex] = updatedPosition;
      await db.write();
      res.json(updatedPosition);
    } else {
      res.status(404).send('Posição não encontrada');
    }
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});

// Rota para deletar uma posição específica
app.delete('/usuarios/:identifier/positions/:positionId', async (req, res) => {
  const { identifier, positionId } = req.params;
  const usuario = db.data.usuarios.find(u => u.identifier === identifier);
  if (usuario) {
    const positionIndex = usuario.positions.findIndex(pos => pos.idPosition === positionId);
    if (positionIndex !== -1) {
      usuario.positions.splice(positionIndex, 1);
      await db.write();
      res.status(204).send(); // Sem conteúdo
    } else {
      res.status(404).send('Posição não encontrada');
    }
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
