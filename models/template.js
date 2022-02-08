const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Optional template from Net Ninja API course,  geolocation Schema
const GeoSchema = new Schema({
    type: {
        type: String,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        index: '2dsphere'
    }
});

const SomethingSchema = new Schema(
    {
        name: { type: String, required: true },
        category_name: { type: String, required: true, maxLength: 100 },
        description: { type: String, required: true },
        category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
        register_date: { type: Date },
        due_back: {type: Date, default: Date.now},
        geometry: GeoSchema
    }
);

// Virtual for item's URL
SomethingSchema
    .virtual('url')
    .get(function () {
        return '/catalog/something/' + this._id;
    });

//Export model
module.exports = mongoose.model('Something', SomethingSchema);