var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        pic_url: { type: String },
    }
);

// Virtual for item's URL
ItemSchema
    .virtual('url')
    .get(function () {
        return '/catalog/item/' + this._id;
    });

//Export model
module.exports = mongoose.model('Item', ItemSchema);
