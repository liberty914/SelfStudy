var express = require('express');
var app = express();
var Waterline = require('waterline');
var sailsMongoAdapter = require('sails-mongo');
var orm = new Waterline();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

var userCollection = Waterline.Collection.extend({
  identity: 'user',
  connection: 'default',
  migrate: 'safe',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    firstname: {type: 'string', required: true},
    lastname:  {type: 'string', required: true},
    sex:       {type: 'string', enum: ['male', 'female']},
    password:  {type: 'string', minLength: 6, required: true},
    fullname:  function(){ return this.firstname + ' ' + this.lastname; },
    toJSON:    function(){ var obj = this.toObject(); delete obj.password; return obj; },
    // Add a reference to Pets
    pets: {
      collection: 'pet',
      via: 'owner'
    }
},

beforeCreate: function(values, next){
  bcrypt.hash(values.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    values.password = hash;
    next();
  });
}
});

var petCollection = Waterline.Collection.extend({
  identity: 'pet',
  connection: 'default',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    breed: 'string',
    type: 'string',
    name: 'string',
    // Add a reference to User
    owner: {
      model: 'user'
    }
}
});
orm.loadCollection(userCollection);
orm.loadCollection(petCollection);

var config = {
  adapters: {
    'default': 'mongo',
    'mongo': require('sails-mongo')
  },

  connections: {
    default: {
      adapter: 'mongo',
      url: "mongodb://localhost:27017/test"
    }
  }
};
orm.initialize(config, function(err, data) {
  if (err) {
    throw err;
  }
  app.models = data.collections;
  app.connections = data.connections;

// Tease out fully initialised models.
var User = data.collections.user;
var Pet  = data.collections.pet;
});


app.post('/user', function(req, res){
  app.models.user.create(req.body, function(err, model){
    if(err) return res.json({err: err}, 500);
    console.log("full name: " + model.fullname());
    return res.json(model);
  });
});

app.get('/user',function(req, res){
  app.models.user.find()
  .populate('pets')
  .exec(function(err, users){
    if(err) return res.json({err: err}, 500);
    return res.json(users);
  });
});
var server = app.listen(9000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});