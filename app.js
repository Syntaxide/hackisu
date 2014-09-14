

var sys = require("sys"),
    express = require("express"),
    request = require("request"),
    fs = require("fs");
 

var app = express()
app.use(express.logger('dev'))
app.use(express.static(__dirname + '/public'));

var client_id = "8271c7113b570fed4c6027bf7cbfcd8c";
var out_string = null;

var simplify = function(instr) {
  var obj = JSON.parse(instr);
  var out = [];

  for(var i = 0; i < obj.length; i++) {
    var curr_obj = obj[i];

    var new_obj = {
      "title": curr_obj["title"],
      "id": curr_obj["id"],
      "artwork_url": curr_obj["artwork_url"]
    };
    out.push(new_obj);
  }
  return JSON.stringify(out);
};

app.get('/app/tracks', function(req1, res1) {

  sys.puts("enter");

  var contents = fs.readFile("songs.json", function(err, data) {
    if(err) {
      sys.puts("error:" + err);
    }


    res1.setHeader('content-type', 'text/html');
    res1.end(data);    
  });

});


app.get('/app/search/:string', function(req1, res1) {

  sys.puts("enter");
  var query = req1.params.string;

  var url = "http://api.soundcloud.com/tracks.json?client_id=" + client_id + "&q=" + query + "&limit=50";
  sys.puts(url);

  var r = request.get(
    {
      url: url,
      followRedirect: true,
      timeout: 700
    }, function(err, res, body) {

    try{
      sys.puts(body);



      res1.setHeader('content-type', 'text/html');
      res1.end(simplify(body));

    } catch (err) {
      sys.puts("error: " + err)
      res1.end("");
    }

  });


}); 

app.get('/app/tracks/:id', function(req1, res1) {

  sys.puts("enter");
  var id = req1.params.id;

  //2216557
  var url = "http://api.soundcloud.com/tracks/" + id + "/stream?client_id=" + client_id;
  var r = request.get(
    {
      url: url,
      followRedirect: false,
      timeout: 700
    }, function(err, res, body) {

    try{
      sys.puts(res.request.response.headers.location);

      res1.setHeader('content-type', 'text/html');
      res1.end(res.request.response.headers.location);
    } catch (err) {
      res1.end("");
    }

  });
});

app.listen(3000, '0.0.0.0')


