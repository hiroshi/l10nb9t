// https://github.com/hiroshi/l10nb9t
({
  version: "0.0.1",
  // time_zones : {
  //   "PT":  -8,
  //   "JST": +9,
  // },
  // months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  patterns: [
    {
      pattern: /\w+\s+\d{1,2},\s+\d{4}\s+\d{2}:\d{2}\s+\w+/,
      result: function(match) {
        var d = new Date(match[0]),
            m = d.toString().match(/\w+ (\w+ \d{1,2}) (\d{4}) (\d{2}:\d{2}):\d{2} GMT\+\d{4} \((\w+)\)/),
            month_date = m[1],
            year = m[2],
            time = m[3],
            timezone = m[4];
        return month_date + ", " + year + " " + time + " " + timezone;
      }
    },
    {
      pattern: /(\d+)\s*miles?/i,
      result: function(match) {
        return (match[1] * 1.60935).toFixed(0) + " km";
      }
    }
  ],
  search: function(node) {
    var text = node.data, len = this.patterns.length, i, m, p;
    for (i = 0; i < len; i++) {
      p = this.patterns[i];
      m = text.match(p.pattern);
      if (m) {
        node.data = text.replace(m[0], m[0] + " (" + p.result(m) + ")");
        break;
      }
    }
  },
  traverse_node: function (node) {
    //console.debug(node);
    switch (node.nodeType) {
    case 1: //ELEMENT_NODE
      this.traverse_nodes(node.childNodes)
      break;
      // case 2: //ATTRIBUTE_NODE
      //   break;
    case 3: //TEXT_NODE
      this.search(node);
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
  },
  traverse_nodes: function(nodes) {
    var i, len = nodes.length
    for (i = 0; i < len; i++) {
      this.traverse_node(nodes[i]);
    }
  }
}).traverse_nodes(document.getElementsByTagName("body"));

