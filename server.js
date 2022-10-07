const express = require("express");
const sqlite = require("sqlite3").verbose();
const parser = require("body-parser");

const PORT = 8000;

const app = express();
const db = new sqlite.Database(__dirname + "/user");

let produtos = ['Cartão de Credito','Cartão de Débito','Previdência privada','Cheques','Título de Capitalização','Consórcio','Financiamento','Empréstimos','Seguro de Vida']


app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/static"));
app.use(parser.urlencoded());

app.get("/", (req, res) => {
      res.render("pages/index");
})

app.get("/busca", (req, res) => {
      res.render("pages/busca");
})

app.get("/cadastro", (req, res) => {
      res.render("pages/cadastro", {produtos});
})

app.get("/user", (req, res) => {
      let id = req.query["id"];

      let sql = `SELECT * FROM user WHERE id = '${id}';`;
      db.get(sql, (err, row) => {
            if (err) {
                  res.redirect("/");
            } else {
                  res.render("pages/user", { user: row });
            }
      })

})

app.get("/listar", (req, res) => {
      db.all("SELECT * FROM user;", (err, rows) => {
            if (err || rows.length == 0) {
                  res.render("pages/listar", { result: "Nenhum usuário encontrado!" });
            } else {
                  res.render("pages/listar", { result: rows });
            }
      });
})

app.get("/buscaCPF", (req, res) => {
      let cpf = req.query["cpf"];
      let sql = `SELECT * FROM user WHERE CPF LIKE '%${cpf}%';`;
      db.all(sql, (err, row) => {
            if (err || row.length == 0) {
                  res.render("pages/busca", { result: "Usuário não encontrado!", url: cpf });
            } else {
                  res.render("pages/busca", { result: row, url: cpf });
            }
      })
});


app.get("/editar", (req, res) => {
      let id = req.query["id"];
      let sql = `SELECT * FROM user WHERE id = '${id}';`;

      db.get(sql, (err, row) => {
            if (err) {
                  res.redirect("/");
            } else {
                  res.render("pages/editar", { user: row, produtos: produtos });
            }
      })
})

app.get("/remover", (req, res) => {
      let id = req.query["id"];

      let sql = `DELETE FROM user WHERE id = ${id};`;

      db.exec(sql, (err) => {
            res.redirect("/");
      });
})

app.post("/cadastro", (req, res) => {
      let { nome, cpf, genero, telefone, email, tipoConta, endereco, dataNascimento, produto } = req.body;

      let profUrl = `https://avatars.dicebear.com/api/identicon/${cpf.replace(/\.|-/g, "")}.svg`;

      let idade = getAge(dataNascimento);

      let dataCadastro = (new Date()).toLocaleDateString().replace(/\-/g, "/");
      dataNascimento = (new Date(dataNascimento)).toLocaleDateString().replace(/\-/g, "/");

      console.log(produto);

      let sql = `INSERT INTO user (profUrl, nome, cpf, idade, genero, tel, email, tipoConta, end, dataNascimento, dataCadastro, produtos) VALUES ('${profUrl}','${nome}', '${cpf}', ${idade}, '${genero}', '${telefone}', '${email}' ,'${tipoConta}', '${endereco}', '${dataNascimento}', '${dataCadastro}', '${JSON.stringify(produto)}');`
      db.exec(sql, (err) => {
            if (err) {
                  if (err.errno == 1) {
                        res.render("pages/cadastro", { error: "Usuário já existe!" })
                  }
            } else {
                  res.redirect("/");
            }
      })
})

app.post("/editar", (req, res) => {
      let id = req.query["id"];
      let { nome, cpf, genero, telefone, email, tipoConta, endereco, dataNascimento, produto } = req.body;

      let idade = getAge(dataNascimento);

      let dataCadastro = (new Date()).toLocaleDateString().replace(/\-/g, "/");
      dataNascimento = (new Date(dataNascimento)).toLocaleDateString().replace(/\-/g, "/")

      let profUrl = `https://avatars.dicebear.com/api/identicon/${cpf.replace(/\.|-/g, "")}.svg`;

      let sql = `UPDATE user SET profUrl = '${profUrl}', nome = '${nome}', cpf = '${cpf}', idade = ${idade}, genero = '${genero}', tel = '${telefone}', email = '${email}', tipoConta = '${tipoConta}', end = '${endereco}', dataNascimento = '${dataNascimento}', dataCadastro = '${dataCadastro}', produtos = '${JSON.stringify(produto)}' WHERE id = ${id}`;
      db.exec(sql, (err) => {
            if (err) {
                  res.render("pages/editar", {user: {}, err: "Erro ao editar usuário: " + err.message });
            } else {
                  res.redirect("/listar");
            }
      })
})

app.listen(PORT, () => { console.log(`Listening on http://localhost:${PORT}`) });


function getAge(dateString) {
      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      return age;
}