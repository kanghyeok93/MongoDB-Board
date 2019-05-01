var express = require('express');
var router = express.Router();
var BoardContents = require('../modelset/Schema');

var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

function authLogin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/boards');
    }
}

router.get('/',function(req,res){
    var page = req.param('page');
    if(page == null){ page = 1}

    var skipSize = (page-1)*7;
    var limitSize = 7;
    var pageNum = 1;

    BoardContents.count({deleted:false},function(err,totalCount){
       if(err)throw err;

       pageNum = Math.ceil(totalCount/limitSize);
       BoardContents.find({deleted:false}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err,result){
            if(err) throw err;
            if(req.user){
                res.render('board',{title : "Board",contents:result, pagination:pageNum });
            }else{
                res.render('board',{title : "Board",contents:result, pagination:pageNum });
            }
       });
    });
});

router.post('/',function(req,res){
   var mode = req.param('mode');

   var addNewTitle = req.body.addSubject;
   var addNewWriter = req.body.addWriter;
   var addNewContents = req.body.addContents;
   var addNewPassword = req.body.addPassword;

   var modTitle = req.body.modContentSubject;
   var modContent = req.body.modContents;
   var modId = req.body.modId;

   if(mode == 'add'){
       addBoard(addNewTitle,addNewWriter,addNewContents,addNewPassword);
       res.redirect('/boards');
   }else{
       modBoard(modId,modTitle,modContent);
       res.redirect('/boards');
   }

});

router.get('/view',function(req,res){

    var contentId = req.param('id');

    BoardContents.findOne({ _id : contentId},function(err,result){
       if(err) throw err;
       result.count += 1;

       var reply_page = Math.ceil(result.comments.length / 3);
       result.save(function(err){
           if(err) throw err;

           res.render('boardDetail',{title : "Board" , content : result , replyPage : reply_page});
       })
    });

});

router.get('/password',function(req,res){
  var id = req.param('id');

  BoardContents.findOne({_id : id},function(err,result){
     if(err) throw err;
     res.send(result.password);
  });
});

router.get('/delete',function(req,res){
    var contentId = req.param('id');

    BoardContents.update({ _id : contentId },{$set : {deleted : true}},function(err){
        if(err) throw err;
        res.redirect('/boards');
    });
});

router.get('/search',function(req,res){
    var search_word = req.param('searchWord');
    var searchCondition = { $regex : search_word };

    var page = req.param('page');
    if(page == null) {page = 1;}
    var skipSize = (page-1)*7;
    var limitSize = 7;
    var pageNum = 1;

    BoardContents.count({deleted:false, $or:[{title:searchCondition},{contents:searchCondition},{writer:searchCondition}]},function(err, searchCount){
        if(err) throw err;
        pageNum = Math.ceil(searchCount/limitSize);

        BoardContents.find({deleted:false, $or:[{title:searchCondition},{contents:searchCondition},{writer:searchCondition}]}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err, result) {
            if (err) throw err;

            res.render('board', {title: "Board", contents: result, pagination: pageNum});
        });
    })
});

router.post('/reply',function(req,res){
    var reply_writer = req.body.replyWriter;
    var reply_comment = req.body.replyComment;
    var reply_id = req.body.replyId;

    addComment(reply_id, reply_writer, reply_comment);

    res.redirect('/boards/view?id='+reply_id);
});

router.get('/reply',function(req,res){
   var id = req.param('id');
   var page = req.param('page');
   var skipSize = (page-1) * 3;
   var limitSize = 3;

   BoardContents.findOne({_id : id},{ comments : { $slice : [skipSize, limitSize]}},function(err,result){
       if(err) throw err;
       res.send(result.comments);
   })
});

module.exports = router;

// 게시판 DB저장 함수
function addBoard(title,writer,content,password){
    var newBoardContents = new BoardContents;

    newBoardContents.title = title;
    newBoardContents.writer = writer;
    newBoardContents.contents = content;
    newBoardContents.password = password;

    newBoardContents.save(function(err){
        if(err) throw err;
    });

}

// 게시판 DB수정 함수
function modBoard(id,title,content){

    BoardContents.findOne({_id : id},function(err,result){
        if(err) throw err;
        result.updated.push({title : result.title, contents : result.contents});
        result.save(function(err){
            if(err) throw err;
        });
    });

    BoardContents.update({_id : id},{$set : { title : title, contents : content }}, function(err){
       if(err) throw err;
    });
}

// 댓글 저장 함수
function addComment(id,writer,comment){
    BoardContents.findOne({_id : id},function(err,result){
       if(err) throw err;

       result.comments.unshift({name : writer, memo : comment});
       result.save(function(err){
           if(err) throw err;
       });
    });
}
