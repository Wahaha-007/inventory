var Vendor = require('../models/vendor');
var async = require('async');
var Item = require('../models/item');
const { body, validationResult } = require('express-validator');


// Display list of all vendors.
exports.vendor_list = function (req, res) {
  Vendor.find()
    .sort([['company_name', 'ascending']])
    .exec(function (err, list_vendors) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('vendor_list', { title: 'Vendor List', vendor_list: list_vendors });
    });
};

// Display detail page for a specific vendor.
exports.vendor_detail = function (req, res) {

  async.parallel({
    vendor: function (callback) {
      Vendor.findById(req.params.id)
        .exec(callback)
    },
    vendor_items: function (callback) {
      Item.find({ 'vendor': req.params.id }, 'name description')
        .exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); } // Error in API usage.
    if (results.vendor == null) { // No results.
      var err = new Error('Vendor not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('vendor_detail', { title: 'Vendor Detail', vendor: results.vendor, vendor_items: results.vendor_items });
  });
};

// Display vendor create form on GET.
exports.vendor_create_get = function (req, res) {
  res.render('vendor_form', { title: 'Create Vendor' });
};

// Handle vendor create on POST.
exports.vendor_create_post = [

  // Validate and sanitize fields.
  // body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
  //     .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  // body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
  //     .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
  // body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),

  body('company_name', 'Company name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description required').trim().isLength({ min: 1 }).escape(),
  body('register_date', 'Invalid date format').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('vendor_form', { title: 'Create Vendor', vendor: req.body, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      var vendor = new Vendor(
        {
          company_name: req.body.company_name,
          description: req.body.description,
          register_date: req.body.register_date
        });
      vendor.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new author record.
        res.redirect(vendor.url);
      });
    }
  }
];

// Display vendor delete form on GET.
exports.vendor_delete_get = function (req, res, next) {

  async.parallel({
    vendor: function (callback) {
      Vendor.findById(req.params.id).exec(callback)
    },
    vendor_items: function (callback) {
      Item.find({ 'vendor': req.params.id }).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.vendor == null) { // No results.
      res.redirect('/catalog/vendors');
    }
    // Successful, so render.
    res.render('vendor_delete', { title: 'Delete Vendor', vendor: results.vendor, vendor_items: results.vendor_items });
  });

};


// Handle vendor delete on POST.
exports.vendor_delete_post = function (req, res, next) {

  async.parallel({
    vendor: function (callback) {
      Vendor.findById(req.body.vendorid).exec(callback)
    },
    vendor_items: function (callback) {
      Item.find({ 'vendor': req.body.vendorid }).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success
    if (results.vendor_items.length > 0) {
      // Vendor has items. Render in same way as for GET route.
      res.render('vendor_delete', { title: 'Delete Vendor', vendor: results.vendor, vendor_items: results.vendor_items });
      return;
    }
    else {
      // Author has no books. Delete object and redirect to the list of authors.
      Vendor.findByIdAndRemove(req.body.vendorid, function deleteVendor(err) {
        if (err) { return next(err); }
        // Success - go to author list
        res.redirect('/catalog/vendors')
      })
    }
  });
};


// Display vendor update form on GET.
exports.vendor_update_get = function (req, res, next) {

  async.parallel({
    vendor: function (callback) {
      Vendor.findById(req.params.id).exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.vendor == null) { // No results.
      var err = new Error('Vendor not found');
      err.status = 404;
      return next(err);
    }

    res.render('vendor_form', { title: 'Update Vendor', vendor: results.vendor });
  });
};

// Handle vendor update on POST.
exports.vendor_update_post = [

  // Validate and sanitize fields.
  body('company_name', 'Company name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description required').trim().isLength({ min: 1 }).escape(),
  body('register_date', 'Invalid date format').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    var vendor = new Vendor(
      {
        company_name: req.body.company_name,
        description: req.body.description,
        register_date: req.body.register_date,
        _id: req.params.id //This is required, or a new ID will be assigned!
      });

    if (!errors.isEmpty()) {
      res.render('vendor_form', { title: 'Update Vendor', vendor: vendor, errors: errors.array() });
    }
    else {
      // Data from form is valid. Update the record.
      Vendor.findByIdAndUpdate(req.params.id, vendor, function (err, thevendor) {
        if (err) { return next(err); }
        // Successful - redirect to book detail page.
        res.redirect(thevendor.url);
      });
    }
  }
];