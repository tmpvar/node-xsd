var sax = require('sax');
var fs  = require('fs');
var Stream = require('stream').Stream;
var xsd = {};


xsd.stringToFlatJSON = function(str, callback) {
  var ret = {};
  var errors = [];

  // if your xsd is hosed, so are you.
  var parser = sax.parser(true);

  var trail = [];
  var depth = 0;
  var pending = {};
  var lastNode = null;
  var ignore = [
    'xs:schema', // TODO: process references
    'xs:import', // TODO: fetch and process
    'xs:annotation',
    'xs:documentation'
  ];

  var pad = function() {
    var ret = '';
    var total = trail.length;
    while (total--) {
      ret += '  ';
    }
    return ret;
  }

  var parentIgnored = false;
  // Handle parser events
  parser.onopentag = function(node) {
    if (ignore.indexOf(node.name) > -1 || parentIgnored) {
      parentIgnored = true;
      return;
    }

    node = JSON.parse(JSON.stringify(node));
    var nameParts = node.name.split(':');
    var xsName = nameParts.pop();
    var prefix    = nameParts.pop();
    var name = node.name;

    if (node.attributes && node.attributes.name) {
      name     = prefix + ':' + node.attributes.name;
    }

    var currentNode = {
      type  : node.name,
      name :  name
    };

    if (node.attributes) {
      Object.keys(node.attributes).forEach(function(key) {
        // skip the name attribute as it's the key of the ret
        if (key === 'name') {
          return;
        }

        // skip the id if it's the same as the localName
        if (key === 'id' && node.attributes.name === node.attributes.id) {
          return;
        }

        currentNode[key] = node.attributes[key];
      });
      delete node.attributes;
    }

    if (trail.length === 0) {
      lastNode = currentNode
      ret[name] = lastNode;
      lastNode.derivedFrom = [];
      trail.unshift(currentNode);
    } else {
      trail.unshift(currentNode);
    }
    depth++;
  };

  parser.onclosetag = function(tagName) {
    parentIgnored = false;
    if (ignore.indexOf(tagName) > -1) {
      return;
    }
    depth--;
    if (depth<1) {
      // get rid of the root
      trail.pop();
      if (trail.length > 0) {
        lastNode.derivedFrom = trail.concat([]);
      } else {
        delete lastNode.derivedFrom;
      }
      trail = [];
      depth = 0;
    }

  }

  parser.onerror = function(err) {
    errors.push(err);
  };

  parser.onend = function() {
    callback(errors, ret);
  };

  parser.write(str).close();
};

xsd.fileToFlatJSON = function(filename, callback) {
  fs.readFile(filename, function(err, data) {
    if (!err) {
      xsd.stringToFlatJSON(data.toString(), callback);
    }
  });
};

module.exports = xsd;
