# API Backend - Sistema de Gestión de Remesas Cootranstame

## 📋 Base de Datos: `mcp_car` (Carga)

### Tablas Principales

#### `Encabezado_Remesas`
Información de facturación, cliente, conductor, vehículo
- `EMPR_Codigo` (smallint) - Empresa
- `Numero` (numeric) - PK
- `TIDO_Codigo` (numeric) - Tipo documento
- `Numero_Documento` (numeric) - Número documento
- `Fecha` (date)
- `TERC_Codigo_Cliente` (numeric) - FK Terceros
- `TERC_Codigo_Remitente` (numeric) - FK Terceros
- `TERC_Codigo_Destinatario` (numeric) - FK Terceros
- `TERC_Codigo_Conductor` (numeric) - FK Terceros
- `VEHI_Codigo` (numeric) - FK Vehiculos
- `RUTA_Codigo` (numeric) - FK Rutas
- `Valor_Flete_Cliente` (money)
- `Total_Flete_Cliente` (money)
- `Cumplido` (smallint) - 0/1
- `Anulado` (smallint) - 0/1
- `Estado` (smallint)
- `OFIC_Codigo` (smallint) - FK Oficinas

#### `Remesas_Paqueteria`
Información logística y de entrega
- `EMPR_Codigo` (smallint)
- `ENRE_Numero` (numeric) - FK a Encabezado_Remesas.Numero
- `CIUD_Codigo_Origen` (numeric) - FK Ciudades
- `CIUD_Codigo_Destino` (numeric) - FK Ciudades
- `OFIC_Codigo_Origen` (smallint) - FK Oficinas
- `OFIC_Codigo_Destino` (smallint) - FK Oficinas
- `OFIC_Codigo_Actual` (smallint) - Oficina actual
- `Descripcion_Mercancia` (varchar)
- `Largo` (numeric) - cm
- `Alto` (numeric) - cm
- `Ancho` (numeric) - cm
- `Peso_Volumetrico` (numeric) - kg
- `Peso_A_Cobrar` (numeric) - kg
- `Flete_Pactado` (numeric)
- `CATA_ESRP_Codigo` (numeric) - **ESTADO ACTUAL** (FK Valor_Catalogos)
- `Fecha_Recibe` (datetime)
- `Nombre_Recibe` (varchar)
- `Numero_Identificacion_Recibe` (varchar)
- `Telefonos_Recibe` (varchar)
- `Firma_Recibe` (varbinary) - Imagen firma
- `Observaciones_Remitente` (varchar)
- `Observaciones_Destinatario` (varchar)
- `Reexpedicion` (smallint) - 0/1
- `Devolucion` (smallint) - 0/1

#### `Detalle_Estados_Remesas_Paqueteria`
Historial de cambios de estado
- `EMPR_Codigo` (smallint)
- `ID` (numeric) - PK
- `ENRE_Numero` (numeric) - FK Remesas
- `CATA_ESPR_Codigo` (numeric) - Código estado (FK Valor_Catalogos)
- `Fecha_Crea` (datetime)
- `USUA_Codigo_Crea` (numeric) - Usuario
- `OFIC_Codigo` (numeric) - Oficina donde se hizo el cambio
- `ENPD_Numero` (numeric) - Planilla despacho (opcional)

#### `Detalle_Etiquetas_Remesas_Paqueteria`
Etiquetas/códigos de barras
- `EMPR_Codigo` (smallint)
- `ENRE_Numero` (numeric) - FK Remesas
- `Numero_Etiqueta` (varchar)
- `Fecha_Crea` (datetime)
- `USUA_Codigo_Crea` (smallint)

#### `Terceros`
Remitentes, destinatarios, conductores, clientes
- `EMPR_Codigo` (smallint)
- `Codigo` (numeric) - PK
- `CATA_TIID_Codigo` (numeric) - Tipo identificación
- `Numero_Identificacion` (varchar)
- `Razon_Social` (varchar) - Para empresas
- `Nombre` (varchar)
- `Apellido1` (varchar)
- `Apellido2` (varchar)
- `CIUD_Codigo` (numeric) - FK Ciudades
- `Direccion` (varchar)
- `Telefonos` (varchar)
- `Celulares` (varchar)
- `Emails` (varchar)
- `Estado` (smallint)

#### `Ciudades`
- `EMPR_Codigo` (smallint)
- `Codigo` (numeric) - PK
- `Nombre` (varchar)
- `DEPA_Codigo` (numeric) - FK Departamentos
- `Estado` (smallint)

#### `Oficinas`
- `EMPR_Codigo` (smallint)
- `Codigo` (smallint) - PK
- `Nombre` (varchar)
- `CIUD_Codigo` (numeric) - FK Ciudades
- `Direccion` (varchar)
- `Telefono` (varchar)
- `Estado` (smallint)

#### `Usuarios`
- `EMPR_Codigo` (smallint)
- `Codigo` (smallint) - PK
- `Codigo_Usuario` (varchar) - **LOGIN USERNAME**
- `Nombre` (varchar)
- `Clave` (varchar) - **PASSWORD**
- `Habilitado` (smallint) - 0/1
- `Bloqueado` (smallint) - 0/1
- `TERC_Codigo_Conductor` (numeric) - Si es conductor
- `TERC_Codigo_Cliente` (numeric) - Si es cliente
- `TERC_Codigo_Empleado` (numeric) - Si es empleado

#### `Valor_Catalogos`
Catálogos parametrizables (estados, tipos, etc.)
- `EMPR_Codigo` (smallint)
- `Codigo` (numeric) - PK
- `CATA_Codigo` (smallint) - Tipo de catálogo
- `Campo1` (varchar) - Código/Nombre corto
- `Campo2` (varchar) - Descripción
- `Campo3` (varchar) - Adicional
- `Estado` (smallint)

---

## 🔐 1. Autenticación

### `POST /auth/login`

**Request:**
```json
{
  "username": "1007674001",
  "password": "TM-4001*"
}
```

**Query SQL:**
```sql
SELECT 
    u.Codigo,
    u.Codigo_Usuario,
    u.Nombre,
    u.TERC_Codigo_Empleado,
    u.TERC_Codigo_Conductor,
    u.TERC_Codigo_Cliente,
    u.Habilitado,
    u.Bloqueado
FROM Usuarios u
WHERE u.Codigo_Usuario = @username 
  AND u.Clave = @password
  AND u.Habilitado = 1
  AND u.Bloqueado = 0
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "1007674001",
    "name": "Juan Pérez",
    "role": "conductor",
    "terceroId": 456
  }
}
```

**Errors:**
- `400` - Campos faltantes
- `401` - Credenciales inválidas
- `404` - Usuario no encontrado
- `500` - Error servidor

---

## 📦 2. Listado de Remesas

### `GET /shipments`

**Query Params:**
- `status` (opcional) - Filtrar por código estado: `PEND`, `TRAN`, `ENTR`, `DEVO`
- `search` (opcional) - Buscar por número remesa, nombre destinatario
- `dateFrom` (opcional) - Desde fecha
- `dateTo` (opcional) - Hasta fecha
- `office` (opcional) - Código oficina

**Query SQL:**
```sql
SELECT 
    -- Encabezado
    er.Numero AS id,
    er.Numero_Documento AS documentNumber,
    er.Fecha AS date,
    er.Cumplido AS completed,
    er.Anulado AS cancelled,
    
    -- Remesa Paquetería
    rp.Descripcion_Mercancia AS description,
    rp.Largo AS length,
    rp.Alto AS height,
    rp.Ancho AS width,
    rp.Peso_A_Cobrar AS weight,
    rp.Flete_Pactado AS agreedRate,
    
    -- Estado Actual
    vc_est.Campo1 AS statusCode,
    vc_est.Campo2 AS statusName,
    
    -- Oficinas
    o_orig.Codigo AS originOfficeId,
    o_orig.Nombre AS originOfficeName,
    o_dest.Codigo AS destOfficeId,
    o_dest.Nombre AS destOfficeName,
    o_act.Codigo AS currentOfficeId,
    o_act.Nombre AS currentOfficeName,
    
    -- Ciudades
    c_orig.Codigo AS originCityId,
    c_orig.Nombre AS originCityName,
    c_dest.Codigo AS destCityId,
    c_dest.Nombre AS destCityName,
    
    -- Remitente
    t_rem.Codigo AS senderId,
    COALESCE(t_rem.Razon_Social, 
             CONCAT(t_rem.Nombre, ' ', t_rem.Apellido1, ' ', COALESCE(t_rem.Apellido2, ''))) AS senderName,
    t_rem.Numero_Identificacion AS senderDocNumber,
    t_rem.Telefonos AS senderPhone,
    t_rem.Direccion AS senderAddress,
    
    -- Destinatario
    t_dest.Codigo AS receiverId,
    COALESCE(t_dest.Razon_Social,
             CONCAT(t_dest.Nombre, ' ', t_dest.Apellido1, ' ', COALESCE(t_dest.Apellido2, ''))) AS receiverName,
    t_dest.Numero_Identificacion AS receiverDocNumber,
    t_dest.Telefonos AS receiverPhone,
    t_dest.Direccion AS receiverAddress,
    
    -- Valores
    er.Valor_Flete_Cliente AS freightValue,
    er.Total_Flete_Cliente AS totalFreight,
    
    -- Entrega
    rp.Fecha_Recibe AS deliveryDate,
    rp.Nombre_Recibe AS deliveredToName,
    rp.Numero_Identificacion_Recibe AS deliveredToDocNumber

FROM Encabezado_Remesas er
INNER JOIN Remesas_Paqueteria rp ON er.Numero = rp.ENRE_Numero
LEFT JOIN Valor_Catalogos vc_est ON rp.CATA_ESRP_Codigo = vc_est.Codigo
LEFT JOIN Oficinas o_orig ON rp.OFIC_Codigo_Origen = o_orig.Codigo
LEFT JOIN Oficinas o_dest ON rp.OFIC_Codigo_Destino = o_dest.Codigo
LEFT JOIN Oficinas o_act ON rp.OFIC_Codigo_Actual = o_act.Codigo
LEFT JOIN Ciudades c_orig ON rp.CIUD_Codigo_Origen = c_orig.Codigo
LEFT JOIN Ciudades c_dest ON rp.CIUD_Codigo_Destino = c_dest.Codigo
LEFT JOIN Terceros t_rem ON er.TERC_Codigo_Remitente = t_rem.Codigo
LEFT JOIN Terceros t_dest ON er.TERC_Codigo_Destinatario = t_dest.Codigo

WHERE er.Anulado = 0
  AND (@status IS NULL OR vc_est.Campo1 = @status)
  AND (@search IS NULL OR 
       er.Numero_Documento LIKE '%' + @search + '%' OR
       t_dest.Razon_Social LIKE '%' + @search + '%' OR
       t_dest.Nombre LIKE '%' + @search + '%')
  AND (@dateFrom IS NULL OR er.Fecha >= @dateFrom)
  AND (@dateTo IS NULL OR er.Fecha <= @dateTo)
  AND (@office IS NULL OR rp.OFIC_Codigo_Actual = @office)

ORDER BY er.Fecha DESC
```

**Response (200):**
```json
{
  "shipments": [
    {
      "id": 12345,
      "documentNumber": 1001,
      "date": "2026-02-09",
      "status": {
        "code": "TRAN",
        "name": "En tránsito"
      },
      "origin": {
        "office": {
          "id": 1,
          "name": "Bogotá Principal"
        },
        "city": {
          "id": 11001,
          "name": "Bogotá D.C."
        }
      },
      "destination": {
        "office": {
          "id": 5,
          "name": "Medellín Centro"
        },
        "city": {
          "id": 5001,
          "name": "Medellín"
        }
      },
      "currentOffice": {
        "id": 3,
        "name": "Bucaramanga"
      },
      "sender": {
        "id": 1001,
        "name": "María López",
        "documentNumber": "52123456",
        "phone": "3001234567",
        "address": "Calle 50 #10-20"
      },
      "receiver": {
        "id": 1002,
        "name": "Carlos Ruiz",
        "documentNumber": "71234567",
        "phone": "3009876543",
        "address": "Carrera 80 #45-30"
      },
      "package": {
        "description": "Documentos empresariales",
        "dimensions": {
          "length": 30,
          "width": 20,
          "height": 10
        },
        "weight": 2.5
      },
      "values": {
        "freightValue": 25000,
        "totalFreight": 25000,
        "agreedRate": 25000
      },
      "delivery": null,
      "completed": false,
      "cancelled": false
    }
  ],
  "total": 1
}
```

---

## 📝 3. Crear Remesa

### `POST /shipments`

**Request:**
```json
{
  "senderId": 1001,
  "receiverId": 1002,
  "originCityId": 11001,
  "destCityId": 5001,
  "originOfficeId": 1,
  "destOfficeId": 5,
  "package": {
    "description": "Documentos",
    "length": 30,
    "width": 20,
    "height": 10,
    "weight": 2.5
  },
  "values": {
    "freightValue": 25000,
    "agreedRate": 25000
  },
  "paymentMethod": "CASH"
}
```

**Proceso (2 tablas):**

**1. Insertar `Encabezado_Remesas`:**
```sql
INSERT INTO Encabezado_Remesas (
    EMPR_Codigo,
    TIDO_Codigo,
    Fecha,
    TERC_Codigo_Remitente,
    TERC_Codigo_Destinatario,
    OFIC_Codigo,
    Valor_Flete_Cliente,
    Total_Flete_Cliente,
    Cumplido,
    Anulado,
    Estado,
    USUA_Codigo_Crea,
    Fecha_Crea
) VALUES (
    1,
    @tipoDocumento,
    GETDATE(),
    @senderId,
    @receiverId,
    @originOfficeId,
    @freightValue,
    @freightValue,
    0,
    0,
    1,
    @userId,
    GETDATE()
)
-- Obtener: SELECT SCOPE_IDENTITY() AS Numero
```

**2. Insertar `Remesas_Paqueteria`:**
```sql
INSERT INTO Remesas_Paqueteria (
    EMPR_Codigo,
    ENRE_Numero,
    CIUD_Codigo_Origen,
    CIUD_Codigo_Destino,
    OFIC_Codigo_Origen,
    OFIC_Codigo_Destino,
    OFIC_Codigo_Actual,
    Descripcion_Mercancia,
    Largo,
    Alto,
    Ancho,
    Peso_A_Cobrar,
    Flete_Pactado,
    CATA_ESRP_Codigo,
    Reexpedicion,
    Devolucion
) VALUES (
    1,
    @numeroRemesa,
    @originCityId,
    @destCityId,
    @originOfficeId,
    @destOfficeId,
    @originOfficeId,
    @description,
    @length,
    @height,
    @width,
    @weight,
    @agreedRate,
    @estadoInicial, -- Obtener de catálogo "PENDIENTE"
    0,
    0
)
```

**3. Insertar estado inicial:**
```sql
INSERT INTO Detalle_Estados_Remesas_Paqueteria (
    EMPR_Codigo,
    ENRE_Numero,
    CATA_ESPR_Codigo,
    Fecha_Crea,
    USUA_Codigo_Crea,
    OFIC_Codigo
) VALUES (
    1,
    @numeroRemesa,
    @estadoInicial,
    GETDATE(),
    @userId,
    @originOfficeId
)
```

**Response (201):**
```json
{
  "id": 12346,
  "documentNumber": 1002,
  "status": "created"
}
```

---

## 🔄 4. Cambiar Estado de Remesa

### `PATCH /shipments/:id/status`

**Request:**
```json
{
  "statusCode": "ENTR",
  "deliveredTo": {
    "name": "Carlos Ruiz",
    "documentNumber": "71234567"
  },
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANS..." // Opcional
}
```

**Proceso:**

**1. Actualizar `Remesas_Paqueteria`:**
```sql
UPDATE Remesas_Paqueteria
SET 
    CATA_ESRP_Codigo = @newStatusCode,
    Fecha_Recibe = GETDATE(),
    Nombre_Recibe = @deliveredToName,
    Numero_Identificacion_Recibe = @deliveredToDocNumber,
    Firma_Recibe = @signatureBytes -- Si viene firma
WHERE ENRE_Numero = @shipmentId
```

**2. Insertar historial:**
```sql
INSERT INTO Detalle_Estados_Remesas_Paqueteria (
    EMPR_Codigo,
    ENRE_Numero,
    CATA_ESPR_Codigo,
    Fecha_Crea,
    USUA_Codigo_Crea,
    OFIC_Codigo
) VALUES (
    1,
    @shipmentId,
    @newStatusCode,
    GETDATE(),
    @userId,
    @currentOfficeId
)
```

**3. Si es estado "ENTREGADO", marcar cumplido:**
```sql
UPDATE Encabezado_Remesas
SET Cumplido = 1
WHERE Numero = @shipmentId AND @newStatusCode = @codigoEstadoEntregado
```

**Response (200):**
```json
{
  "success": true,
  "newStatus": "ENTR"
}
```

---

## 📸 5. Subir Evidencias (Etiquetas)

### `POST /shipments/:id/evidences`

**Request:**
```json
{
  "labelNumber": "ETQ-2026-001234"
}
```

**Query SQL:**
```sql
INSERT INTO Detalle_Etiquetas_Remesas_Paqueteria (
    EMPR_Codigo,
    ENRE_Numero,
    Numero_Etiqueta,
    Fecha_Crea,
    USUA_Codigo_Crea
) VALUES (
    1,
    @shipmentId,
    @labelNumber,
    GETDATE(),
    @userId
)
```

**Response (201):**
```json
{
  "success": true,
  "evidenceId": "ETQ-2026-001234"
}
```

---

## 📊 6. Historial de Estados

### `GET /shipments/:id/history`

**Query SQL:**
```sql
SELECT 
    d.ID,
    d.Fecha_Crea AS date,
    vc.Campo1 AS statusCode,
    vc.Campo2 AS statusName,
    u.Nombre AS userName,
    o.Nombre AS officeName
FROM Detalle_Estados_Remesas_Paqueteria d
LEFT JOIN Valor_Catalogos vc ON d.CATA_ESPR_Codigo = vc.Codigo
LEFT JOIN Usuarios u ON d.USUA_Codigo_Crea = u.Codigo
LEFT JOIN Oficinas o ON d.OFIC_Codigo = o.Codigo
WHERE d.ENRE_Numero = @shipmentId
ORDER BY d.Fecha_Crea DESC
```

**Response (200):**
```json
{
  "history": [
    {
      "id": 1,
      "date": "2026-02-09T14:30:00",
      "status": {
        "code": "ENTR",
        "name": "Entregado"
      },
      "user": "Juan Pérez",
      "office": "Medellín Centro"
    },
    {
      "id": 2,
      "date": "2026-02-08T10:00:00",
      "status": {
        "code": "TRAN",
        "name": "En tránsito"
      },
      "user": "María García",
      "office": "Bucaramanga"
    }
  ]
}
```

---

## 🏢 7. Catálogos

### `GET /catalogs/offices`
```sql
SELECT Codigo AS id, Nombre AS name
FROM Oficinas
WHERE Estado = 1
ORDER BY Nombre
```

### `GET /catalogs/cities`
```sql
SELECT c.Codigo AS id, c.Nombre AS name, d.Nombre AS department
FROM Ciudades c
INNER JOIN Departamentos d ON c.DEPA_Codigo = d.Codigo
WHERE c.Estado = 1
ORDER BY c.Nombre
```

### `GET /catalogs/shipment-statuses`
```sql
SELECT Codigo AS id, Campo1 AS code, Campo2 AS name
FROM Valor_Catalogos
WHERE CATA_Codigo = @codigoCatalogoEstadosRemesa
  AND Estado = 1
ORDER BY Codigo
```

**Nota:** Necesitas identificar el `CATA_Codigo` para estados de remesas consultando:
```sql
SELECT * FROM Catalogos WHERE Campo1 LIKE '%ESTADO%REMESA%'
```

---

## 📌 Códigos de Estado Comunes

Debes consultar `Valor_Catalogos` para obtener los códigos exactos, pero típicamente serían:

- **PEND** - Pendiente / Registrada
- **RECO** - Recogida
- **TRAN** - En tránsito
- **BODE** - En bodega
- **REPA** - En reparto
- **ENTR** - Entregado
- **DEVO** - Devuelto
- **CANC** - Cancelado

---

## 🔑 Notas Importantes

1. **EMPR_Codigo**: Todas las consultas deben filtrar por empresa (valor típico: `1`)

2. **Transacciones**: Las operaciones de creación/actualización deben usar transacciones SQL

3. **Firma Digital**: El campo `Firma_Recibe` es `varbinary`, convertir base64 a bytes

4. **Números Consecutivos**: Consultar `Consecutivo_Documento_Oficinas` para generar números de documento

5. **Catálogos Dinámicos**: No hardcodear estados, siempre consultar `Valor_Catalogos`

6. **Peso Volumétrico**: Calcular = (Largo × Alto × Ancho) / 5000

7. **Validaciones**:
   - Usuario habilitado y no bloqueado
   - Terceros activos (Estado = 1)
   - Ciudades y oficinas activas
   - Estados válidos según catálogo

---

## 🚀 Prioridades de Implementación

### ✅ Fase 1 (MVP)
1. `POST /auth/login`
2. `GET /shipments` (sin filtros)
3. `PATCH /shipments/:id/status` (sin firma)
4. `GET /catalogs/offices`
5. `GET /catalogs/cities`

### 📋 Fase 2
6. `POST /shipments`
7. `GET /shipments` (con filtros)
8. `POST /shipments/:id/evidences`
9. `GET /shipments/:id/history`

### 🔧 Fase 3
10. Firma digital en cambio de estado
11. Búsqueda avanzada
12. Reportes y estadísticas
