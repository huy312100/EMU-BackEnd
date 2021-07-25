var neo4j = require("neo4j-driver");

var driver = neo4j.driver(process.env.Neo4j_Connect_URI, neo4j.auth.basic(process.env.Neo4j_Username, process.env.Neo4j_Password));

exports.getSession = function (context) {
    if (context.neo4jSession) {
        return context.neo4jSession;
    } else {
        context.neo4jSession = driver.session();
        return context.neo4jSession;
    }
};