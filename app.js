const express = require('express');
const fileupload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { Server } = require('http');
var parse = require('csv-parse');
//var march;
//var parser = parse({columns: true});

//march=fs.createReadStream(__dirname+'/public/csv/march_21_calc.csv').pipe(parser);
//const fileContent = fs.readFile(__dirname+'/public/csv/march_21_calc.csv');
    //const records = parse(fileContent, {columns: true});
    //console.log(records);
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const app = express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, '../solar'))

app.use(express.static('public'));

function jsonReader(savePath, cb) {
    fs.readFile(savePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch(err) {
            return cb && cb(err)
        }
    })
}

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp'),
    createParentPath: true,
    limits: {fileSize: 5*1024*1024}
}))

app.get('/',async(req,res,next)=>{
    res.render('views/index');
});

app.post('/single', async(req,res,next)=>{
    try {

        res.setHeader('Content-Type', 'text/html');
        const file = req.files.mfile;
        // console.log(file.name);
        const fileName = "BUILDINGFILE"+path.extname(file.name);
        const savePath = path.join(__dirname,'public','uploads',fileName);
        if(file.truncated){
            res.write("<style>body{font-family: sans-serif; text-align:center;}</style><h1>File is more than 5MB</br></h1>");
            res.write("<form action=\"/\" method=\"GET\"> <input type=\"submit\" value=\"Go Back\"/> </form>");
            return;
            // throw new Error('File size is more than 5MB');
        }
        if(file.mimetype != 'application/json'){
            res.write("<style>body{font-family: sans-serif; text-align:center;}</style><h1>Please Upload JSON File Only</br></h1>");
            res.write("<form action=\"/\" method=\"GET\"> <input type=\"submit\" value=\"Go Back\"/> </form>")
            return;
            // throw new Error('File is not JSON file');
        }
        await file.mv(savePath);
        res.redirect('/details');
    } catch (error) {
        res.send("Error uploading file");
        console.log(error);
        return
    }
});
app.get('/details',async(req,res,next)=>{
    res.setHeader('Content-Type','text/html');
    res.header("<title>Visualization</title> <link rel=\"apple-touch-icon\ sizes=\"180x180\" href=\"/favicon_package_v0.16/apple-touch-icon.png\">    <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/favicon_package_v0.16/favicon-32x32.png\"><link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicon_package_v0.16/favicon-16x16.png\"><link rel=\"manifest\" href=\"/favicon_package_v0.16/site.webmanifest\"><link rel=\"mask-icon\" href=\"/favicon_package_v0.16/safari-pinned-tab.svg\" color=\"#5bbad5\"><meta name=\"msapplication-TileColor\" content=\"#da532c\"><meta name=\"theme-color\" content=\"#ffffff\"></meta>");
    jsonReader('./public/uploads/BUILDINGFILE.json', (err, buildings) => {
        if (err) {
            console.log(err)
            return
        }
        var p = buildings.features;
        res.write("<form action=\"/3DView\" method=\"get\"></br></br><style>body{font-family: sans-serif; text-align:center;}</style><h1>Type : "+buildings.type+"</br></h1>");
        if(buildings.name != null){
            res.write("<style>body{font-family: sans-serif; text-align:center;}</style><h1>Name : "+buildings.name+"</br></h1>");
        }
        if(buildings.crs != null){
            res.write("<style>body{font-family: sans-serif; text-align:center;}</style><h1>Coordinate Reference System : "+buildings.crs.properties.name+"</br></h1>");
        }
        res.write("<style>body{font-family: sans-serif; text-align:center;}</style><h1>Total "+(buildings.name != null ? buildings.name : "Object")+" : "+p.length+"</br></h1>");
        res.write("<style>body{font-family: sans-serif; text-align:center;}</style><h1>Choose height attribute ");
        res.write("<form action=\"/3DView\" method=\"get\"><style>body{font-family: sans-serif;}</style><h1>Choose Height Attribute:      <select style='font-size:30px;' id='mytext' name=\"heightAttr\"></h1>");
        
        for(var i in p[0].properties){
            res.write("<option style='border:solid 3px rgba(0,0,0,0.8); display:block; font-size:20px; text-decoration:none; font-family:'SlateStd-Bk', 'Lucida Grande', 'Lucida Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'; '>"+i+"</option>");
        }
        res.write("</select>");
        res.write("</br></br></br><style>.suggest-artist__link:hover {background-color: rgb(64, 115, 131);}</style><input class='suggest-artist__link' style='border:solid 4px rgba(0,0,0,0.8); padding:10px 600px 10px; text-align:center; display:block; font-size:30px; text-decoration:none; font-family:'SlateStd-Bk', 'Lucida Grande', 'Lucida Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'; ' type=\"submit\" value=\"Visualize\"/> </form>")
    })
})
app.get('/3DView',async(req,res,next)=>{
    var a = req.param('heightAttr');
    res.render('views/3DView',{heightAttr : a});
});
app.get('/analyze',async(req,res,next)=>{
    res.render('views/analyze');
});

app.get('/21march',async(req,res,next)=>{
    res.render('views/21march');
});
app.get('/21june',async(req,res,next)=>{
    res.render('views/21june');
});
app.get('/21september',async(req,res,next)=>{
    res.render('views/21september');
});
app.get('/21december',async(req,res,next)=>{
    res.render('views/21december');
});
app.get('/sunrise',async(req,res,next)=>{
    res.render('views/sunrise');
});
app.get('/6:00AM',async(req,res,next)=>{
    res.render('views/6');
});
app.get('/7:00AM',async(req,res,next)=>{
    res.render('views/7');
});
app.get('/8:00AM',async(req,res,next)=>{
    res.render('views/8');
});
app.get('/9:00AM',async(req,res,next)=>{
    res.render('views/9');
});
app.get('/10:00AM',async(req,res,next)=>{
    res.render('views/10');
});
app.get('/11:00AM',async(req,res,next)=>{
    res.render('views/11');
});
app.get('/12:00PM',async(req,res,next)=>{
    res.render('views/12');
});
app.get('/1:00PM',async(req,res,next)=>{
    res.render('views/13');
});
app.get('/2:00PM',async(req,res,next)=>{
    res.render('views/14');
});
app.get('/3:00PM',async(req,res,next)=>{
    res.render('views/15');
});
app.get('/4:00PM',async(req,res,next)=>{
    res.render('views/16');
});
app.get('/5:00PM',async(req,res,next)=>{
    res.render('views/17');
});
app.get('/6:00PM',async(req,res,next)=>{
    res.render('views/18');
});
app.get('/march_sunset',async(req,res,next)=>{
    res.render('views/m_ss');
});
app.get('/j_sr',async(req,res,next)=>{
    res.render('views/j_sr');
});
app.get('/j_ss',async(req,res,next)=>{
    res.render('views/j_ss');
});
app.get('/j_6',async(req,res,next)=>{
    res.render('views/j_6');
});
app.get('/j_7',async(req,res,next)=>{
    res.render('views/j_7');
});
app.get('/j_8',async(req,res,next)=>{
    res.render('views/j_8');
});
app.get('/j_9',async(req,res,next)=>{
    res.render('views/j_9');
});
app.get('/j_10',async(req,res,next)=>{
    res.render('views/j_10');
});
app.get('/j_11',async(req,res,next)=>{
    res.render('views/j_11');
});
app.get('/j_12',async(req,res,next)=>{
    res.render('views/j_12');
});
app.get('/j_13',async(req,res,next)=>{
    res.render('views/j_13');
});
app.get('/j_14',async(req,res,next)=>{
    res.render('views/j_14');
});
app.get('/j_15',async(req,res,next)=>{
    res.render('views/j_15');
});
app.get('/j_16',async(req,res,next)=>{
    res.render('views/j_16');
});
app.get('/j_17',async(req,res,next)=>{
    res.render('views/j_17');
});
app.get('/j_18',async(req,res,next)=>{
    res.render('views/j_18');
});
app.get('/s_sr',async(req,res,next)=>{
    res.render('views/s_sr');
});
app.get('/s_ss',async(req,res,next)=>{
    res.render('views/s_ss');
});
app.get('/s_6',async(req,res,next)=>{
    res.render('views/s_6');
});
app.get('/s_7',async(req,res,next)=>{
    res.render('views/s_7');
});
app.get('/s_8',async(req,res,next)=>{
    res.render('views/s_8');
});
app.get('/s_9',async(req,res,next)=>{
    res.render('views/s_9');
});
app.get('/s_10',async(req,res,next)=>{
    res.render('views/s_10');
});
app.get('/s_11',async(req,res,next)=>{
    res.render('views/s_11');
});
app.get('/s_12',async(req,res,next)=>{
    res.render('views/s_12');
});
app.get('/s_13',async(req,res,next)=>{
    res.render('views/s_13');
});
app.get('/s_14',async(req,res,next)=>{
    res.render('views/s_14');
});
app.get('/s_15',async(req,res,next)=>{
    res.render('views/s_15');
});
app.get('/s_16',async(req,res,next)=>{
    res.render('views/s_16');
});
app.get('/s_17',async(req,res,next)=>{
    res.render('views/s_17');
});
app.get('/s_18',async(req,res,next)=>{
    res.render('views/s_18');
});
app.get('/d_sr',async(req,res,next)=>{
    res.render('views/d_sr');
});
app.get('/d_ss',async(req,res,next)=>{
    res.render('views/s_ss');
});
app.get('/d_6',async(req,res,next)=>{
    res.render('views/d_6');
});
app.get('/d_7',async(req,res,next)=>{
    res.render('views/d_7');
});
app.get('/d_7',async(req,res,next)=>{
    res.render('views/d_7');
});
app.get('/d_8',async(req,res,next)=>{
    res.render('views/d_8');
});
app.get('/d_9',async(req,res,next)=>{
    res.render('views/d_9');
});
app.get('/d_10',async(req,res,next)=>{
    res.render('views/d_10');
});
app.get('/d_11',async(req,res,next)=>{
    res.render('views/d_11');
});
app.get('/d_12',async(req,res,next)=>{
    res.render('views/d_12');
});
app.get('/d_13',async(req,res,next)=>{
    res.render('views/d_13');
});
app.get('/d_14',async(req,res,next)=>{
    res.render('views/d_14');
});
app.get('/d_15',async(req,res,next)=>{
    res.render('views/d_15');
});1
app.get('/d_16',async(req,res,next)=>{
    res.render('views/d_16');
});
app.get('/d_17',async(req,res,next)=>{
    res.render('views/d_17');
});
app.get('/d_18',async(req,res,next)=>{
    res.render('views/d_18');
});
app.listen(3000,()=>{
    console.log("Server on port : 3000");
});