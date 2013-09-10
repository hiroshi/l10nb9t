(function () {
  // var time_zones = {
  //   "PT":  -8,
  //   "JST": +9,
  // };
  var search_time = function(node) {
    var text = node.data, match = null;
    match = text.match(/\w+\s+\d{1,2},\s+\d{4}\s+\d{2}:\d{2}\s+\w+/)
    if (match) {
      console.debug(match);
      date = new Date(match[0])
      node.data = text.replace(match[0], match[0] + " (" + date + ")");
    }
    //match = node.data.match(/(\d{1,2})\s+(AM|PM)\s+(\w+)/i);
  };
  var traverse_node = function (node) {
    //console.debug(node);
    switch (node.nodeType) {
    case 1: //ELEMENT_NODE
      traverse_nodes(node.childNodes)
      break;
      // case 2: //ATTRIBUTE_NODE
      //   break;
    case 3: //TEXT_NODE
      search_time(node);
      break;
      // case 4: //CDATA_SECTION_NODE
      //   break;
      // case 5: //ENTITY_REFERENCE_NODE
      //   break;
      // case 6: //ENTITY_NODE
      //   break;
      // case 7: //PROCESSING_INSTRUCTION_NODE
      //   break;
      // case 8: //COMMENT_NODE
      //   break;
      // case 9: //DOCUMENT_NODE
      //   break;
      // case 10: //DOCUMENT_TYPE_NODE
      //   break;
      // case 11: //DOCUMENT_FRAGMENT_NODE
      //   break;
      // case 12: //NOTATION_NODE
      //     break;
    }
  }
  var traverse_nodes = function(nodes) {
    var i, len = nodes.length
    for (i = 0; i < len; i++) {
      traverse_node(nodes[i]);
    }
  }
  traverse_nodes(document.getElementsByTagName("body"));
})();
