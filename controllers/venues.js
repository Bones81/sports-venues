const express = require('express');
const { db } = require('../models/venue.js');
const router = express.Router();
const Venue = require('../models/venue.js')

//___________________
// Routes
//___________________
//localhost:3000
// START PAGE ROUTE
router.get('/' , (req, res) => {
  Venue.countDocuments({}, (err, count) => {
    res.render('start.ejs', {
      tabTitle: 'Venues',
      numVenues: count
    });
  })
});

// INDEX ROUTE
router.get('/venues', (req, res) => {
  Venue.find({}, (err, allVenues) => {
    Venue.countDocuments({}, (err, count) => {
      res.render('index.ejs', {
        tabTitle: 'Venues Home Page',
        venues: allVenues,
        venuesCount: count
      })
    })
  })
})

// NEW ROUTE
router.get('/venues/new', (req, res) => {
  res.render('new.ejs', {
    tabTitle: 'Add New Venue'
  })
})

// SHOW ROUTE
router.get('/venues/:id', (req, res) => {
  Venue.findById(req.params.id, (err, foundVenue) => {
    res.render('show.ejs', {
      tabTitle: foundVenue.name + ' | Details',
      venue: foundVenue,
    })
  })
})

// CREATE ROUTE
router.post('/venues', (req, res) => {
  //reformat form data to match schema
  req.body.nicknames = req.body.nicknames.split(', ')
  if(req.body.stillExists === "on") {
    req.body.stillExists = true 
  } else {
    req.body.stillExists = false
  }
  req.body.sSports = req.body.sSports.split(', ')
  req.body.sTeams = req.body.sTeams.split(', ')
  
  req.body.links = {} // must initialize 'links' as a key of the data object before you can assign values to it!
  req.body.links.website = req.body.website
  req.body.links.twitter = req.body.twitter
  req.body.links.fb = req.body.fb
  req.body.links.ig = req.body.ig

  // res.send(req.body)
  Venue.create(req.body, (err, createdVenue) => {
    res.redirect('/venues')
  })
})

// EDIT ROUTE
router.get('/venues/:id/edit', (req, res) => {
  Venue.findById(req.params.id, (err, foundVenue) => {
    res.render('edit.ejs', {
      tabTitle: 'Edit ' + foundVenue.name,
      venue: foundVenue
    })
  })
})

// UPDATE ROUTE
router.put('/venues/:id', (req, res) => {
  //reformat form data to match schema

  req.body.nicknames = req.body.nicknames.split(', ')
  if(req.body.stillExists === "on") {
    req.body.stillExists = true 
  } else {
    req.body.stillExists = false
  }
  req.body.sSports = req.body.sSports.split(', ')
  req.body.sTeams = req.body.sTeams.split(', ')

  req.body.links = {} // must initialize 'links' as a key of the data object before you can assign values to it!
  req.body.links.website = req.body.website
  req.body.links.twitter = req.body.twitter
  req.body.links.fb = req.body.fb
  req.body.links.ig = req.body.ig
  
  Venue.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, foundVenue) => {
    res.redirect('/venues')
  })
})

//DELETE ROUTE
router.delete('/venues/:id', (req, res) => {
  Venue.findByIdAndRemove(req.params.id, (err, droppedVenue) => {
    res.redirect('/venues')
  })
})

//SEARCH ROUTE
router.post('/venues/search', (req, res) => {
  // This SO article helped me understand how to implement text search over the entire collection: https://stackoverflow.com/questions/47929774/optimization-find-on-all-fields-in-mongoose-mongodb-schema
  Venue.collection.createIndex( { "$**": "text"} )
  Venue.find({ $text: { $search: req.body.searchString} }, (err, searchResults) => {
    res.render('index.ejs', {
      tabTitle: 'Search results',
      venues: searchResults,
      venuesCount: searchResults.length
    })
    
  })
})

//SORT ROUTE
router.post('/venues/sort', (req, res) => {
  // res.send(req.body.sortChoice)
  Venue.find({}, (err, venues) => {
    venues.sort((a, b) => {
      let aCompareValue = a[req.body.sortChoice]
      let bCompareValue = b[req.body.sortChoice]
      //The below logic converts string value of year, cost, and capacity fields into numerically comparable fields, since numbers don't compare properly when they are read as strings.
      if (req.body.sortChoice === 'year' || 
          req.body.sortChoice === "cost" || 
          req.body.sortChoice === "capacity") {
        // This blog post helped me understand how to remove commas from numbers-as-strings: https://bobbyhadz.com/blog/javascript-parse-string-with-comma-to-number
        let aScrubbedValue = aCompareValue.replace(/,/g, '') 
        let bScrubbedValue = bCompareValue.replace(/,/g, '')
        aScrubbedValue = aScrubbedValue.split(' ')[0]
        bScrubbedValue = bScrubbedValue.split(' ')[0]
        aScrubbedValue = Number(aScrubbedValue)
        bScrubbedValue = Number(bScrubbedValue)
        // console.log(a.name + '\'s comma-removed, split, and Numbered value is: ' + aScrubbedValue)
        // console.log(b.name + '\'s comma-removed, split, and Numbered value is: ' + bScrubbedValue)
        aScrubbedValue = aScrubbedValue || 0 // converts any falsey value (like NaN) to 0; found this solution via https://stackoverflow.com/questions/7540397/convert-nan-to-0-in-javascript
        bScrubbedValue = bScrubbedValue || 0 // converts any falsey value to 0
        
        if (aCompareValue.includes('million')) {
          aScrubbedValue *= 1000000
        } else if (aCompareValue.includes('billion')) {
          aScrubbedValue *= 1000000000
        }
        if (bCompareValue.includes('million')) {
          bScrubbedValue *= 1000000
        } else if (bCompareValue.includes('billion')) {
          bScrubbedValue *= 1000000000
        }
        // console.log(a.name + "\'s aScrubbedValue is: " + aScrubbedValue)
        // console.log(b.name + "\'s bScrubbedValue is: " + bScrubbedValue)
        aCompareValue = aScrubbedValue
        bCompareValue = bScrubbedValue
      } // This line ends the conversion of string values into numbers for year, cost, and capacity fields. 

      if (aCompareValue > bCompareValue) {
        return 1
      } else if (aCompareValue < bCompareValue) {
        return -1
      } else {
        return 0
      }
    })
    res.render('index.ejs', {
      tabTitle: 'Sort results',
      venues: venues,
      venuesCount: venues.length
    })
  })
})

module.exports = router