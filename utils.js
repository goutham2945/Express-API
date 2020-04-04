const getPaginatedResults = function(req, results){
    self = results ? results: this
    const pageNo = req.query.pageno ? parseInt(req.query.pageno) : 1
    const perPage = req.query.perpage ? parseInt(req.query.perpage) : 10
    return self.skip((pageNo-1) * perPage).limit(perPage);
}

module.exports = {
    getPaginatedResults
}