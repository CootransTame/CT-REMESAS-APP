# Creación de Remesas — COOTR API

## Endpoint

```
POST /RemesaPaqueteria/Guardar
Content-Type: application/json
```

---

## Campos críticos a tener en cuenta

### 1. `RemesaUrbana`

Indica si la remesa es dentro de la **misma ciudad** (origen = destino).

| Valor | Significado |
|---|---|
| `1` | Es remesa urbana (misma ciudad) |
| `0` | No es urbana (ciudades diferentes) |

> **Regla:** Si `Remesa.Remitente.Ciudad.Codigo` == `Remesa.Destinatario.Ciudad.Codigo`, entonces `RemesaUrbana: 1`. De lo contrario `RemesaUrbana: 0`.
>
> La API **no valida automáticamente** esta consistencia. Es responsabilidad del cliente enviarla correcta.

---

### 2. `Remesa.TipoRemesa.Codigo`

Debe ir acorde con `RemesaUrbana`:

| `RemesaUrbana` | `TipoRemesa.Codigo` | Descripción |
|---|---|---|
| `1` | `8812` | Paquetería urbana |
| `0` | `8811` | Paquetería nacional |

---

### 3. `TipoEntregaRemesaPaqueteria`

Campo **obligatorio**. Debe enviarse con un código válido del catálogo.

> ⚠️ El código `6600` equivale a "sin seleccionar" y **la validación lo rechazará**.

```json
"TipoEntregaRemesaPaqueteria": { "Codigo": <codigo_valido> }
```

---

## Ejemplo: Remesa Urbana

Ciudad de origen y destino son la **misma**.

```json
{
  "RemesaUrbana": 1,
  "TipoEntregaRemesaPaqueteria": { "Codigo": 1234 },
  "Remesa": {
    "TipoRemesa": { "Codigo": 8812 },
    "Remitente": {
      "Ciudad": { "Codigo": 501 }
    },
    "Destinatario": {
      "Ciudad": { "Codigo": 501 }
    }
  }
}
```

---

## Ejemplo: Remesa Nacional

Ciudad de origen y destino son **diferentes**.

```json
{
  "RemesaUrbana": 0,
  "TipoEntregaRemesaPaqueteria": { "Codigo": 1234 },
  "Remesa": {
    "TipoRemesa": { "Codigo": 8811 },
    "Remitente": {
      "Ciudad": { "Codigo": 501 }
    },
    "Destinatario": {
      "Ciudad": { "Codigo": 763 }
    }
  }
}
```

---

## Resumen de reglas

```
Si ciudad_origen == ciudad_destino:
    RemesaUrbana        = 1
    TipoRemesa.Codigo   = 8812

Si ciudad_origen != ciudad_destino:
    RemesaUrbana        = 0
    TipoRemesa.Codigo   = 8811

TipoEntregaRemesaPaqueteria.Codigo != 6600  → siempre requerido
```
