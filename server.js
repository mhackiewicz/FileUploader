    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var Jimp = require("jimp");
    var fs = require("fs")
    var http = require("http");
    var os = require("os");
    var path = require('path');
    //var rmdir = require('rmdir');
    var timeout = require('connect-timeout');

    var exec = require('child_process').exec;

    app.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    //app.use(timeout('5s'));
   // app.use(express.static('./index.html'));
   app.use(express.static('public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function(req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    });
    var upload = multer({
        storage: storage
    }).single('file');
    app.get('/sysinfo', function(req, res) {
        res.json({
            hostname: os.hostname(),
            platform: os.platform(),
            interfaces: os.networkInterfaces(),
            release: os.release()
        })
    });
    app.get('/hello', function(req, res) {
        res.json({
            string: "hello world"
        })
    });
    app.post('/upload', function(req, res) {
        upload(req, res, function(err) {
            if (err) {
                res.json({
                    error_code: 1,
                    err_desc: err
                });
                return;
            }
            var modeTable = req.body.mode,
                prefix = "";
            if (modeTable.length > 0) {
                Jimp.read("./uploads/" + req.file.filename, function(err, image) {
                    if (err) {
                        return;
                    }
                    if (req.body.mode.indexOf("1") !== -1) {
                        image.rotate(90);
                        prefix += "_ROTATE90";
                    }
                    if (req.body.mode.indexOf("2") !== -1) {
                        image.rotate(180);
                        prefix += "_ROTATE180";
                    }
                    if (req.body.mode.indexOf("3") !== -1) {
                        image.sepia();
                        prefix += "_SEPHIA";
                    }
                    if (req.body.mode.indexOf("4") !== -1) {
                        image.gaussian(2);
                        prefix += "_GAUSSE";
                    }
                    if (req.body.mode.indexOf("5") !== -1) {
                        image.greyscale();
                        prefix += "_GREYSCALE";
                    }
                    if (req.body.mode.indexOf("6") !== -1) {
                        image.invert();
                        prefix += "_INVERT";
                    }
                    var newFileName = changeFileName(prefix, req.file.filename);
                    image.write(req.file.destination + newFileName, function() {
                        fs.readFile("./uploads/" + newFileName, function(err, data) {
                            if (err) throw err;
                            exec('rm -rf ' + __dirname + '/uploads/' + newFileName, function(err, stdout, stderr) {
                                //console.log( 'all files are removed' );
                            });
                            exec('rm -rf ' + __dirname + '/uploads/' + req.file.filename, function(err, stdout, stderr) {
                                //console.log( 'all files are removed' );
                            });
                            res.writeHead(200, {
                                'Content-Type': 'text/html'
                            });
                            res.end(new Buffer(data).toString('base64'));                                                
                        });
                    });
                });
            }
            // res.json({
            //     error_code: 0,
            //     err_desc: null
            // });
        });
    });
    var port = process.env.PORT || 8080;
    app.listen(port, function() {
        console.log('Server wystartowal....');
		exec('mkdir ' + __dirname + '/uploads', function(err, stdout, stderr) {
				console.log("folder uploads utworzony");
        });
    });

    function changeFileName(prefix, filename) {
        var tmpName = filename.split(".")[0];
        var tmpType = filename.split(".")[1];
        var newFileName = tmpName + prefix + "." + tmpType;
        return newFileName;
    }