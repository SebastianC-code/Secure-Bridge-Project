const express = require('express');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); 

// Cargar variables del archivo .env
dotenv.config();


const app = express();
app.use(express.json()); // Para que el servidor entienda formato JSON

const PORT = process.env.PORT || 3000;

////////////////////////////////////////////////////////////////
//Configuracion sql server
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // true para Azure, false para local usualmente
    trustServerCertificate: true // Necesario para desarrollo local
  }
};

// Función para conectar a la DB
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("✅ Conectado a SQL Server");
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
}

// Función para conectar a la DB
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("✅ Conectado a SQL Server");
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
}

// Simulamos una base de datos de usuarios
//const users = [];
///////////////////////////////////////////////////////////////


app.get('/', (req, res) => {
  res.send('¡Servidor funcionando y listo para la autenticación!');
});


//////////////////////SQL SERVER function
connectDB();


///////////////////////////////////////////////////////
//  RUTA DE REGISTRO (Para crear un usuario con un ROL)
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 1. Cifrar la contraseña (Hacer el Hash)
    const salt = await bcrypt.genSalt(10); // Crea una semilla aleatoria
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Crear el nuevo usuario
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: role || 'user' // Si no envían rol, por defecto es 'user'
    };

    users.push(newUser);
    res.status(201).json({ message: "Usuario registrado con éxito", user: username, role: newUser.role });
    console.log("Usuarios en 'Base de Datos':", users);
    
  }

  catch (error) {
    res.status(500).send("Error al registrar");
  }
});
/////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////
//RUTA DE LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
// 1. Buscar al usuario por su nombre
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "Usuario no encontrado" });
  }

  // 2. Comparar la contraseña enviada con el Hash guardado
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Contraseña incorrecta" });
  }

  // 3. Si todo es correcto, crear el TOKEN
  // Guardamos el ID y el ROL dentro del token
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' } // El token expira en 1 hora
  );

  // 4. Enviar el token al cliente
  res.json({
    message: "Login exitoso",
    token: token
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});