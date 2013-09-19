// https://github.com/hiroshi/l10nb9t
(function(global) {
  // common
  function each(array, callback) {
    var i, len = array.length;
    for (i = 0; i < len; i++) {
      if (callback(array[i], i) === false) {
        break;
      }
    }
  }
  // UnitPattern
  function UnitPattern(regexp, factor, unit) {
    return {
      pattern: new RegExp(/(?:^|\s+)(\d+[\d,.]*)\s*/.source + regexp.source + /\b/.source),
      result: function(match) {
        return "~" + (match[1] * factor).toFixed(2) + " " + unit;
      }
    };
  }
  // DatePattern helpers
  var daylightSavings = {
    "US/Pacific": [[2, 0, 2], [10, 0, 1]], // Mar 2nd Sunday -  Nov 1st Sunday
    "PT": [[2, 0, 2], [10, 0, 1]],
  };
  var rr = {
    "date": /(\w+\s+\d{1,2}\s*,?\s*\d{4}),?/,
    "time": /([\d:]+(?:\s*[AP]M)?)/,
    "tz": /([\w\/]+(?:[-+]\d)?)/
  };
  function dateString(date) {
    var m = date.toString().match(/\w+ (\w+ \d{1,2}) (\d{4}) (\d{2}:\d{2}):\d{2} GMT\+\d{4} \((\w+)\)/),
    month_date = m[1],
    year = m[2],
    time = m[3],
    timezone = m[4];
    return month_date + ", " + year + " " + time + " " + timezone;
  }
  function getDateOfNthDay(year, month, day, n) {
    var first_day = new Date(year, month, 1).getDay(),
    date = 1 + 7 * (n - 1) - first_day;
    return new Date(year, month, date);
  }
  function normalizeDST(date, start, end) {
    var dst_start = getDateOfNthDay(date.getFullYear(), start[0], start[1], start[2]),
    dst_end = getDateOfNthDay(date.getFullYear(), end[0], end[1], end[2]);
    dst_start.setHours(2);
    dst_end.setHours(2);
    return (dst_start < date && date < dst_end) ? "PDT" : "PST";
  }
  function normalizeTimeZone(str, date) {
    var dst = daylightSavings[str];
    if (dst) {
      return normalizeDST(new Date(date), dst[0], dst[1]);
    }
    return str;
  }
  function normalizeTime(str) {
    var m = str.match(/^(\d{1,2})\s*([AP]M)$/i);
    if (m) {
      return m[1] + ":00 " + m[2];
    }
    return str;
  }
  // DatePattern
  function DatePattern(arg) {
    var pattern, resultFunc, re, h = {};
    if (arg.constructor == Object) {
      pattern = arg.pattern;
      resultFunc = arg.result;
    } else {
      pattern = arg;
      resultFunc = function(match) {
        return dateString(new Date(match[h["date"]] + " " + normalizeTime(match[h["time"]]) + " " + normalizeTimeZone(match[h["tz"]])));
      };
    }

    if (pattern == RegExp) {
      re = pattern
    } else if (pattern.constructor == Array)  {
      var i = 1, r = "";
      each(pattern, function(pp) {
        if (typeof(pp) == "string") {
          r += rr[pp].source
          h[pp] = i++;
        } else {
          r += pp.source
        }
      });
      re = new RegExp(r, "i")
    }
    return {
      pattern: re,
      result: resultFunc,
    };
  };
  
var _ = {
  patterns: [
    // e.g. "Sep 10, 2013 10:00 PDT"
    DatePattern(["date", /\s+/, "time", /\s+/, "tz"]),
    // e.g. "4 pm US/Pacific on Sep 11 2013"
    DatePattern(["time", /\s+/, "tz", /\s+(?:on)?\s+/, "date"]),
    DatePattern({
      pattern: ["date", /\s+/, "time", /\s+-\s+/, "time", /\s+/, "tz"],
      result: function(m) {
        var from = new Date(m[1] + " " + normalizeTime(m[2]) + " " + normalizeTimeZone(m[4], m[1]))
        var to = new Date(m[1] + " " + normalizeTime(m[3]) + " " + normalizeTimeZone(m[4], m[1]))
        return dateString(from) + " - " + dateString(to);
      }
    }),

    UnitPattern(/(?:miles?|mi|ml)/i, 1.60935, "km"),
    UnitPattern(/(?:sq|square)\s+(?:ft|feet)/i, 0.09290304, "m2"),
    UnitPattern(/(?:'|foot|feet|ft)/i, 0.3048, "m"),
    UnitPattern(/(?:\"|inch|inches|in)/i, 2.54, "cm"),
    UnitPattern(/(?:yards?|yd)/i, 0.9144, "m"),
    UnitPattern(/(?:pounds?|lb)/i, 0.454, "kg"),
    UnitPattern(/(?:ounces?|oz)/i, 28.35, "g"),
    UnitPattern(/(?:gallons?|gal)/i, 4.54609, "L"),
    UnitPattern(/(?:pints?|pt)/i , 0.56826125 , "L")
  ],
  search: function (node) {
    var text = node.data
    each(this.patterns, function(p) {
      var re = new RegExp(p.pattern.source, "ig"), m;
      //for (i=0; (m = re.exec(text)) != null && i < 3; i++) {
      while ((m = re.exec(text)) != null) {
        try {
          node.data = node.data.replace(m[0], m[0] + " (" + p.result.call(p, m) + ")");
        } catch (e) {
          console.log(e);
        }
      }
    });
  },
  traverseNode: function (node) {
    //console.debug(node);
    switch (node.nodeType) {
    case 1: //ELEMENT_NODE
      _.traverseNodes(node.childNodes)
      break;
      // case 2: //ATTRIBUTE_NODE
      //   break;
    case 3: //TEXT_NODE
      _.search(node);
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
    each(nodes, function(node) {
      _.traverseNode(node);
    });
  }
};
_.traverseNodes(global.document.getElementsByTagName("body"));
})(window);
