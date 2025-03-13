const path = require('path');
const hbs = require('hbs');

function registerHelpers() {
    hbs.registerHelper("DateTime", function (value) {
        return value.toLocaleString();
    });
    hbs.registerHelper("DateTime2", function (value) {
        if (!value) return '';
        let year = value.getFullYear().toString();
        let month = (value.getMonth() + 1).toString().padStart(2, '0');
        let day = value.getDate().toString().padStart(2, '0');
        let hours = value.getHours().toString().padStart(2, '0');
        let minutes = value.getMinutes().toString().padStart(2, '0');

        let formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        return formattedDateTime;
    });
    hbs.registerPartials(path.join(process.cwd(), 'views/partials'));

    hbs.registerHelper('inc', function (value, options) {
        return parseInt(value) + 1;
        //Hello Test 
    });

    hbs.registerHelper('eq', function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
    hbs.registerHelper('eql', function (a, b) {
        return a === b;
    });

    hbs.registerHelper("i", function (value) {
        return parseInt(value) + 1;
    });
    hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    hbs.registerHelper('if_eq', function (a, b, options) {
        if (a == b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    hbs.registerHelper("diffForHumans", function (value) {
        return value.toLocaleString();
    });

    hbs.registerHelper('formatDate', function (date, format) {
        if (!date) return 'N/A';
        return moment(date).format(format);
    });
    hbs.registerHelper("eql", (a, b) => a === b);




}

module.exports = registerHelpers;