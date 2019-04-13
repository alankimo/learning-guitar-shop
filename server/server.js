//1. Importaciones
const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
const mongoose = require('mongoose')

const port = process.env.PORT || 3002
/*
const { auth } = require('./middleware/auth')
const { Brand } = require('./models/brand')
const { admin } = require('./middleware/admin')
const { Wood } = require('./models/wood')
require('dotenv').config()
*/

require('dotenv').config()

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useCreateIndex: true}, (err) => {
    if(err) return err
    console.log("Conectado a MongoDB")
})

// Middleware
//urlencoded sirve para leer los query params
app.use(express.urlencoded({extended: true}))

//para leer los json sin problemas
app.use(express.json())

// Para meter cookies en el server
app.use(cookieParser())

const { User } = require('./models/user')

// Rutas
app.post('/api/users/register', (req,res) => {
	console.log(req.body);
	const user = new User(req.body)
	
	user.save((err,doc)=>{
		console.log("doc: ", doc)
		if(err) return res.json({
			success:false, err
		})

		res.status(200).json({
			success: true,
			userdata: doc
		})

	})
})

app.post('/api/users/login', (req, res) => {
	// 1. Encuentra el correo
	User.findOne({'email': req.body.email}, (err,user) => {
		if(err) return res.send(err)
		if(!user) return res.json({loginSuccess: false, message: 'Auth fallida, email no encontrado'})

		// 2. Obtén el password y compruébalo
			user.comparePassword(req.body.password, (err, isMatch) => {
				if(!isMatch) return res.json({
					loginSuccess: false, message: "Password erróneo"
				})
			})

		// 3. Si todo es correcto, genera un token
		user.generateToken((err, user)=> {
			if(err) return res.status(400).send(err)
			// Si todo bien, debemos guardar este token como un "cookie"
			res.cookie('guitarshop_auth', user.token).status(200).json(
				{
					loginSuccess: true
				}
			)
		})
	})
})


// 5. Listeners
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})