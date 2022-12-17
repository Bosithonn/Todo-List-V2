

const express = require("express");
const bodyParser = require("body-parser");

const mongoose  = require("mongoose")
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
const itemsSchema = new mongoose.Schema({
     name: String,

})
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "lol who are you "
})
const item2 = new Item({
  name: "lol who you "
})
const item3 = new Item({
  name: "lol  are you "
})
const defaultItems = [item1,item2,item3];

const listSchemaa = {
  name: String,
  items: [itemsSchema]

}
const List = mongoose.model("List",listSchemaa)



const workItems = [];

app.get("/", function(req, res) {


Item.find(function(err,items){
  if (items.length === 0 ){
    Item.insertMany(defaultItems,function(err){
  if (err){
    console.log(err)
  }else{
    console.log("You are lucky man congrutulations!")
  }
})
res.redirect("/")
  }else{
    res.render("list", {listTitle: "Today", newListItems: items});
  }
  
  
})


});
app.get("/:customListName",function(req,res){
  const customListName =  _.capitalize(req.params.customListName)
  
 
List.findOne({name: customListName},function(err,items){
if (!err){
  if (!items){
     const list = new List({
    name: customListName,
    items: defaultItems
  })
  list.save();
  res.redirect("/" + customListName)

}else{
 res.render("list",{listTitle: items.name, newListItems: items.items})
}
}
})

  
})

app.post("/", function(req, res){

  const itemName =  req.body.newItem;
  const listName = req.body.list;
  const item = new  Item({
    name: itemName 
  })
  if (listName === "Today"){
     item.save()
     res.redirect("/")
  }else{
    List.findOne({name: listName},function(err,foundlist){
      foundlist.items.push(item)
      foundlist.save();
      res.redirect("/" + listName)
    })
  }
 

});
app.post("/delete",function(req,res){
   const checkedItemId = req.body.checkbox
   const listName  = req.body.listName
   if (listName == 'Today'){
       Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
      console.log(err)

    }else {
      console.log("Success man you are lucky")
      res.redirect("/")
    }
   })
   }else{
     List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if (!err){
        res.redirect("/" + listName)
      }
     })
   }

})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
  
const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;
  console.log(`Express is working on port ${port}`);
});