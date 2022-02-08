var mongoose = require('mongoose');
const { DateTime } = require("luxon");


var Schema = mongoose.Schema;

var VendorSchema = new Schema(
    {
        company_name: { type: String, required: true, maxLength: 100 },
        description: { type: String, required: true },
        company_url: { type: String },
        register_date: { type: Date },
    }
);

// Virtual for vendor's URL
VendorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/vendor/' + this._id;
    });


VendorSchema
    .virtual('register_date_f')
    .get(function () {
        return DateTime.fromJSDate(this.register_date).toLocaleString(DateTime.DATE_MED);
    });

VendorSchema
    .virtual('register_date_only')
    .get(function () {
        return DateTime.fromJSDate(this.register_date).toFormat('yyyy-MM-dd');
    });

//Export model
module.exports = mongoose.model('Vendor', VendorSchema);