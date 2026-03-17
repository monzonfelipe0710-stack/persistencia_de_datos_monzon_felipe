const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Almacenamiento en memoria por IP.
const db = {};

// Obtener IP real del cliente
const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

// Obtener alumnos del usuario
app.get('/api/alumnos', (req, res) => {
    const ip = getClientIp(req);
    const alumnos = db[ip] || [];
    
    // El ordenamiento de "por nota y nombre"
    const sortedAlumnos = [...alumnos].sort((a, b) => {
        if (b.nota !== a.nota) {
            return b.nota - a.nota; // Mayor nota primero
        }
        return a.nombre.localeCompare(b.nombre); // Orden alfabético si hay empate
    });
    
    res.json(sortedAlumnos);
});

// Guardar un nuevo alumno
app.post('/api/alumnos', (req, res) => {
    const ip = getClientIp(req);
    if (!db[ip]) {
        db[ip] = [];
    }
    
    const { nombre, edad, nota } = req.body;
    
    if (!nombre || !edad || nota === undefined) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    db[ip].push({ 
        nombre, 
        edad: parseInt(edad, 10), 
        nota: parseFloat(nota) 
    });
    
    res.json({ success: true, message: 'Alumno guardado correctamente' });
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de la Segunda Parte corriendo en http://localhost:${PORT}`);
    console.log(`Puedes ingresar desde otras computadoras en la misma red usando tu IP local (ej: http://TU_IP_LOCAL:${PORT})`);
});
