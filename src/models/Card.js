const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var cardSchema = new Schema({
  name: {type:String,required:true},
  id:{type:String,required:true},
  card_faces:Array,
  mana_cost:{type:String},
  type_line:{type:String},
  image_uris:Object
});

cardSchema.index({name:"text"})

module.exports = mongoose.model('cards',cardSchema);