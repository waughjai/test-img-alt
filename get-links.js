const Read = require( 'fs' ).readFileSync;

const GetLinks = function( content )
{
	const REGEXP = RegExp( 'http:\/\/[-a-zA-Z.\/_()0-9]+', 'g' );
	let match;
	let matches = [];

	while ( ( match = REGEXP.exec( content ) ) !== null )
	{
		matches.push( match[ 0 ] );
	}

	return matches;
};

module.exports = GetLinks( Read( "./sitemap.txt" ) );
console.log( module.exports );
//PrintLinks( module.exports );