const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt= require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(201).json({
          message: 'Usuario registrado'
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = (req, res) => {
  const {email, password} = req.body;

  const sql = `
    SELECT * FROM users
    WHERE email = ?
  `;
  
  db.query(sql, [email], async (err, result) => {
    if(err){
      return res.status(500).json(err);
    }
    if(result.length === 0){
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if(!validPassword){
      return res.result(401).json({
        message: 'Contraseña incorrecta'
      });
    }
     
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24hrs'
      }
    );

    res.json({
      message: 'Login exitoso',
      token
    });
  });
}