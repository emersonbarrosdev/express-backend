// import express from 'express';
// import bodyParser from 'body-parser';
// import { Low, JSONFileSync } from 'lowdb';
// import { nanoid } from 'nanoid'; // Para gerar IDs únicos

// const app = express();

// const adapter = new JSONFileSync('data/db.json');
// const db = new Low(adapter);

// await db.read();

// app.use(bodyParser.json());

// // Função para obter os nomes das posições e perfis
// const getPositionsAndPerfiles = (positions) => {
//   const positionNames = positions.map(pos => pos.namePosition);
//   const profileNames = [...new Set(positions.flatMap(pos => pos.idPerfiles.map(perfil => perfil.perfil)))];
//   return { positionNames, profileNames };
// };

// // Rota para obter todos os usuários ou um usuário específico
// app.get('/usuarios', (req, res) => {
//   const { identifier, userType } = req.query;
//   if (identifier && userType) {
//     const usuario = db.data.usuarios.find(u => u.identifier === identifier && u.userType === userType);
//     if (usuario) {
//       const userPositions = db.data.positions
//         .filter(pos => pos.identifier === identifier && pos.userType === userType)
//         .map(pos => {
//           const { identifier, userType, ...rest } = pos;
//           return rest;
//         });
//       res.json({ ...usuario, positions: userPositions });
//     } else {
//       res.status(404).send('Usuário não encontrado');
//     }
//   } else {
//     const usuarios = db.data.usuarios.map(usuario => {
//       const userPositions = db.data.positions.filter(pos => pos.identifier === usuario.identifier && pos.userType === usuario.userType);
//       const { positionNames, profileNames } = getPositionsAndPerfiles(userPositions);
//       return { ...usuario, positions: positionNames, perfiles: profileNames };
//     });
//     res.json(usuarios);
//   }
// });

// // Rota para obter uma posição específica
// app.get('/usuarios/:identifier/positions/:positionId', (req, res) => {
//   const { identifier, positionId } = req.params;
//   const position = db.data.positions.find(pos => pos.idPosition === positionId && pos.identifier === identifier);
//   if (position) {
//     const { identifier, userType, ...rest } = position;
//     res.json(rest);
//   } else {
//     res.status(404).send('Posição não encontrada');
//   }
// });

// // Rota para criar uma nova posição
// app.post('/usuarios/:identifier/positions', async (req, res) => {
//   const { identifier } = req.params;
//   const usuario = db.data.usuarios.find(u => u.identifier === identifier);
//   if (usuario) {
//     const newPosition = {
//       idPosition: nanoid(),
//       identifier: identifier,
//       userType: usuario.userType,
//       namePosition: req.body.namePosition,
//       idPaises: req.body.idPaises.map(idPais => {
//         const pais = db.data.paises.find(p => p.idPais === idPais);
//         return pais ? { idPais: pais.idPais, pais: pais.pais } : { idPais };
//       }),
//       idPerfiles: req.body.idPerfiles.map(idPerfil => {
//         const perfil = db.data.perfiles.find(p => p.idPerfil === idPerfil);
//         return perfil ? { idPerfil: perfil.idPerfil, perfil: perfil.perfil } : { idPerfil };
//       }),
//       byDefault: req.body.byDefault,
//       atributosEmpleado: req.body.atributosEmpleado.map(atributo => {
//         const atributoInfo = db.data.atributosEmpleado.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
//         return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
//       }),
//       atributosExterno: req.body.atributosExterno.map(atributo => {
//         const atributoInfo = db.data.atributosExterno.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
//         return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
//       })
//     };
//     db.data.positions.push(newPosition);
//     await db.write();
//     res.status(201).json(newPosition);
//   } else {
//     res.status(404).send('Usuário não encontrado');
//   }
// });

// // Rota para atualizar uma posição específica
// app.patch('/usuarios/:identifier/positions/:positionId', async (req, res) => {
//   const { identifier, positionId } = req.params;
//   const updates = req.body;
//   const positionIndex = db.data.positions.findIndex(pos => pos.idPosition === positionId && pos.identifier === identifier);
//   if (positionIndex !== -1) {
//     const updatedPosition = { ...db.data.positions[positionIndex], ...updates };
//     if (updates.idPaises) {
//       updatedPosition.idPaises = updates.idPaises.map(idPais => {
//         const pais = db.data.paises.find(p => p.idPais === idPais);
//         return pais ? { idPais: pais.idPais, pais: pais.pais } : { idPais };
//       });
//     }
//     if (updates.idPerfiles) {
//       updatedPosition.idPerfiles = updates.idPerfiles.map(idPerfil => {
//         const perfil = db.data.perfiles.find(p => p.idPerfil === idPerfil);
//         return perfil ? { idPerfil: perfil.idPerfil, perfil: perfil.perfil } : { idPerfil };
//       });
//     }
//     if (updates.atributosEmpleado) {
//       updatedPosition.atributosEmpleado = updates.atributosEmpleado.map(atributo => {
//         const atributoInfo = db.data.atributosEmpleado.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
//         return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
//       });
//     }
//     if (updates.atributosExterno) {
//       updatedPosition.atributosExterno = updates.atributosExterno.map(atributo => {
//         const atributoInfo = db.data.atributosExterno.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
//         return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
//       });
//     }
//     db.data.positions[positionIndex] = updatedPosition;
//     await db.write();
//     res.json(updatedPosition);
//   } else {
//     res.status(404).send('Posição não encontrada');
//   }
// });

// // Rota para deletar uma posição específica
// app.delete('/usuarios/:identifier/positions/:positionId', async (req, res) => {
//   const { identifier, positionId } = req.params;
//   const positionIndex = db.data.positions.findIndex(pos => pos.idPosition === positionId && pos.identifier === identifier);
//   if (positionIndex !== -1) {
//     db.data.positions.splice(positionIndex, 1);
//     await db.write();
//     res.status(204).send(); // Sem conteúdo
//   } else {
//     res.status(404).send('Posição não encontrada');
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from 'express';
import bodyParser from 'body-parser';
import { Low, JSONFileSync } from 'lowdb';
import { nanoid } from 'nanoid';

const app = express();

const dbFiles = [
  'data/usuarios.json',
  'data/positions.json',
  'data/paises.json',
  'data/perfiles.json',
  'data/atributosEmpleado.json',
  'data/atributosExterno.json'
];

const dbAdapters = dbFiles.map(file => new JSONFileSync(file));
const [usuariosDb, positionsDb, paisesDb, perfilesDb, atributosEmpleadoDb, atributosExternoDb] = dbAdapters.map(adapter => new Low(adapter));

await Promise.all([usuariosDb.read(), positionsDb.read(), paisesDb.read(), perfilesDb.read(), atributosEmpleadoDb.read(), atributosExternoDb.read()]);

app.use(bodyParser.json());

const getPositionsAndPerfiles = (positions) => {
  const positionNames = positions.map(pos => pos.namePosition);
  const profileNames = [...new Set(positions.flatMap(pos => pos.idPerfiles.map(perfil => perfil.perfil)))];
  return { positionNames, profileNames };
};

app.get('/usuarios', (req, res) => {
  const { identifier, userType } = req.query;
  if (identifier && userType) {
    const usuario = usuariosDb.data.usuarios.find(u => u.identifier === identifier && u.userType === userType);
    if (usuario) {
      const userPositions = positionsDb.data.positions
        .filter(pos => pos.identifier === identifier && pos.userType === userType)
        .map(pos => {
          const { identifier, userType, ...rest } = pos;
          return rest;
        });
      res.json({ ...usuario, positions: userPositions });
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } else {
    const usuarios = usuariosDb.data.usuarios.map(usuario => {
      const userPositions = positionsDb.data.positions.filter(pos => pos.identifier === usuario.identifier && pos.userType === usuario.userType);
      const { positionNames, profileNames } = getPositionsAndPerfiles(userPositions);
      return { ...usuario, positions: positionNames, perfiles: profileNames };
    });
    res.json(usuarios);
  }
});

app.get('/usuarios/:identifier/positions/:positionId', (req, res) => {
  const { identifier, positionId } = req.params;
  const position = positionsDb.data.positions.find(pos => pos.idPosition === positionId && pos.identifier === identifier);
  if (position) {
    const { identifier, userType, ...rest } = position;
    res.json(rest);
  } else {
    res.status(404).send('Posição não encontrada');
  }
});

app.post('/usuarios/:identifier/positions', async (req, res) => {
  const { identifier } = req.params;
  const usuario = usuariosDb.data.usuarios.find(u => u.identifier === identifier);
  if (usuario) {
    const newPosition = {
      idPosition: nanoid(),
      identifier: identifier,
      userType: usuario.userType,
      namePosition: req.body.namePosition,
      idPaises: req.body.idPaises.map(idPais => {
        const pais = paisesDb.data.paises.find(p => p.idPais === idPais);
        return pais ? { idPais: pais.idPais, pais: pais.pais } : { idPais };
      }),
      idPerfiles: req.body.idPerfiles.map(idPerfil => {
        const perfil = perfilesDb.data.perfiles.find(p => p.idPerfil === idPerfil);
        return perfil ? { idPerfil: perfil.idPerfil, perfil: perfil.perfil } : { idPerfil };
      }),
      byDefault: req.body.byDefault,
      atributosEmpleado: req.body.atributosEmpleado.map(atributo => {
        const atributoInfo = atributosEmpleadoDb.data.atributosEmpleado.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
        return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
      }),
      atributosExterno: req.body.atributosExterno.map(atributo => {
        const atributoInfo = atributosExternoDb.data.atributosExterno.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
        return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
      })
    };
    positionsDb.data.positions.push(newPosition);
    await positionsDb.write();
    res.status(201).json(newPosition);
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});

app.patch('/usuarios/:identifier/positions/:positionId', async (req, res) => {
  const { identifier, positionId } = req.params;
  const updates = req.body;
  const positionIndex = positionsDb.data.positions.findIndex(pos => pos.idPosition === positionId && pos.identifier === identifier);
  if (positionIndex !== -1) {
    const updatedPosition = { ...positionsDb.data.positions[positionIndex], ...updates };
    if (updates.idPaises) {
      updatedPosition.idPaises = updates.idPaises.map(idPais => {
        const pais = paisesDb.data.paises.find(p => p.idPais === idPais);
        return pais ? { idPais: pais.idPais, pais: pais.pais } : { idPais };
      });
    }
    if (updates.idPerfiles) {
      updatedPosition.idPerfiles = updates.idPerfiles.map(idPerfil => {
        const perfil = perfilesDb.data.perfiles.find(p => p.idPerfil === idPerfil);
        return perfil ? { idPerfil: perfil.idPerfil, perfil: perfil.perfil } : { idPerfil };
      });
    }
    if (updates.atributosEmpleado) {
      updatedPosition.atributosEmpleado = updates.atributosEmpleado.map(atributo => {
        const atributoInfo = atributosEmpleadoDb.data.atributosEmpleado.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
        return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
      });
    }
    if (updates.atributosExterno) {
      updatedPosition.atributosExterno = updates.atributosExterno.map(atributo => {
        const atributoInfo = atributosExternoDb.data.atributosExterno.find(a => a.idAtributoFijo === atributo.idAtributoFijo);
        return { idAtributoFijo: atributo.idAtributoFijo, nomeAtributo: atributoInfo ? atributoInfo.nomeAtributo : '', valorAtributo: atributo.valorAtributo };
      });
    }
    positionsDb.data.positions[positionIndex] = updatedPosition;
    await positionsDb.write();
    res.json(updatedPosition);
  } else {
    res.status(404).send('Posição não encontrada');
  }
});

app.delete('/usuarios/:identifier/positions/:positionId', async (req, res) => {
  const { identifier, positionId } = req.params;
  const positionIndex = positionsDb.data.positions.findIndex(pos => pos.idPosition === positionId && pos.identifier === identifier);
  if (positionIndex !== -1) {
    positionsDb.data.positions.splice(positionIndex, 1);
    await positionsDb.write();
    res.status(204).send(); // Sem conteúdo
  } else {
    res.status(404).send('Posição não encontrada');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
