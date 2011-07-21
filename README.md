# node-xsd

Some tools for working with xsd's

## install

`npm install xsd`

## usage

### Command line

`invertxsd path/to/local.xsd`

the result is json being pumped into your stdout

#### example

  XMLSchema:
  in: https://github.com/tmpvar/node-xsd/blob/master/files/XMLSchema.xsd
 out: https://github.com/tmpvar/node-xsd/blob/master/files/XMLSchema.flattened.json


### Programmatically

    var xsd = require('xsd');
    var fs  = require('fs');
    var str = fs.readFileSync('/path/file.xsd').toString();
    var json = xsd.stringToFlatJSON(str, function(errors, obj {
      // do stuff with the object.
    });

    // or

    var json2 = xsd.fileToFlatJSON('/path/file.xsd', function(errors, obj) {

    });




