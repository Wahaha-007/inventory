#! /usr/bin/env node

console.log('This script populates some test books, vendors, categorys and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Vendor = require('./models/vendor')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var vendors = []
var categories = []
var items = []

function vendorCreate(company_name, description, company_url, register_date, cb) {
    let vendordetail = { company_name: company_name, description: description };
    if (company_url != false) vendordetail.company_url = company_url;
    if (register_date != false) vendordetail.register_date = register_date;

    const vendor = new Vendor(vendordetail);

    vendor.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Vendor: ' + vendor);
        vendors.push(vendor);
        cb(null, vendor);
    });
}

function categoryCreate(name, description, cb) {
    const category = new Category({ category_name: name, description: description });

    category.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Category: ' + category);
        categories.push(category);
        cb(null, category);
    });
}

function itemCreate(name, description, category, vendor, price, stock, pic_url, cb) {
    let itemdetail = {
        name: name,
        description: description,
        category: category,
        vendor: vendor,
        price: price,
        stock: stock
    }
    if (pic_url != false) itemdetail.pic_url = pic_url;

    var item = new Item(itemdetail);
    item.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Item: ' + item);
        items.push(item);
        cb(null, item);
    });
}

// function vendorCreate(company_name, description, address, company_url, register_date, cb)
// function categoryCreate(name, description, cb)

function createCategoryVendors(cb) {
    async.series([
        function (callback) {
            vendorCreate('Jaeger-LeCoultre', 'Established in 1833 in the Swiss Jura Mountains, Jaeger-LeCoultre is known for its clever designs. One of its most notable—and coveted—styles, the Reverso, features a face that flips over to protect itself within the watch casing.', false, '1833-06-06', callback);
        },
        function (callback) {
            vendorCreate('Audemars Piguet', 'Founded by childhood friends Jules-Louis Audemars and Edward-Auguste Piguet in 1875, Audemars Piguet is perhaps most famous for its Royal Oak collection, which, since its debut in 1972, has become an obligatory status symbol for every A-lister from hip hop legends to elite athletes. Now it has some competition: In 2019, the brand released a new collection, Code 11.59.', false, '1875-11-8', callback);
        },
        function (callback) {
            vendorCreate('Frédérique Constant', "Founded in 1988 by Dutch couple Peter Stas and Aletta Stas-Bax, Frédérique Constant's mission statement is to craft fine luxury watches using Swiss techniques but sold at a relatively accessible price point.", false, '1988-01-02', callback);
        },
        function (callback) {
            vendorCreate('Piaget', 'Georges-Édouard Piaget set up his first workshop on his family farm in the village of La Côte-aux-Fées in the Swiss mountains in 1874, launching the brand that is now famous for offering the thinnest automatic watch in the world.', false, '1874-01-01', callback);
        },
        function (callback) {
            vendorCreate('Cartier', 'Louis-François Cartier founded the jewelry brand in Paris in 1847. Seventy years later, his grandson Louis Cartier invented the famous Tank Watch, which was modeled after a military tank. Several iconic watch models have followed since, including this Baignoire Allongée.', false, '1847-12-16', callback);
        },
        function (callback) {
            vendorCreate('Blancpain', "Founded in 1735, Blancpain enjoys the esteemed distinction of being the oldest surviving watch brand in the world. In the 1950s, it introduced the Fifty Fathoms diving watches, which were crafted in collaboration with the French Navy's combat swimmers and soon became the standard issue of the US Navy SEALs.", false, '1735-5-18', callback);
        },
        function (callback) {
            categoryCreate('Chronograph', "Using a chronograph is easy. You just press the start/stop button on the side of the watch to start or stop the stopwatch; push the bottom button to reset back to zero.", callback);
        },
        function (callback) {
            categoryCreate('Pilot', "Gracing the wrist of pilots, these aviation timepieces have reached the apex of the ideal fusion of style and durability. From the Fortis Aviatis collection to squadron watches, pilot watches are tough and ready for anything. ", callback);
        },
        function (callback) {
            categoryCreate("Dress", "A dress watch is the most elegant of watches. It has one purpose and that is to tell time. It need not have complications.", callback);
        },
    ],
        // optional callback
        cb);
}

// function itemCreate(name, description, category, vendor, price, stock, pic_url, cb) 

function createItems(cb) {
    async.parallel([
        function (callback) {
            itemCreate('Harry Winston Premier Precious Kaleidoscope Automatic 36mm', 'Bold colors and geometric shapes, accented with the famous diamonds and precious stones of Harry Winston enliven the Premier Precious Kaleidoscope Automatic 36mm, an hypnotizing timepiece inspired by its magical namesake.', [categories[0],], vendors[0], 485000, 30, false, callback);
        },
        function (callback) {
            itemCreate("ROYAL OAK", 'This 37 mm timepiece benefits from the new Royal Oak design evolution. Its two-tone case marrying stainless steel with 18-carat pink gold is embellished with a silver-toned “Grande Tapisserie” dial. It houses the new selfwinding Calibre 5900, fitted with the "50-years" oscillating weight in rhodium-toned pink gold.', [categories[0],], vendors[1], 1285000, 20, false, callback);
        },
        function (callback) {
            itemCreate("Art Deco FC-200MPW2AR6B", 'Perfectly reflects the luxury taste with Watches from FREDERIQUE CONSTANT Stainless Steel Silver white dial case 30mm.sapphire crystal water - resistant 3 atm strap stainless steel silver bracelet', [categories[0],], vendors[3], 18000, 5, false, callback);
        },
    ],
        // optional callback
        cb);
}


async.series([
    createCategoryVendors,
    createItems
],
    // Optional callback
    function (err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        }
        // All done, disconnect from database
        mongoose.connection.close();
    });
