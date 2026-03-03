const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir archivos estáticos (HTML, CSS, JS)

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia según tu configuración
    password: '', // Cambia según tu configuración
    database: 'vikingos_mty'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Rutas de la API

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Agregar un nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock, categoria, imagen, descripcion } = req.body;
    db.query(
        'INSERT INTO productos (nombre, precio, stock, categoria, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, precio, stock, categoria, imagen, descripcion],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, message: 'Producto agregado' });
        }
    );
});

// Actualizar producto
app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, categoria, imagen, descripcion } = req.body;
    db.query(
        'UPDATE productos SET nombre=?, precio=?, stock=?, categoria=?, imagen=?, descripcion=? WHERE id=?',
        [nombre, precio, stock, categoria, imagen, descripcion, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Producto actualizado' });
        }
    );
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado' });
    });
});

// Registrar una venta
app.post('/api/ventas', (req, res) => {
    const { fecha, hora, cajero, subtotal, igv, total, metodo_pago, monto_pago, cambio, items } = req.body;

    // Insertar venta
    db.query(
        'INSERT INTO ventas (fecha, hora, cajero, subtotal, igv, total, metodo_pago, monto_pago, cambio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [fecha, hora, cajero, subtotal, igv, total, metodo_pago, monto_pago, cambio],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const ventaId = result.insertId;

            // Insertar detalles de la venta
            const detallePromises = items.map(item => {
                return new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)',
                        [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.total],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            });

            Promise.all(detallePromises)
                .then(() => res.json({ id: ventaId, message: 'Venta registrada' }))
                .catch(err => res.status(500).json({ error: err.message }));
        }
    );
});

// Obtener ventas
app.get('/api/ventas', (req, res) => {
    db.query('SELECT * FROM ventas ORDER BY fecha_creacion DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener detalle de una venta
app.get('/api/ventas/:id', (req, res) => {
    const { id } = req.params;
    db.query(
        `SELECT dv.*, p.nombre FROM detalle_venta dv
         JOIN productos p ON dv.producto_id = p.id
         WHERE dv.venta_id = ?`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Login (opcional)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const user = results[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Contraseña incorrecta' });

        res.json({ id: user.id, nombre: user.nombre, rol: user.rol });
    });
});

// Registrar usuario (opcional)
app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hashedPassword, rol],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, message: 'Usuario registrado' });
        }
    );
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
