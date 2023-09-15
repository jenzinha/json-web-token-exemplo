// JWT
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
var { expressjwt: expressJWT } = require("express-jwt");
const cors = require('cors');

var cookieParser = require('cookie-parser')

const express = require('express');
const { usuario } = require('./models');

const app = express();

app.set('view engine', 'ejs');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(cookieParser());
app.use(
  expressJWT({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    getToken: req => req.cookies.token
  }).unless({ path: ["/autenticar", "/logar", "/deslogar", "/usuarios/cadastrar", "/usuarios/listar"] })
);

//rotas de acesso
app.get('/autenticar', async function(req, res){
  res.render('autenticar');
})

app.get('/', async function(req, res){
  res.render("home")
})

app.get('/usuarios/cadastrar', async function(req, res){
  res.render('cadastro');
})

app.get('/usuarios/listar', async function(req, res){
  let usuarios = await usuario.findAll()
  res.render('listar', { usuarios })
})


// rotas de evento

app.post('/logar', (req, res) => {
  if(req.body.usuario === "picolo@teste" && req.body.senha === "123" || req.body.usuario === "felipe@teste" && req.body.senha === "123" ){
    const id = '1'
    const token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 300
    })
    res.cookie('token', token, { httpOnly: true })
    res.redirect('/usuarios/listar')
  }
  res.status(500).json({ mensagem: "login Inválido" })
})

app.post('/deslogar', function(req, res) {
  res.cookie('token', null, { httpOnly: true })
  res.json({
    deslogado: true
  })
  res.redirect('/autenticar')
})

app.get('/usuarios/listar', async function(req, res){
  try {
    var usuarios  = await usuario.findAll();
    res.render('listar', { usuarios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ocorreu um erro ao buscar os usuário.' });
  }
})

app.post('/usuarios/cadastrar', async function(req, res){

  if(req.body.senha === req.body.senhacf){
    let usuario = req.body
    usuario.senha = req.body.senha

    await usuario.create(usuario);
    console.log('usuario cadastrado com sucesso')
  }else{
    console.log('usuario não cadastrado tente novamente')
  }
  res.redirect('/usuarios/listar')
  
})

app.listen(3000, function() {
  console.log('App de Exemplo escutando na porta 3000!')
});