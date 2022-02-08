var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const { body, validationResult } = require("express-validator");

// Display list of all categorys.
exports.category_list = function (req, res) {
  Category.find()
    .sort([['category_name', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('category_list', { title: 'Category List', category_list: list_categories });
    });
};

// Display detail page for a specific category.
exports.category_detail = function (req, res) {
  async.parallel({
    category: function (callback) {
      Category.findById(req.params.id)
        .exec(callback);
    },

    category_items: function (callback) {
      Item.find({ 'category': req.params.id })
        .exec(callback);
    },

  }, function (err, results) {
    if (err) { return next(err); }
    if (results.category == null) { // No results.
      var err = new Error('Category not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items });
  });
};

// Display category create form on GET.
exports.category_create_get = function (req, res) {
  res.render('category_form', { title: 'Create Category' });
};

// Handle category create on POST.

exports.category_create_post = [

  // Validate and sanitize the name field.
  body('category_name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var category = new Category(
      {
        category_name: req.body.category_name,
        description: req.body.description,
      }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('category_form', { title: 'Create Category', category: category, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Category.findOne({ 'category_name': req.body.category_name })
        .exec(function (err, found_category) {
          if (err) { return next(err); }

          if (found_category) {
            // Category exists, redirect to its detail page.
            res.redirect(found_category.url);
          }
          else {

            category.save(function (err) {
              if (err) { return next(err); }
              // Category saved. Redirect to category detail page.
              res.redirect(category.url);
            });

          }

        });
    }
  }
];


// Display category delete form on GET.
exports.category_delete_get = function (req, res, next) {

  async.parallel({
    category: function (callback) {
      Category.findById(req.params.id).exec(callback)
    },
    category_items: function (callback) {
      Item.find({ 'category': req.params.id }).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.category == null) { // No results.
      res.redirect('/catalog/categories');
    }
    // Successful, so render.
    res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items });
  });

};

// Handle category delete on POST.
exports.category_delete_post = function (req, res, next) {

  async.parallel({
    category: function (callback) {
      Category.findById(req.body.categoryid).exec(callback)
    },
    category_items: function (callback) {
      Item.find({ 'category': req.body.categoryid }).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    // Success
    if (results.category_items.length > 0) {
      // Vendor has items. Render in same way as for GET route.
      res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items });
      return;
    }
    else {
      // Category has no items. Delete object and redirect to the list of categories.
      Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
        if (err) { return next(err); }
        // Success - go to author list
        res.redirect('/catalog/categories')
      })
    }
  });
};

// Display category update form on GET.
exports.category_update_get = function (req, res, next) {

  async.parallel({
    category: function (callback) {
      Category.findById(req.params.id).exec(callback);
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.category == null) { // No results.
      var err = new Error('Category not found');
      err.status = 404;
      return next(err);
    }

    res.render('category_form', { title: 'Update Category', category: results.category });
  });
};

// Handle category update on POST.
exports.category_update_post = [

  // Validate and sanitize fields.
  body('category_name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    var category = new Category(
      {
        category_name: req.body.category_name,
        description: req.body.description,
        _id: req.params.id //This is required, or a new ID will be assigned!
      });

    if (!errors.isEmpty()) {
      res.render('category_form', { title: 'Update Category', category: category, errors: errors.array() });
    }
    else {
      // Data from form is valid. Update the record.
      Category.findByIdAndUpdate(req.params.id, category, function (err, thecategory) {
        if (err) { return next(err); }
        // Successful - redirect to book detail page.
        res.redirect(thecategory.url);
      });
    }
  }
];