const config = require("./config")

const getPaginatedResults = async function(req, results){
    self = results ? results: this
    const pageNo = req.query.pageno ? parseInt(req.query.pageno) : 1
    const perPage = req.query.perpage ? parseInt(req.query.perpage) : config.DEF_PER_PAGE_COUNT
    return await self.skip((pageNo-1) * perPage).limit(perPage);
}

module.exports = {
    getPaginatedResults
}