// https://github.com/hiroshi/l10nb9t
({
  version: "0.0.1",
  // time_zones : {
  //   "PT":  -8,
  //   "JST": +9,
  // },
  // months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  getDateOfNthDay: function(year, month, day, n) {
    var first_day = new Date(year, month, 1).getDay(),
        date = 1 + 7 * (n - 1) - first_day;
    return new Date(year, month, date);
  },
  normalizeDST: function(date, start, end) {
    var dst_start = this.getDateOfNthDay(date.getFullYear(), start[0], start[1], start[2]),
        dst_end = this.getDateOfNthDay(date.getFullYear(), end[0], end[1], end[2]);
    dst_start.setHours(2);
    dst_end.setHours(2);
    return (dst_start < date && date < dst_end) ? "PDT" : "PST";
  },
  daylightSavings: {
    "US/Pacific": [[2, 0, 2], [10, 0, 1]], // Mar 2nd Sunday -  Nov 1st Sunday
    "PT": [[2, 0, 2], [10, 0, 1]],
  },
  normalizeTimeZone: function(str, date) {
    var dst = this.daylightSavings[str];
    if (dst) {
      return this.normalizeDST(new Date(date), dst[0], dst[1]);
    }
    return str;
  },
  normalizeTime: function(str) {
    var m = str.match(/(\d{1,2})\s*([AP]M)/i);
    if (m) {
      return m[1] + ":00 " + m[2];
    }
    return str;
  },
  dateString: function(date) {
    //console.log(date)
    var m = date.toString().match(/\w+ (\w+ \d{1,2}) (\d{4}) (\d{2}:\d{2}):\d{2} GMT\+\d{4} \((\w+)\)/),
      month_date = m[1],
      year = m[2],
      time = m[3],
      timezone = m[4];
    return month_date + ", " + year + " " + time + " " + timezone;
  },
  patterns: [
    { // e.g. "Sep 10, 2013 10:00 PDT"
      pattern: /(\w+\s+\d{1,2},\s+\d{4}\s+[\d:]+(?:\s+[AP]M)?)\s+(\w+(?:[-+]\d)?)/i,
      result: function(m) {
        return this.dateString(new Date(m[1] + " " + this.normalizeTimeZone(m[2])));
      }
    },
    { // e.g. "Sep 11, 2013, 4PM - 6PM US/Pacific"
      pattern: /(\w+\s+\d{1,2},\s+\d{4}),\s+(\d{1,2}\s*[AP]M|\d{1,2}:\d{2})\s*-\s*(\d{1,2}[AP]M|\d{1,2}:\d{2})\s+([\w\/]+)/i,
      result: function(m) {
        var from = new Date(m[1] + " " + this.normalizeTime(m[2]) + " " + this.normalizeTimeZone(m[4], m[1]))
        var to = new Date(m[1] + " " + this.normalizeTime(m[3]) + " " + this.normalizeTimeZone(m[4], m[1]))
        return this.dateString(from) + " - " + this.dateString(to);
      }
    },
    { // e.g. 10 miles -> 16 km
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
        try {
          node.data = text.replace(m[0], m[0] + " (" + p.result.call(this, m) + ")");
        } catch (e) {
          console.log(e);
        }
        break;
      }
    }
  },
  traverseNode: function (node) {
    //console.debug(node);
    switch (node.nodeType) {
    case 1: //ELEMENT_NODE
      this.traverseNodes(node.childNodes)
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
  traverseNodes: function(nodes) {
    var i, len = nodes.length
    for (i = 0; i < len; i++) {
      this.traverseNode(nodes[i]);
    }
  }
}).traverseNodes(document.getElementsByTagName("body"));

