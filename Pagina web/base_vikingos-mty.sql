-- Crear base de datos 
CREATE DATABASE vikingos_mty
USE vikingos_mty

CREATE TABLE categorias(
    categorias_id INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(100),
	 clientes_id int)

CREATE TABLE proveedor(proveedor_id INT PRIMARY KEY,
					   ingredientes_inv_id INT)
CREATE TABLE ingredientes_inventario(ingredientes_inv_id INT PRIMARY KEY)
CREATE TABLE promociones(promociones_id INT PRIMARY KEY,
						 categorias_id INT)
CREATE TABLE pedidos(pedidos_id INT PRIMARY KEY,
					 promociones_id INT,
					 productos_id INT)
CREATE TABLE cor_dia(cor_id INT PRIMARY KEY,
					 productos_id INT)
CREATE TABLE metodos_pago (metodos_pago_id INT PRIMARY KEY,
						   nombre VARCHAR(100) NOT NULL,
						   descripcion VARCHAR(100),
						   pedidos_id INT)
CREATE TABLE productos (
	productos_id INT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio MONEY NOT NULL,
    stock INT NOT NULL,
    categoria_id INT NOT NULL,
    imagen VARCHAR(500),
    descripcion VARCHAR(200),
    sku VARCHAR(100),
    activo BIT,  -- 1=activo, 0=descontinuado
    fecha_creacion DATETIME,
    fecha_actualizacion DATETIME,
	categorias_id INT,
	inventario_id INT,
	ventas_id INT)
CREATE TABLE inventario(inventario_id INT,
						productos_id INT,
						ingredientes_inv_id INT,
						usuarios_id INT)
CREATE TABLE ventas (
    ventas_id INT PRIMARY KEY,
    fecha_hora DATE,
    cajero_id INT,
    subtotal FLOAT NOT NULL,
    igv FLOAT NOT NULL,
    total FLOAT NOT NULL,
    metodo_pago_id INT NOT NULL, 
    monto_pago FLOAT NOT NULL,
    cambio FLOAT NOT NULL,
    cliente_id INT,
    fecha_creacion DATE,
	ticket_id INT)
-- Tabla detalle_venta (sin cambios mayores, pero con CHECK)
CREATE TABLE ticket_venta (
    ticket_id INT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario FLOAT NOT NULL,
    total FLOAT NOT NULL,
	metodos_pago_id INT)
-- Tabla usuarios (mejorada: agregado activo, ultimo_login, telefono)
CREATE TABLE usuarios (
    usuario_id INT PRIMARY KEY, 
    nombre VARCHAR(250) NOT NULL,
    email VARCHAR(250) NOT NULL,
    password_hash VARCHAR(250) NOT NULL,
    rol VARCHAR(10) CHECK (rol IN ('admin', 'cajero')) DEFAULT 'cajero',
    activo BIT DEFAULT 1,
    ultimo_login DATETIME NULL,
    telefono VARCHAR(20),
    fecha_creacion DATETIME NULL,
	proveedor_id INT)
-- Tabla clientes (nueva, opcional para fidelización)
CREATE TABLE clientes (
    clientes_id INT PRIMARY KEY,
    nombre VARCHAR(250) NOT NULL,
    email VARCHAR(250) NOT NULL,
    telefono VARCHAR(20)NOT NULL,
    fecha_creacion DATETIME,
	usuarios_id INT)

-- Índices para rendimiento (mejorados con compuestos)
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_ventas_fecha_hora ON ventas(fecha_hora);
CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago_id);
CREATE INDEX idx_detalle_venta_venta_id ON detalle_venta(venta_id);
CREATE INDEX idx_detalle_venta_producto_id ON detalle_venta(producto_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);

-- Trigger para actualizar stock automáticamente al vender
CREATE TRIGGER actualizar_stock_venta
ON ticket_venta
FOR INSERT
AS
BEGIN
    UPDATE productos
    SET stock = stock - i.cantidad
    FROM productos p
    INNER JOIN inserted i ON p.id = i.producto_id;
END;
GO

-- Trigger para restaurar stock si se elimina una venta
CREATE TRIGGER restaurar_stock_venta
ON detalle_venta
FOR DELETE
AS
BEGIN
    UPDATE productos
    SET stock = stock + d.cantidad
    FROM productos p
    INNER JOIN deleted d ON p.id = d.producto_id;
END;
GO

-- Trigger para verificar stock antes de vender
CREATE TRIGGER verificar_stock_antes_venta
ON detalle_venta
FOR INSERT
AS
BEGIN
    DECLARE @stock_actual INT;
    SELECT @stock_actual = stock FROM productos WHERE id = (SELECT producto_id FROM inserted);
    IF @stock_actual < (SELECT cantidad FROM inserted)
    BEGIN
        RAISERROR('Stock insuficiente para este producto', 16, 1);
        RETURN;
    END
    INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, total)
    SELECT venta_id, producto_id, cantidad, precio_unitario, total FROM inserted;
END;
GO

-- Trigger para recalcular totales en ventas después de insertar detalle
CREATE TRIGGER recalcular_totales_venta
ON detalle_venta
FOR INSERT
AS
BEGIN
    DECLARE @subtotal_calc DECIMAL(10, 2);
    DECLARE @igv_calc DECIMAL(10, 2);
    DECLARE @venta_id INT = (SELECT venta_id FROM inserted);
    
    SELECT @subtotal_calc = SUM(total) FROM detalle_venta WHERE venta_id = @venta_id;
    SET @igv_calc = @subtotal_calc * 0.18;  -- Asumiendo IGV 18%
    
    UPDATE ventas
    SET subtotal = @subtotal_calc, igv = @igv_calc, total = @subtotal_calc + @igv_calc
    WHERE id = @venta_id;
END;
GO

-- Trigger para auditoría en productos
CREATE TRIGGER auditoria_productos
ON productos
FOR UPDATE
AS
BEGIN
    INSERT INTO auditoria (tabla_afectada, accion, usuario_id, detalles)
    SELECT 'productos', 'UPDATE', NULL, 'Producto ID: ' + CAST(d.id AS VARCHAR) + ' cambió'
    FROM deleted d;
END;
GO

-- Procedimiento almacenado para insertar venta completa
CREATE PROCEDURE sp_insertar_venta
    @cajero_id INT = NULL,
    @metodo_pago_id INT,
    @monto_pago DECIMAL(10, 2) = NULL,
    @cliente_id INT = NULL,
    @venta_id INT OUTPUT
AS
BEGIN
    INSERT INTO ventas (cajero_id, metodo_pago_id, monto_pago, cliente_id)
    VALUES (@cajero_id, @metodo_pago_id, @monto_pago, @cliente_id);
    SET @venta_id = SCOPE_IDENTITY();
END;
GO

-- Procedimiento para agregar producto al detalle de venta
CREATE PROCEDURE sp_agregar_detalle_venta
    @venta_id INT,
    @producto_id INT,
    @cantidad INT
AS
BEGIN
    DECLARE @precio_unit DECIMAL(10, 2);
    SELECT @precio_unit = precio FROM productos WHERE id = @producto_id;
    INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, total)
    VALUES (@venta_id, @producto_id, @cantidad, @precio_unit, @cantidad * @precio_unit);
END;
GO

-- Vista para ventas detalladas
CREATE VIEW vista_ventas_detalladas AS
SELECT 
    v.id AS venta_id,
    v.fecha_hora,
    u.nombre AS cajero,
    p.nombre AS producto,
    dv.cantidad,
    dv.precio_unitario,
    dv.total,
    v.subtotal,
    v.igv,
    v.total AS total_venta,
    mp.nombre AS metodo_pago
FROM ventas v
JOIN detalle_venta dv ON v.id = dv.venta_id
JOIN productos p ON dv.producto_id = p.id
LEFT JOIN usuarios u ON v.cajero_id = u.id
JOIN metodos_pago mp ON v.metodo_pago_id = mp.id;
GO

-- Vista para inventario bajo
CREATE VIEW vista_inventario_bajo AS
SELECT nombre, stock, categoria_id FROM productos WHERE stock < 10 AND activo = 1;
GO

-- Insertar datos iniciales en categorias
INSERT INTO categorias (nombre, descripcion) VALUES
('combos', 'Combos de productos'),
('hotdogs', 'Hot dogs y variantes'),
('salchipapas', 'Salchipapas'),
('snacks', 'Snacks y aperitivos'),
('especiales', 'Platos especiales');

-- Insertar datos iniciales en metodos_pago
INSERT INTO metodos_pago (nombre, descripcion) VALUES
('efectivo', 'Pago en efectivo'),
('tarjeta', 'Pago con tarjeta de crédito/débito');

-- Insertar datos iniciales en productos (actualizados con categoria_id y sku)
INSERT INTO productos (nombre, precio, stock, categoria_id, imagen, descripcion, sku) VALUES
('Combo 2 Salchipapas', 89.99, 15, 1, 'Imagenes/combo_2_salchipapas.jpg', '2 porciones de salchipapas con salsas incluidas', 'CB001'),
('Combo 2 Salsas Boneles', 75.99, 20, 1, 'Imagenes/combo_2_salsas_boneles.jpg', 'Boneles con 2 salsas a elegir', 'CB002'),
('Combo 2 Hotdogs Bonelees Papas', 95.99, 12, 1, 'Imagenes/combo_2Hotdogs_bonelees_papas.jpg', '2 Hotdogs bonelees con papas fritas', 'CB003'),
('Combo Boneles con Hotdog', 85.99, 8, 1, 'Imagenes/combo_boneles_con_hotdog.jpg', 'Boneles acompañados de hotdog', 'CB004'),
('Hotdog Polaco', 65.99, 18, 2, 'Imagenes/hotdog_polaco.jpg', 'Hotdog estilo polaco con ingredientes especiales', 'HD001'),
('Hotdog Sencillo', 35.99, 35, 2, 'Imagenes/hotdog_sensillo.jpg', 'Hotdog sencillo pero delicioso', 'HD002'),
('Dedos de Queso', 35.99, 30, 4, 'Imagenes/dedos_de_queso.jpg', 'Deliciosos dedos de queso fritos', 'SN001'),
('Elote', 25.99, 20, 4, 'Imagenes/Elote.jpg', 'Elote preparado con mayonesa, queso y chile', 'SN002'),
('Ensalada', 55.99, 15, 5, 'Imagenes/ensalada.jpg', 'Ensalada fresca con ingredientes premium', 'ES001'),
('Nachos', 55.99, 16, 4, 'Imagenes/nachos.jpg', 'Nachos con queso y jalapeños', 'SN003'),
('Salchipapas', 65.99, 20, 3, 'Imagenes/salchipapas.jpg', 'Salchipapas con todo incluido', 'SP001'),
('Milanesas', 75.99, 14, 5, 'Imagenes/milanesas.jpg', 'Milanesas crujientes con guarnición', 'ES002');

-- Insertar usuario admin inicial
INSERT INTO usuarios (nombre, email, password_hash, rol, telefono) VALUES
('Admin Vikingos', 'admin@vikingos.com', 'examplehashedpassword', 'admin', '555-1234');  -- Cambia por un hash real (usa .NET o PHP para bcrypt)