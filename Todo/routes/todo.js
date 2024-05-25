const router = require("express").Router();
const Todo = require("../models/Todo.js");

//routes
router.post("/add/todo", (req, res) => {
    const { todo } = req.body;
    const newTodo = new Todo({ todo });

    // save the todo
    newTodo
      .save()
      .then(() => {
        console.log("Successfully added todo!");
        res.redirect("/");
      })
      .catch((err) => console.log(err));
    })

    //deleting item from todo
    .get("/delete/todo/:_id", (req, res) => {
        const{_id} = req.params;
        Todo.deleteOne({_id})
        .then(() =>{
            console.log("Deleted..");
            res.redirect("/");
        })
        .catch((err) =>console.log(err));
    });

module.exports = router;