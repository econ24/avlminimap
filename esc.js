(function() {
	var esc = {
		version: "0.0.3"
	}
		
	esc.randInt = function(min, max) {
	/*
	Returns an integer in the range [min, max].
	*/
            if (!arguements.length) {
                  return Math.round(Math.random());
            }
            if (arguments.length === 1) {
                  return Math.round(Math.random()*min);
            }
            if (min > max) {
                  min = min - max;
                  max = min + max;
                  min = max - min;
            }
		return Math.round(Math.random()*(max-min))+min;
	};
	
	esc.capitalize = function (string) {
	/*
	Capitalizes the first character of the argument string and returns result.
	*/
		var i = 0;
		while (/\s/.test(string.charAt(i))) {
			++i;
		}
		return string.slice(0, i) + string.charAt(i).toUpperCase() + string.slice(i+1)
	};
	
	esc.capitalizeAll = function (string, seperator) {
	/*
	Capitalizes all words in the argument string. Also eliminates extraneous
	whitespace within the string. Returns the result.
	An optional seperator can be specified. It is used to split the string
	before capitalizing each word.
	*/
		seperator = seperator || " ";
		string = string.split(seperator);
		var temp = [];
		string.forEach(function(d, i) {
			if (string[i].length > 0)
				temp.push(esc.capitalize(string[i]));
		});
		return temp.join(' ');
	}
	this.esc = esc;

      esc.fips2state = function(fips, abbrev) {
            var fipsMap = {
                  02: {abbrev: 'AK', full: 'Alaska'},
                  01: {abbrev: 'AL', full: 'Alabama'},
                  05: {abbrev: 'AR', full: 'Arkansas'},
                  60: {abbrev: 'AS', full: 'American Samoa'},
                  04: {abbrev: 'AZ', full: 'Arizona'},
                  06: {abbrev: 'CA', full: 'California'},
                  08: {abbrev: 'CO', full: 'Colorado'},
                  09: {abbrev: 'CT', full: 'Connecticut'},
                  11: {abbrev: 'DC', full: 'District of Columbia'},
                  10: {abbrev: 'DE', full: 'Delaware'},
                  12: {abbrev: 'FL', full: 'Florida'},
                  13: {abbrev: 'CT', full: 'Georgia'},
                  66: {abbrev: 'CT', full: 'Guam'},
                  15: {abbrev: 'CT', full: 'Hawaii'},
                  19: {abbrev: 'CT', full: 'Iowa'},
                  16: {abbrev: 'ID', full: 'Idaho'},
                  17: {abbrev: 'IL', full: 'Illinois'},
                  18: {abbrev: 'IN', full: 'Indiana'},
                  20: {abbrev: 'KS', full: 'Kansas'},
                  21: {abbrev: 'KY', full: 'Kentucky'},
                  22: {abbrev: 'LA', full: 'Louisiana'},
                  25: {abbrev: 'MA', full: 'Massachusetts'},
                  24: {abbrev: 'MD', full: 'Maryland'},
                  23: {abbrev: 'ME', full: 'Maine'},
                  26: {abbrev: 'MI', full: 'Michigan'},
                  27: {abbrev: 'MN', full: 'Minnesota'},
                  29: {abbrev: 'MO', full: 'Missouri'},
                  28: {abbrev: 'MS', full: 'Mississippi'},
                  30: {abbrev: 'MT', full: 'Montana'},
                  37: {abbrev: 'NC', full: 'North Carolina'},
                  38: {abbrev: 'ND', full: 'North Dakota'},
                  31: {abbrev: 'NE', full: 'Nebraska'},
                  33: {abbrev: 'NH', full: 'New Hampshire'},
                  34: {abbrev: 'NJ', full: 'New Jersey'},
                  35: {abbrev: 'NM', full: 'New Mexico'},
                  32: {abbrev: 'NV', full: 'Nevada'},
                  36: {abbrev: 'NY', full: 'New York'},
                  39: {abbrev: 'OH', full: 'Ohio'},
                  40: {abbrev: 'OK', full: 'Oklahoma'},
                  41: {abbrev: 'OR', full: 'Oregon'},
                  42: {abbrev: 'PA', full: 'Pennsylvania'},
                  72: {abbrev: 'PR', full: 'Puerto Rico'},
                  44: {abbrev: 'RI', full: 'Road Island'},
                  45: {abbrev: 'SC', full: 'South Carolina'},
                  46: {abbrev: 'SD', full: 'South Dakota'},
                  47: {abbrev: 'TN', full: 'Tennessee'},
                  48: {abbrev: 'TX', full: 'Texas'},
                  49: {abbrev: 'UT', full: 'Utah'},
                  51: {abbrev: 'VA', full: 'Virginia'},
                  78: {abbrev: 'VI', full: 'Virgin Islands'},
                  50: {abbrev: 'VT', full: 'Vermont'},
                  53: {abbrev: 'WA', full: 'Washington'},
                  55: {abbrev: 'WI', full: 'Wisconsin'},
                  54: {abbrev: 'WV', full: 'West Virginia'},
                  56: {abbrev: 'WY', full: 'Wyoming'}
            }
            return abbrev ? fipsMap[+fips].abbrev || fips : fipsMap[+fips].full || fips;
      }

      this.esc = esc;
})();
