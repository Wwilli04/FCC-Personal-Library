'use strict';

require('dotenv').config();
const mongoose = require("mongoose");
const crypto = require("crypto");

module.exports = function (app) {

  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })

  const bookSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    comments: {
      type: Array,
      required: true
    }
  })

  const Book = new mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, (error, data) => {
        if (error) {
          return console.error(error);
        }

        var response = []

        for (let i = 0; i < data.length; i++) {
          response.push({
            _id: data[i]._id,
            title: data[i].title,
            commentcount: data[i].comments.length
          });
        }

        console.log(response)

        res.send(response);
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      let title = req.body.title;

      if (!title) {
        res.send("missing required field title");
        return
      }

      var newBook = new Book({
        _id: crypto.randomBytes(16).toString('hex'),
        title,
        comments: []
      })

      console.log(newBook);

      newBook.save((error, data) => {
        if (error) {
          return console.error(error);
        }
        res.json(data);
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, (error, data) => {
        if (error) {
          return console.error(error);
        }

        res.send("complete delete successful")
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      Book.findById(bookid, (error, data) => {
        if (error) {
          return console.error(error);
        }

        if (!data) {
          res.send("no book exists");
          return
        }

        res.json(data);
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        res.send("missing required field comment");
        return
      }

      Book.findById(bookid, (error, data) => {
        if (error) {
          return console.error(error);
        }

        if (!data) {
          res.send("no book exists");
          return
        }

        data.comments.push(comment);

        data.save((error, newData) => {
          if (error) {
            return console.error(error);
          }
          res.json(newData);
        })
      })

      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      Book.findOneAndDelete({ _id: bookid }, (error, data) => {
        if (error) {
          return console.error(error);
        }

        if (!data) {
          res.send("no book exists");
          return
        }

        res.send("delete successful");
      })
      //if successful response will be 'delete successful'
    });
  
};
