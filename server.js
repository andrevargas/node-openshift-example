#!/bin/env node

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var path = require('path');

var dbname = process.env.OPENSHIFT_APP_NAME;
var mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + dbname;

if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + dbname;
}

mongoose.connect(mongodb_connection_string);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

//Definição dos schemas
var Todo = mongoose.model('Todo', {
	   text : String
});

app.get('/api/todos', function(req, res) {
    Todo.find(function(err, todos) {
        if (err)
            res.send(err)
        res.json(todos); // return all todos in JSON format
    });
});


app.post('/api/todos', function(req, res) {
    Todo.create({
        text : req.body.text,
        done : false
    }, function(err, todo) {
        if (err)
            res.send(err);
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});

app.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
        _id : req.params.todo_id
    }, function(err, todo) {
        if (err)
            res.send(err);
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});

//Enviar o arquivo manuseado pelo Angular para qualquer requisição
app.get('*', function(req, res){
	res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(port, ipaddress, function() {
    console.log('%s: Servidor rodando em %s:%s', new Date(), ipaddress, port);
});
