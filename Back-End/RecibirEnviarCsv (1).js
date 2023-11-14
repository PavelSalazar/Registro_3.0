const express = require('express'); 
const sql = require('mssql'); 
const fs = require('fs'); 
const dbConfig = { /* ... tu configuración de la base de datos ... */ }; // Reemplazar con la configuración de la base de datos dimas

const app = express(); 
app.use(express.json()); // Habilitar JSON

// Definir un endpoint POST para procesar archivos CSV
app.post('/cargar-notas', async (req, res) => {
  const archivo = req.body.archivo; // Obtener el nombre del archivo desde el cuerpo de la solicitud

  try {
    // Leer y procesar el archivo CSV
    let datos = await leerYProcesarCSV(archivo);
    
    // Conectar a la base de datos
    let pool = await sql.connect(dbConfig);

    // Insertar cada fila de datos válidos en la base de datos
    for (const fila of datos.validos) {
      // Preparar y ejecutar la consulta SQL para insertar los datos
      await pool.request()
        .input('identidad', sql.VarChar, fila[0]) // Establecer el valor del parámetro 'identidad'
        .input('tipoExamen', sql.Int, fila[1]) // Establecer el valor del parámetro 'tipoExamen'
        .input('nota', sql.Float, fila[2]) // Establecer el valor del parámetro 'nota'
        .query('INSERT INTO TuTabla (identidad, tipoExamen, nota) VALUES (@identidad, @tipoExamen, @nota)'); // Ejecutar la consulta SQL
    }

    // Enviar respuesta al cliente con las notas inválidas como parte de la respuesta
    res.status(201).send({ message: 'Datos insertados con éxito', notasInvalidas: datos.invalidos });
  } catch (err) {
    // Manejar cualquier error que ocurra durante el proceso
    res.status(500).send({ message: 'Error al procesar los datos', error: err.message });
  }
});

const PORT = process.env.PORT || 3000; // Configurar el puerto para el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Iniciar el servidor en el puerto especificado
});

// Función para leer y procesar el archivo CSV
async function leerYProcesarCSV(nombreArchivo) {
  let datos = {
    validos: [],
    invalidos: []
  };

  let data = fs.readFileSync(nombreArchivo, 'utf8'); // Leer el archivo sincrónicamente
  let lineas = data.split('\n'); // Dividir el contenido del archivo en líneas
  for (let linea of lineas) {
    let [identidad, tipoExamen, nota] = linea.split(','); // Separar cada línea por comas

    // Procesar y validar la identidad del estudiante
    identidad = identidad.replace(/-/g, ''); // Quitar guiones
    if (identidad.length <= 13 && /^\d+$/.test(identidad)) { // Validar la longitud y el contenido de la identidad
      tipoExamen = parseInt(tipoExamen, 10); // Convertir a entero
      nota = parseFloat(nota); // Convertir a flotante

      // Validar que el tipo de examen y la nota sean correctos
      if (tipoExamen >= 1 && tipoExamen <= 3 && !isNaN(nota)) {
        datos.validos.push([identidad, tipoExamen, nota]); // Agregar a la lista de datos válidos
      } else {
        datos.invalidos.push(linea); // Agregar a la lista de datos inválidos
      }
    } else {
      datos.invalidos.push(linea); // Agregar a la lista de datos inválidos
    }
  }
  return datos; // Devolver los datos procesados
}

